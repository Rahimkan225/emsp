from django.http import JsonResponse
from django.urls import path

from .api_views import (
    AdminAcademicOverviewApiView,
    AdminDashboardApiView,
    AdminLegacyStudentDetailApiView,
    AdminPortalStudentDetailApiView,
    AdminStudentListApiView,
    AdminStudentOptionsApiView,
    MeDashboardApiView,
    MeDocumentsApiView,
    MeEdtApiView,
    MeForumApiView,
    MeNotesApiView,
    MeProfileApiView,
)


def health(request):
    return JsonResponse({"app": "scolarite", "status": "ok"})


urlpatterns = [
    path("health/", health, name="scolarite_health"),
    path("me/", MeProfileApiView.as_view(), name="student_me"),
    path("me/dashboard/", MeDashboardApiView.as_view(), name="student_dashboard"),
    path("me/notes/", MeNotesApiView.as_view(), name="student_notes"),
    path("me/edt/", MeEdtApiView.as_view(), name="student_edt"),
    path("me/documents/", MeDocumentsApiView.as_view(), name="student_documents"),
    path("me/forum/", MeForumApiView.as_view(), name="student_forum"),
    path("dashboard/", AdminDashboardApiView.as_view(), name="admin_dashboard"),
    path("admin/etudiants/", AdminStudentListApiView.as_view(), name="admin_students"),
    path("admin/etudiants/options/", AdminStudentOptionsApiView.as_view(), name="admin_students_options"),
    path("admin/etudiants/<int:pk>/", AdminPortalStudentDetailApiView.as_view(), name="admin_students_detail"),
    path(
        "admin/etudiants/legacy/<str:matricule>/",
        AdminLegacyStudentDetailApiView.as_view(),
        name="admin_students_legacy_detail",
    ),
    path("admin/scolarite/", AdminAcademicOverviewApiView.as_view(), name="admin_scolarite"),
]
