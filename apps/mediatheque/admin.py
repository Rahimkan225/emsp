from django.contrib import admin
from .models import MediaItem


@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "category", "is_active", "created_at")
    list_filter = ("type", "category", "is_active")
    search_fields = ("title", "alt_text", "category", "description")
