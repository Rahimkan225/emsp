from django.contrib import admin
from django.utils.html import format_html

from .models import ContactMessage, SiteConfig


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ("site_name", "show_homepage_banner", "email_contact", "phone_1")
    readonly_fields = ("logo_preview",)
    fieldsets = (
        (
            "Identite",
            {
                "fields": (
                    "site_name",
                    "slogan",
                    "logo",
                    "logo_alt",
                    "logo_preview",
                )
            },
        ),
        (
            "Bandeau page d'accueil",
            {
                "fields": (
                    "show_homepage_banner",
                    "homepage_banner_text",
                )
            },
        ),
        (
            "Contacts",
            {
                "fields": (
                    "phone_1",
                    "phone_2",
                    "email_contact",
                    "email_info",
                    "address",
                )
            },
        ),
        (
            "Contenus",
            {
                "fields": (
                    "about_text",
                    "footer_text",
                )
            },
        ),
        (
            "Reseaux sociaux",
            {
                "fields": (
                    "facebook_url",
                    "twitter_url",
                    "linkedin_url",
                    "youtube_url",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        if SiteConfig.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False

    def logo_preview(self, obj):
        if not obj.logo:
            return "Aucun logo charge"
        return format_html(
            '<div style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;display:inline-block;">'
            '<img src="{}" alt="{}" style="max-width:260px;max-height:90px;object-fit:contain;" />'
            "</div>",
            obj.logo.url,
            obj.logo_alt,
        )

    logo_preview.short_description = "Apercu du logo"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "subject", "created_at", "is_processed")
    list_filter = ("subject", "is_processed", "created_at")
    search_fields = ("first_name", "last_name", "email", "message")
