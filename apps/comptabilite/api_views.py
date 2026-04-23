from decimal import Decimal

from django.http import JsonResponse
from django.db.models import Q, Sum
from django.utils import timezone
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


class MePaiementsApiView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        ensure_portal_demo_data()
        student = Etudiant.objects.get(user=request.user)
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
        student = Etudiant.objects.get(user=request.user)
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
            }
        )


class AdminPaiementListApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminFamily]

    def get(self, request):
        ensure_portal_demo_data()

        queryset = Paiement.objects.select_related("etudiant__user", "etudiant__formation")
        search = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip().lower()
        operator = request.query_params.get("operator", "").strip().lower()

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

        paiements = queryset.order_by("-created_at")

        return Response(
            {
                "summary": {
                    "total_transactions": paiements.count(),
                    "confirmed_count": paiements.filter(statut="confirmed").count(),
                    "pending_count": paiements.filter(statut="pending").count(),
                    "failed_count": paiements.filter(statut__in=["failed", "refunded"]).count(),
                    "confirmed_total": float(_sum_decimal(paiements.filter(statut="confirmed"), "montant")),
                },
                "results": PaiementSerializer(paiements, many=True).data,
            }
        )


def _sum_decimal(queryset, field):
    return queryset.aggregate(total=Sum(field))["total"] or Decimal("0.00")
