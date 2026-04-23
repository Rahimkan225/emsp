from django.contrib import admin
from .models import Filiere


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ("code", "nom", "niveau", "duree", "ordre", "is_active")
    list_filter = ("niveau", "is_active")
    search_fields = ("nom", "code")
