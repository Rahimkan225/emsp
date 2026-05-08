from django.urls import path

from .api_views import (
    AdminPaiementListApiView,
    AdminPaiementDetailApiView,
    AdminFinanceAuditApiView,
    FinanceSummaryApiView,
    InitiatePaiementApiView,
    MePaiementsApiView,
    health,
)


urlpatterns = [
    path("health/", health, name="comptabilite_health"),
    path("summary/", FinanceSummaryApiView.as_view(), name="finance_summary"),
    path("", FinanceSummaryApiView.as_view(), name="finance_summary_legacy"),
    path("paiements/", AdminPaiementListApiView.as_view(), name="finance_payments_legacy"),
    path("paiements/<int:pk>/", AdminPaiementDetailApiView.as_view(), name="finance_payments_detail_legacy"),
    path("audit/", AdminFinanceAuditApiView.as_view(), name="finance_audit"),
    path("admin/paiements/", AdminPaiementListApiView.as_view(), name="finance_admin_payments"),
    path("me/", MePaiementsApiView.as_view(), name="finance_me"),
    path("payments/initiate/", InitiatePaiementApiView.as_view(), name="finance_initiate"),
]
