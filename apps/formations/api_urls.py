from django.db.models import Q
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Filiere
from .serializers import FiliereSerializer


PROGRAM_TYPE_MAP = {
    "FSP": ["FSP"],
    "FS-MENUM": ["LICENCE", "MASTER"],
    "FCQ": ["FCQ"],
    "LICENCE": ["LICENCE"],
    "MASTER": ["MASTER"],
}

LEVEL_MAP = {
    "LICENCE": "LICENCE",
    "MASTER": "MASTER",
    "CERTIFIANTE": "FCQ",
    "FCQ": "FCQ",
    "FSP": "FSP",
}


def _parse_limit(value):
    try:
        return max(1, int(value))
    except (TypeError, ValueError):
        return None


@api_view(["GET"])
@permission_classes([AllowAny])
def formation_list_api(request):
    queryset = Filiere.objects.filter(is_active=True).select_related("cover").order_by(
        "ordre",
        "nom",
    )

    program_type = request.query_params.get("type", "").strip().upper()
    level = request.query_params.get("level", "").strip().upper()
    search = request.query_params.get("search", "").strip()
    limit = _parse_limit(request.query_params.get("limit"))

    if program_type in PROGRAM_TYPE_MAP:
        queryset = queryset.filter(niveau__in=PROGRAM_TYPE_MAP[program_type])
    if level in LEVEL_MAP:
        queryset = queryset.filter(niveau=LEVEL_MAP[level])
    if search:
        queryset = queryset.filter(
            Q(nom__icontains=search)
            | Q(code__icontains=search)
            | Q(description__icontains=search)
        )
    if limit:
        queryset = queryset[:limit]

    serializer = FiliereSerializer(
        queryset,
        many=True,
        context={"request": request},
    )
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def formation_detail_api(request, code):
    formation = Filiere.objects.filter(is_active=True, code__iexact=code).select_related(
        "cover"
    ).first()
    if not formation:
        return Response({"detail": "Formation non trouvee."}, status=404)

    serializer = FiliereSerializer(formation, context={"request": request})
    return Response(serializer.data)


urlpatterns = [
    path("", formation_list_api, name="formation_list_api"),
    path("<str:code>/", formation_detail_api, name="formation_detail_api"),
]
