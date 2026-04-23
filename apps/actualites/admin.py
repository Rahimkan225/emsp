from django.contrib import admin
from .models import Article, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("nom", "slug")
    search_fields = ("nom", "slug")


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("titre", "slug", "created_by", "publie_le", "updated_at", "is_published")
    list_filter = ("is_published", "publie_le", "updated_at")
    search_fields = ("titre", "slug", "extrait")
    prepopulated_fields = {"slug": ("titre",)}
