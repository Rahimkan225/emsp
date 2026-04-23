from django.urls import path

from .api_views import (
    AdminPaiementListApiView,
    FinanceSummaryApiView,
    InitiatePaiementApiView,
    MePaiementsApiView,
    health,
)


urlpatterns = [
    path("health/", health, name="comptabilite_health"),
    path("summary/", FinanceSummaryApiView.as_view(), name="finance_summary"),
    path("admin/paiements/", AdminPaiementListApiView.as_view(), name="finance_admin_payments"),
    path("me/", MePaiementsApiView.as_view(), name="finance_me"),
    path("payments/initiate/", InitiatePaiementApiView.as_view(), name="finance_initiate"),
]
