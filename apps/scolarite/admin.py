from django.contrib import admin

from .models import EmploiDuTempsItem, Etudiant, ForumPost, Note, Promotion, StudentDocument


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ("label", "formation", "year_start", "year_end")


@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ("matricule", "user", "formation", "promotion", "pays", "rang_promotion", "is_active")
    list_filter = ("formation", "promotion", "pays", "is_active")
    search_fields = ("matricule", "user__first_name", "user__last_name", "user__email")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "matiere", "semestre", "annee_academique", "note", "is_validated")
    list_filter = ("semestre", "annee_academique", "is_validated")
    search_fields = ("etudiant__matricule", "matiere")


@admin.register(EmploiDuTempsItem)
class EmploiDuTempsItemAdmin(admin.ModelAdmin):
    list_display = ("matiere", "promotion", "type", "salle", "debut", "fin")
    list_filter = ("type", "promotion")


@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "etudiant", "type_document", "academic_year", "semester", "is_generated")
    list_filter = ("type_document", "academic_year", "is_generated")


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "author", "replies_count", "created_at")
    list_filter = ("category",)
