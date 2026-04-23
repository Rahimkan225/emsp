from rest_framework import serializers
from django.templatetags.static import static

from .models import ContactMessage, SiteConfig


def _static_asset_url(request, asset_path):
    url = static(asset_path)
    if request:
        return request.build_absolute_uri(url)
    return url


class SiteConfigSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteConfig
        fields = [
            "site_name",
            "slogan",
            "logo_alt",
            "logo_url",
            "phone_1",
            "phone_2",
            "email_contact",
            "email_info",
            "address",
            "show_homepage_banner",
            "homepage_banner_text",
            "about_text",
            "facebook_url",
            "twitter_url",
            "linkedin_url",
            "youtube_url",
            "footer_text",
        ]

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        if obj.logo:
            return obj.logo.url
        return _static_asset_url(request, "emsp/images/logo-emsp.svg")


class SiteConfigAdminSerializer(SiteConfigSerializer):
    logo = serializers.ImageField(write_only=True, required=False, allow_null=True)
    clear_logo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta(SiteConfigSerializer.Meta):
        fields = SiteConfigSerializer.Meta.fields + [
            "logo",
            "clear_logo",
        ]

    def update(self, instance, validated_data):
        clear_logo = validated_data.pop("clear_logo", False)
        if clear_logo and instance.logo:
            instance.logo.delete(save=False)
            instance.logo = ""
        return super().update(instance, validated_data)


class ContactMessageSerializer(serializers.ModelSerializer):
    honeypot = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = ContactMessage
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "subject",
            "message",
            "honeypot",
        ]

    def validate_honeypot(self, value):
        if value:
            raise serializers.ValidationError("Valeur invalide.")
        return value

    def create(self, validated_data):
        validated_data.pop("honeypot", None)
        return super().create(validated_data)
