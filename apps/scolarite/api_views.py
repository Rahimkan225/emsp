from collections import defaultdict
from decimal import Decimal

from django.db import connection
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminFamily, IsStudent
from apps.actualites.models import Article
from apps.actualites.serializers import ArticleListSerializer
from apps.comptabilite.models import Paiement
from apps.inscriptions.models import Candidature

from .demo import ensure_portal_demo_data
from .models import EmploiDuTempsItem, Etudiant, ForumPost, Note, Promotion, StudentDocument
from .serializers import (
    EmploiDuTempsSerializer,
    EtudiantSerializer,
    ForumPostSerializer,
    NoteSerializer,
    StudentDocumentSerializer,
)


class ForumCreateSerializer(serializers.Serializer):
    category = serializers.ChoiceField(choices=[choice[0] for choice in ForumPost.CATEGORY_CHOICES])
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()


def _student_for_user(user):
    return Etudiant.objects.select_related("user", "formation", "promotion", "photo").get(user=user)


def _weighted_average(notes):
    total_coeff = Decimal("0.00")
    total = Decimal("0.00")
    for note in notes:
        total_coeff += note.coefficient
        total += note.note * note.coefficient
    if not total_coeff:
        return Decimal("0.00")
    return (total / total_coeff).quantize(Decimal("0.01"))


def _format_currency(value):
    return f"{value:,.0f} FCFA".replace(",", " ")


def _media_url(request, media_item):
    if not media_item:
        return ""
    if getattr(media_item, "file", None):
        return request.build_absolute_uri(media_item.file.url)
    return media_item.video_url or ""


def _table_exists(table_name):
    return table_name in connection.introspection.table_names()


def _format_legacy_gender(value):
    normalized = (value or "").strip().upper()
    return {
        "M": "Masculin",
        "F": "Feminin",
    }.get(normalized, "Non renseigne")


def _build_legacy_students_response(search="", status_filter="", country="", formation=""):
    if status_filter == "inactive":
        return {
            "summary": {
                "total": 0,
                "active": 0,
                "inactive": 0,
                "promotions": 0,
                "outstanding_balance": 0,
            },
            "results": [],
        }

    if country and country not in {"EMSP", "LEGACY"}:
        return {
            "summary": {
                "total": 0,
                "active": 0,
                "inactive": 0,
                "promotions": 0,
                "outstanding_balance": 0,
            },
            "results": [],
        }

    if formation and "emsp" not in formation.lower() and "legacy" not in formation.lower():
        return {
            "summary": {
                "total": 0,
                "active": 0,
                "inactive": 0,
                "promotions": 0,
                "outstanding_balance": 0,
            },
            "results": [],
        }

    sql = "SELECT matricule, nom, sexe, age, contact, hobbies FROM etudiant"
    params = []
    clauses = []

    if search:
        like = f"%{search}%"
        clauses.append(
            "(matricule LIKE %s OR nom LIKE %s OR contact LIKE %s OR hobbies LIKE %s)"
        )
        params.extend([like, like, like, like])

    if clauses:
        sql += " WHERE " + " AND ".join(clauses)

    sql += " ORDER BY nom ASC, matricule ASC"

    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return {
        "summary": {
            "total": len(rows),
            "active": len(rows),
            "inactive": 0,
            "promotions": 1 if rows else 0,
            "outstanding_balance": 0,
        },
        "results": [
            {
                "id": index,
                "matricule": row.get("matricule", ""),
                "full_name": row.get("nom") or row.get("matricule", ""),
                "email": "",
                "phone": row.get("contact") or "",
                "formation_name": "Base etudiant EMSP",
                "formation_code": "EMSP",
                "promotion_label": "",
                "academic_year": "",
                "country": "EMSP",
                "country_label": "Base EMSP",
                "rank": 0,
                "balance": 0,
                "balance_label": _format_currency(Decimal("0.00")),
                "is_active": True,
                "status_label": "Disponible",
                "enrolled_at": "",
                "photo_url": "",
                "gender": (row.get("sexe") or "").strip().upper(),
                "gender_label": _format_legacy_gender(row.get("sexe")),
                "age": row.get("age"),
                "hobbies": row.get("hobbies") or "",
                "source": "emsp_legacy",
            }
            for index, row in enumerate(rows, start=1)
        ],
    }


def _build_legacy_academic_overview_response():
    legacy_payload = _build_legacy_students_response()
    total_students = legacy_payload["summary"]["total"]

    return {
        "summary": {
            "promotions": 1 if total_students else 0,
            "scheduled_courses": 0,
            "generated_documents": 0,
            "average_score": 0,
        },
        "promotions": [
            {
                "id": 1,
                "label": "Cohorte EMSP",
                "academic_year": "",
                "formation_name": "Base etudiant EMSP",
                "formation_code": "EMSP",
                "students_count": total_students,
            }
        ]
        if total_students
        else [],
        "upcoming_courses": [],
        "recent_documents": [],
        "top_students": [],
    }


class MeProfileApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        serializer = EtudiantSerializer(student, context={"request": request})
        return Response(serializer.data)


class MeDashboardApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        notes = list(student.notes.all())
        moyenne = _weighted_average(notes)

        semester_groups = defaultdict(list)
        for note in notes:
            semester_groups[f"{note.annee_academique}-{note.semestre}"].append(note)

        trend = []
        for key in sorted(semester_groups.keys()):
            semester_notes = semester_groups[key]
            trend.append(
                {
                    "label": key,
                    "average": float(_weighted_average(semester_notes)),
                }
            )

        upcoming_exam = (
            EmploiDuTempsItem.objects.filter(
                promotion=student.promotion,
                type="examen",
                debut__gte=timezone.now(),
            )
            .order_by("debut")
            .first()
        )
        if not upcoming_exam:
            upcoming_exam = (
                EmploiDuTempsItem.objects.filter(promotion=student.promotion).order_by("debut").first()
            )

        courses_qs = EmploiDuTempsItem.objects.filter(promotion=student.promotion).order_by("debut")[:3]
        news_qs = Article.objects.filter(is_published=True).select_related("cover")[:2]

        data = {
            "moyenne_generale": float(moyenne),
            "rang_promotion": student.rang_promotion,
            "prochain_examen": upcoming_exam.debut.strftime("%d/%m/%Y %H:%M") if upcoming_exam else "",
            "solde_scolarite": f"{student.solde_scolarite:,.0f} FCFA".replace(",", " "),
            "trend": trend,
            "prochains_cours": EmploiDuTempsSerializer(courses_qs, many=True).data,
            "actualites": ArticleListSerializer(news_qs, many=True, context={"request": request}).data,
        }
        return Response(data)


class MeNotesApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        grouped = defaultdict(list)

        for note in student.notes.all():
            grouped[(note.annee_academique, note.semestre)].append(note)

        payload = []
        for academic_year, semester in sorted(grouped.keys()):
            rows = grouped[(academic_year, semester)]
            credits = sum(row.credits for row in rows if row.note >= 10)
            average = _weighted_average(rows)
            payload.append(
                {
                    "key": f"{academic_year}-{semester}",
                    "label": f"{semester} - {academic_year}",
                    "semester": semester,
                    "academic_year": academic_year,
                    "rows": NoteSerializer(rows, many=True).data,
                    "totals": {
                        "average": float(average),
                        "credits": credits,
                        "result": "Admis" if average >= 10 else "Ajourne",
                    },
                    "download_url": "",
                }
            )

        return Response(payload)


class MeEdtApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        queryset = EmploiDuTempsItem.objects.filter(promotion=student.promotion).order_by("debut")

        limit = request.query_params.get("limit")
        if limit:
            try:
                queryset = queryset[: max(1, int(limit))]
            except ValueError:
                pass

        serializer = EmploiDuTempsSerializer(queryset, many=True)
        return Response(serializer.data)


class MeDocumentsApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        serializer = StudentDocumentSerializer(student.documents.all(), many=True, context={"request": request})
        return Response(serializer.data)


class MeForumApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        discussions = ForumPost.objects.select_related("author").all()
        categories = []
        for key, label in ForumPost.CATEGORY_CHOICES:
            categories.append(
                {
                    "key": key,
                    "label": label,
                    "count": discussions.filter(category=key).count(),
                }
            )

        return Response(
            {
                "categories": categories,
                "discussions": ForumPostSerializer(discussions, many=True).data,
            }
        )

    def post(self, request):
        ensure_portal_demo_data()
        serializer = ForumCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = ForumPost.objects.create(author=request.user, **serializer.validated_data)
        return Response(ForumPostSerializer(post).data, status=status.HTTP_201_CREATED)


class AdminDashboardApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        if _table_exists("etudiant"):
            legacy_payload = _build_legacy_students_response()
            total_students = legacy_payload["summary"]["total"]
            current_year = timezone.now().year

            latest_inscriptions = [
                {
                    "id": item["id"],
                    "name": item["full_name"],
                    "country": item["country_label"],
                    "formation": item["formation_name"],
                    "date": "",
                    "status": item["status_label"],
                    "matricule": item["matricule"],
                    "photo_url": item["photo_url"],
                }
                for item in legacy_payload["results"][:5]
            ]

            return Response(
                {
                    "kpis": {
                        "total_students": total_students,
                        "recovery_rate": 0,
                        "success_rate": 0,
                        "pending_applications": Candidature.objects.filter(status__in=["submitted", "under_review"]).count(),
                    },
                    "country_distribution": [{"pays": "Base EMSP", "total": total_students}] if total_students else [],
                    "formation_distribution": [{"formation__nom": "Base etudiant EMSP", "total": total_students}] if total_students else [],
                    "yearly_enrolments": [
                        {"year": str(current_year - 1), "total": 0},
                        {"year": str(current_year), "total": total_students},
                    ],
                    "monthly_finance": [
                        {"label": "Jan", "paid": 0, "due": 0},
                        {"label": "Fev", "paid": 0, "due": 0},
                        {"label": "Mar", "paid": 0, "due": 0},
                        {"label": "Avr", "paid": 0, "due": 0},
                        {"label": "Mai", "paid": 0, "due": 0},
                        {"label": "Juin", "paid": 0, "due": 0},
                    ],
                    "latest_inscriptions": latest_inscriptions,
                }
            )

        ensure_portal_demo_data()

        students = Etudiant.objects.select_related("formation", "user").all()
        notes = Note.objects.all()
        payments = Paiement.objects.all()

        total_students = students.count()
        paid_amount = payments.filter(statut="confirmed").aggregate(total=Sum("montant"))["total"] or Decimal("0.00")
        due_amount = students.aggregate(total=Sum("solde_scolarite"))["total"] or Decimal("0.00")
        recovery_rate = float((paid_amount / (paid_amount + due_amount) * 100) if (paid_amount + due_amount) else 0)

        student_averages = []
        for student in students:
            average = _weighted_average(list(student.notes.all()))
            if average:
                student_averages.append(average)
        success_rate = 0.0
        if student_averages:
            success_rate = round(
                len([value for value in student_averages if value >= 10]) / len(student_averages) * 100,
                2,
            )

        pending_applications = Candidature.objects.filter(status__in=["submitted", "under_review"]).count()

        country_data = list(students.values("pays").annotate(total=Count("id")).order_by("pays"))
        formation_data = list(students.values("formation__nom").annotate(total=Count("id")).order_by("-total"))
        monthly_finance = []
        for index in range(1, 7):
            paid = payments.filter(created_at__month=index, statut="confirmed").aggregate(total=Sum("montant"))["total"] or Decimal("0.00")
            monthly_finance.append(
                {
                    "label": f"M{index}",
                    "paid": float(paid),
                    "due": float(max(due_amount / Decimal("6"), Decimal("0.00"))),
                }
            )

        recent_students = students.order_by("-enrolled_at")[:5]
        if recent_students:
            latest_inscriptions = [
                {
                    "id": item.id,
                    "name": item.user.full_name,
                    "country": item.pays,
                    "formation": item.formation.nom,
                    "date": item.enrolled_at.strftime("%d/%m/%Y"),
                    "status": "Actif" if item.is_active else "Suspendu",
                    "matricule": item.matricule,
                    "photo_url": item.photo.url if item.photo else "",
                }
                for item in recent_students
            ]
        else:
            latest_inscriptions = []

        current_year = timezone.now().year
        evolution = [
            {"year": str(current_year - 3), "total": 0},
            {"year": str(current_year - 2), "total": 0},
            {"year": str(current_year - 1), "total": 0},
            {"year": str(current_year), "total": total_students},
        ]

        return Response(
            {
                "kpis": {
                    "total_students": total_students,
                    "recovery_rate": round(recovery_rate, 2),
                    "success_rate": success_rate,
                    "pending_applications": pending_applications,
                },
                "country_distribution": country_data,
                "formation_distribution": formation_data,
                "yearly_enrolments": evolution,
                "monthly_finance": monthly_finance,
                "latest_inscriptions": latest_inscriptions,
            }
        )


class AdminStudentListApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip().lower()
        country = request.query_params.get("country", "").strip().upper()
        formation = request.query_params.get("formation", "").strip()

        if _table_exists("etudiant"):
            return Response(
                _build_legacy_students_response(
                    search=search,
                    status_filter=status_filter,
                    country=country,
                    formation=formation,
                )
            )

        ensure_portal_demo_data()

        queryset = Etudiant.objects.select_related("user", "formation", "promotion", "photo")

        if search:
            queryset = queryset.filter(
                Q(matricule__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
            )
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)
        if country:
            queryset = queryset.filter(pays__iexact=country)
        if formation:
            queryset = queryset.filter(
                Q(formation__code__iexact=formation)
                | Q(formation__nom__icontains=formation)
            )

        students = list(queryset.order_by("user__last_name", "user__first_name"))
        outstanding_balance = sum(student.solde_scolarite for student in students)

        return Response(
            {
                "summary": {
                    "total": len(students),
                    "active": len([student for student in students if student.is_active]),
                    "inactive": len([student for student in students if not student.is_active]),
                    "promotions": len({student.promotion_id for student in students if student.promotion_id}),
                    "outstanding_balance": float(outstanding_balance),
                },
                "results": [
                    {
                        "id": student.id,
                        "matricule": student.matricule,
                        "full_name": student.user.full_name,
                        "email": student.user.email,
                        "phone": student.user.phone,
                        "formation_name": student.formation.nom,
                        "formation_code": student.formation.code,
                        "promotion_label": student.promotion.label if student.promotion else "",
                        "academic_year": student.promotion.academic_year if student.promotion else "",
                        "country": student.pays,
                        "country_label": student.get_pays_display(),
                        "rank": student.rang_promotion,
                        "balance": float(student.solde_scolarite),
                        "balance_label": _format_currency(student.solde_scolarite),
                        "is_active": student.is_active,
                        "status_label": "Actif" if student.is_active else "Suspendu",
                        "enrolled_at": student.enrolled_at,
                        "photo_url": _media_url(request, student.photo),
                        "gender": "",
                        "gender_label": "",
                        "age": None,
                        "hobbies": "",
                        "source": "django_portal",
                    }
                    for student in students
                ],
            }
        )


class AdminAcademicOverviewApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        if _table_exists("etudiant"):
            return Response(_build_legacy_academic_overview_response())

        ensure_portal_demo_data()

        promotions = (
            Promotion.objects.select_related("formation")
            .annotate(students_count=Count("etudiants"))
            .order_by("-year_start", "label")
        )
        upcoming_courses = (
            EmploiDuTempsItem.objects.select_related("promotion", "promotion__formation")
            .order_by("debut")[:8]
        )
        recent_documents = (
            StudentDocument.objects.select_related("etudiant__user", "etudiant__formation", "etudiant__promotion")
            .order_by("-is_generated", "-generated_at", "-id")[:8]
        )

        students = list(
            Etudiant.objects.select_related("user", "formation", "promotion").prefetch_related("notes")
        )
        top_students = []
        averages = []
        for student in students:
            average = float(_weighted_average(list(student.notes.all())))
            if average <= 0:
                continue
            averages.append(average)
            top_students.append(
                {
                    "id": student.id,
                    "full_name": student.user.full_name,
                    "matricule": student.matricule,
                    "formation_name": student.formation.nom,
                    "promotion_label": student.promotion.label if student.promotion else "",
                    "rank": student.rang_promotion,
                    "average": round(average, 2),
                }
            )

        top_students = sorted(top_students, key=lambda item: item["average"], reverse=True)[:5]

        return Response(
            {
                "summary": {
                    "promotions": promotions.count(),
                    "scheduled_courses": EmploiDuTempsItem.objects.count(),
                    "generated_documents": StudentDocument.objects.filter(is_generated=True).count(),
                    "average_score": round(sum(averages) / len(averages), 2) if averages else 0,
                },
                "promotions": [
                    {
                        "id": promotion.id,
                        "label": promotion.label,
                        "academic_year": promotion.academic_year,
                        "formation_name": promotion.formation.nom,
                        "formation_code": promotion.formation.code,
                        "students_count": promotion.students_count,
                    }
                    for promotion in promotions
                ],
                "upcoming_courses": [
                    {
                        "id": course.id,
                        "matiere": course.matiere,
                        "enseignant": course.enseignant,
                        "salle": course.salle,
                        "type": course.type,
                        "debut": course.debut,
                        "fin": course.fin,
                        "promotion_label": course.promotion.label,
                        "formation_name": course.promotion.formation.nom,
                    }
                    for course in upcoming_courses
                ],
                "recent_documents": [
                    {
                        "id": document.id,
                        "title": document.title,
                        "type_document": document.type_document,
                        "semester": document.semester,
                        "academic_year": document.academic_year,
                        "is_generated": document.is_generated,
                        "generated_at": document.generated_at,
                        "student_name": document.etudiant.user.full_name,
                        "matricule": document.etudiant.matricule,
                        "promotion_label": document.etudiant.promotion.label if document.etudiant.promotion else "",
                    }
                    for document in recent_documents
                ],
                "top_students": top_students,
            }
        )
