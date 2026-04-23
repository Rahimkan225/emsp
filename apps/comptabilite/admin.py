from django.contrib import admin

from .models import Paiement


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "montant", "operateur", "statut", "reference", "created_at")
    list_filter = ("operateur", "statut")
    search_fields = ("etudiant__matricule", "reference", "phone_number")
