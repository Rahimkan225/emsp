from django.urls import path
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsStaffOrAdmin

from .models import SiteConfig
from .serializers import ContactMessageSerializer, SiteConfigAdminSerializer, SiteConfigSerializer


class SiteConfigApiView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = SiteConfigSerializer(
            SiteConfig.get(),
            context={"request": request},
        )
        return Response(serializer.data)


class AdminSiteConfigApiView(APIView):
    permission_classes = [IsStaffOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = SiteConfigAdminSerializer(
            SiteConfig.get(),
            context={"request": request},
        )
        return Response(serializer.data)

    def patch(self, request):
        serializer = SiteConfigAdminSerializer(
            SiteConfig.get(),
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        site_config = serializer.save()
        return Response(
            SiteConfigAdminSerializer(
                site_config,
                context={"request": request},
            ).data
        )


class ContactMessageApiView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Message envoye avec succes."},
            status=status.HTTP_201_CREATED,
        )


urlpatterns = [
    path("", SiteConfigApiView.as_view(), name="site_config_api"),
    path("admin/", AdminSiteConfigApiView.as_view(), name="site_config_admin_api"),
    path("contact/", ContactMessageApiView.as_view(), name="contact_message_api"),
]
