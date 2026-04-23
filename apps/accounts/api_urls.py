from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .api_views import CurrentUserApiView, LoginApiView, health


urlpatterns = [
    path("health/", health, name="accounts_health"),
    path("login/", LoginApiView.as_view(), name="auth_login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth_refresh"),
    path("me/", CurrentUserApiView.as_view(), name="auth_me"),
]
