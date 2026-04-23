from django.contrib import admin

from .models import Candidature, CandidatureDocument


class CandidatureDocumentInline(admin.TabularInline):
    model = CandidatureDocument
    extra = 0
    fields = ("original_name", "file", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = (
        "dossier_number",
        "full_name",
        "formation",
        "nationality",
        "status",
        "created_at",
    )
    list_filter = ("status", "nationality", "formation__niveau", "created_at")
    search_fields = (
        "dossier_number",
        "first_name",
        "last_name",
        "email",
        "phone",
    )
    readonly_fields = ("dossier_number", "created_at", "updated_at")
    inlines = [CandidatureDocumentInline]


@admin.register(CandidatureDocument)
class CandidatureDocumentAdmin(admin.ModelAdmin):
    list_display = ("original_name", "candidature", "created_at")
    search_fields = ("original_name", "candidature__dossier_number")
    readonly_fields = ("created_at",)
