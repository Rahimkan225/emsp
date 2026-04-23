from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.urls import path
from rest_framework import generics
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny

from apps.core.models import SiteConfig

from .models import Candidature
from .serializers import CandidatureCreateSerializer, CandidatureSubmissionSerializer


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
    path("", CandidatureCreateApi.as_view(), name="candidature_create_api"),
    path(
        "<str:dossier_number>/acknowledgement/",
        acknowledgement_pdf,
        name="candidature_acknowledgement_api",
    ),
]
