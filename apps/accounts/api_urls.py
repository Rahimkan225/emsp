from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .api_views import (
    AdminUserDetailApiView,
    AdminUserListCreateApiView,
    AdminUserResetPasswordApiView,
    CurrentUserApiView,
    LoginApiView,
    health,
)


urlpatterns = [
    path("health/", health, name="accounts_health"),
    path("login/", LoginApiView.as_view(), name="auth_login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth_refresh"),
    path("me/", CurrentUserApiView.as_view(), name="auth_me"),
    path("users/", AdminUserListCreateApiView.as_view(), name="admin_users"),
    path("users/<int:pk>/", AdminUserDetailApiView.as_view(), name="admin_users_detail"),
    path("users/<int:pk>/reset-password/", AdminUserResetPasswordApiView.as_view(), name="admin_users_reset_password"),
]
