from django.http import JsonResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.scolarite.demo import ensure_admin_bootstrap_data, ensure_portal_demo_data

from .serializers import LoginSerializer, UserSerializer


def health(request):
    return JsonResponse({"app": "accounts", "status": "ok"})


class LoginApiView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        bootstrap_users = ensure_admin_bootstrap_data()
        ensure_portal_demo_data(bootstrap_users=bootstrap_users)
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class CurrentUserApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)
