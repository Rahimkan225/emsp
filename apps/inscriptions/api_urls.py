from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.template.loader import render_to_string
from django.urls import path
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsFullAdminAccess
from apps.core.models import SiteConfig

from .models import Candidature
from .serializers import (
    CandidatureAdminDetailSerializer,
    CandidatureAdminListSerializer,
    CandidatureAdminStatusSerializer,
    CandidatureCreateSerializer,
    CandidatureSubmissionSerializer,
)


class CandidatureCreateApi(generics.CreateAPIView):
    queryset = Candidature.objects.select_related("formation")
    serializer_class = CandidatureCreateSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        candidature = self.get_queryset().get(pk=response.data["id"])
        serializer = CandidatureSubmissionSerializer(
            candidature,
            context={"request": request},
        )
        response.data = {
            **serializer.data,
            "message": "Votre dossier a ete soumis avec succes.",
        }
        return response


class AdminCandidatureListApi(APIView):
    permission_classes = [IsAuthenticated, IsFullAdminAccess]

    def get(self, request):
        base_queryset = Candidature.objects.select_related("formation")
        queryset = base_queryset

        status_filter = request.query_params.get("status", "").strip().lower()
        search = request.query_params.get("search", "").strip()

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(dossier_number__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
                | Q(formation__nom__icontains=search)
                | Q(formation__code__icontains=search)
            )

        serializer = CandidatureAdminListSerializer(
            queryset.order_by("-created_at"),
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "summary": {
                    "total": base_queryset.count(),
                    "pending": base_queryset.filter(
                        status__in=["submitted", "under_review"]
                    ).count(),
                    "accepted": base_queryset.filter(status="accepted").count(),
                    "rejected": base_queryset.filter(status="rejected").count(),
                },
                "results": serializer.data,
            }
        )


class AdminCandidatureDetailApi(APIView):
    permission_classes = [IsAuthenticated, IsFullAdminAccess]

    def get_object(self, pk):
        return get_object_or_404(
            Candidature.objects.select_related("formation").prefetch_related(
                "additional_documents"
            ),
            pk=pk,
        )

    def get(self, request, pk):
        serializer = CandidatureAdminDetailSerializer(
            self.get_object(pk),
            context={"request": request},
        )
        return Response(serializer.data)

    def patch(self, request, pk):
        candidature = self.get_object(pk)
        serializer = CandidatureAdminStatusSerializer(
            candidature,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            CandidatureAdminDetailSerializer(
                candidature,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


def acknowledgement_pdf(request, dossier_number):
    candidature = get_object_or_404(
        Candidature.objects.select_related("formation"),
        dossier_number=dossier_number,
    )
    site = SiteConfig.get()

    html_string = render_to_string(
        "inscriptions/acknowledgement.html",
        {
            "candidature": candidature,
            "site": site,
        },
    )
    try:
        from weasyprint import HTML

        pdf_bytes = HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf()

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="accuse-reception-{candidature.dossier_number}.pdf"'
        )
        return response
    except Exception:
        response = HttpResponse(html_string, content_type="text/html; charset=utf-8")
        response["Content-Disposition"] = (
            f'inline; filename="accuse-reception-{candidature.dossier_number}.html"'
        )
        return response


urlpatterns = [
    path("admin/candidatures/", AdminCandidatureListApi.as_view(), name="candidature_admin_list_api"),
    path("admin/candidatures/<int:pk>/", AdminCandidatureDetailApi.as_view(), name="candidature_admin_detail_api"),
    path("", CandidatureCreateApi.as_view(), name="candidature_create_api"),
    path(
        "<str:dossier_number>/acknowledgement/",
        acknowledgement_pdf,
        name="candidature_acknowledgement_api",
    ),
]
