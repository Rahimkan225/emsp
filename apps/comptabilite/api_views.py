from decimal import Decimal

from django.http import JsonResponse
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminFamily, IsStudent
from apps.scolarite.demo import ensure_portal_demo_data
from apps.scolarite.models import Etudiant

from .models import Paiement
from .serializers import PaiementInitiateSerializer, PaiementSerializer


def health(request):
    return JsonResponse({"app": "comptabilite", "status": "ok"})


def _student_for_user(user):
    student = Etudiant.objects.filter(user=user).first()
    if student is None:
        raise NotFound("Aucun profil etudiant n'est lie a ce compte.")
    return student


class MePaiementsApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        transactions = Paiement.objects.filter(etudiant=student).order_by("-created_at")
        amount_paid = _sum_decimal(transactions.filter(statut="confirmed"), "montant")
        payload = {
            "amount_due": f"{student.solde_scolarite:,.0f} FCFA".replace(",", " "),
            "amount_paid": f"{amount_paid:,.0f} FCFA".replace(",", " "),
            "remaining_balance": f"{student.solde_scolarite:,.0f} FCFA".replace(",", " "),
            "transactions": PaiementSerializer(transactions, many=True).data,
        }
        return Response(payload)


class InitiatePaiementApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        ensure_portal_demo_data()
        student = _student_for_user(request.user)
        serializer = PaiementInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        paiement = Paiement.objects.create(
            etudiant=student,
            montant=serializer.validated_data["montant"],
            operateur=serializer.validated_data["operateur"],
            phone_number=serializer.validated_data["phone"],
            description=serializer.validated_data["description"],
            statut="pending",
            reference=f"EMSP-PAY-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        )
        return Response(
            {
                "paiement_id": paiement.id,
                "status": paiement.statut,
                "message": "Paiement initie. Confirmez l'operation sur votre telephone pour finaliser le paiement.",
            }
        )


class FinanceSummaryApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        ensure_portal_demo_data()
        students = Etudiant.objects.all()
        paiements = Paiement.objects.all()
        recettes = paiements.filter(statut="confirmed")

        recettes_total = _sum_decimal(recettes, "montant")
        impayes_total = _sum_decimal(students, "solde_scolarite")
        payment_pending = paiements.filter(statut="pending").count()
        taux_recouvrement = float(
            (recettes_total / (recettes_total + impayes_total) * 100)
            if (recettes_total + impayes_total)
            else 0
        )

        month_labels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin"]
        evolution = []
        for index, label in enumerate(month_labels, start=1):
            month_total = _sum_decimal(recettes.filter(created_at__month=index), "montant")
            evolution.append({"label": label, "paid": float(month_total), "goal": 600000.0})

        return Response(
            {
                "monthly_revenue": float(recettes_total),
                "recovery_rate": round(taux_recouvrement, 2),
                "pending_payments": payment_pending,
                "unpaid_total": float(impayes_total),
                "evolution": evolution,
                "months": [row["label"] for row in evolution],
                "values": [row["paid"] for row in evolution],
            }
        )


class AdminPaiementListApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        ensure_portal_demo_data()

        queryset = Paiement.objects.select_related("etudiant__user", "etudiant__formation")
        search = request.query_params.get("search", "").strip()
        status_filter = (request.query_params.get("status") or request.query_params.get("statut") or "").strip().lower()
        operator = (request.query_params.get("operator") or request.query_params.get("operateur") or "").strip().lower()

        if search:
            queryset = queryset.filter(
                Q(reference__icontains=search)
                | Q(description__icontains=search)
                | Q(etudiant__matricule__icontains=search)
                | Q(etudiant__user__first_name__icontains=search)
                | Q(etudiant__user__last_name__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(statut=status_filter)
        if operator:
            queryset = queryset.filter(operateur=operator)
        year = request.query_params.get("annee")
        month = request.query_params.get("mois")
        if year:
            queryset = queryset.filter(created_at__year=year)
        if month:
            queryset = queryset.filter(created_at__month=month)

        paiements = queryset.order_by("-created_at")
        if request.query_params.get("stats"):
            now = timezone.localdate()
            return Response(
                {
                    "encaisse_mois": float(_sum_decimal(paiements.filter(statut="confirmed", created_at__year=now.year, created_at__month=now.month), "montant")),
                    "total_attente": float(_sum_decimal(paiements.filter(statut="pending"), "montant")),
                    "total_refuse": float(_sum_decimal(paiements.filter(statut__in=["failed", "refunded"]), "montant")),
                }
            )

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 20))))
        except (TypeError, ValueError):
            page, page_size = 1, 20
        count = paiements.count()
        rows = paiements[(page - 1) * page_size:page * page_size]

        return Response(
            {
                "count": count,
                "summary": {
                    "total_transactions": paiements.count(),
                    "confirmed_count": paiements.filter(statut="confirmed").count(),
                    "pending_count": paiements.filter(statut="pending").count(),
                    "failed_count": paiements.filter(statut__in=["failed", "refunded"]).count(),
                    "confirmed_total": float(_sum_decimal(paiements.filter(statut="confirmed"), "montant")),
                },
                "results": PaiementSerializer(rows, many=True).data,
            }
        )


class AdminPaiementDetailApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request, pk):
        paiement = Paiement.objects.select_related("etudiant__user", "etudiant__formation").filter(pk=pk).first()
        if paiement is None:
            raise NotFound("Paiement introuvable.")
        return Response(PaiementSerializer(paiement).data)


class AdminFinanceAuditApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        ensure_portal_demo_data()
        students = Etudiant.objects.select_related("user", "formation", "promotion").all()
        payments = Paiement.objects.select_related("etudiant", "etudiant__formation").all()
        confirmed = payments.filter(statut="confirmed")

        rows = []
        for student in students:
            paid = _sum_decimal(confirmed.filter(etudiant=student), "montant")
            due = student.solde_scolarite
            rows.append(
                {
                    "student_id": student.id,
                    "matricule": student.matricule,
                    "student_name": student.user.full_name,
                    "formation_name": student.formation.nom,
                    "promotion_label": student.promotion.label if student.promotion else "",
                    "paid_total": float(paid),
                    "due_total": float(due),
                    "balance": float(due),
                }
            )

        formations = []
        for formation in {student.formation for student in students}:
            formation_students = [student for student in students if student.formation_id == formation.id]
            formation_paid = _sum_decimal(confirmed.filter(etudiant__formation=formation), "montant")
            formation_due = sum((student.solde_scolarite for student in formation_students), Decimal("0.00"))
            formations.append(
                {
                    "formation_id": formation.id,
                    "formation_name": formation.nom,
                    "students": len(formation_students),
                    "paid_total": float(formation_paid),
                    "due_total": float(formation_due),
                }
            )

        return Response(
            {
                "summary": {
                    "paid_total": float(_sum_decimal(confirmed, "montant")),
                    "due_total": float(_sum_decimal(students, "solde_scolarite")),
                    "students": students.count(),
                    "formations": len(formations),
                },
                "students": rows,
                "formations": formations,
                "payments": PaiementSerializer(payments.order_by("-created_at")[:100], many=True).data,
            }
        )


def _sum_decimal(queryset, field):
    return queryset.aggregate(total=Sum(field))["total"] or Decimal("0.00")
