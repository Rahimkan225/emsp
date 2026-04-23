from django.http import JsonResponse
from django.urls import path

from .api_views import (
    AdminAcademicOverviewApiView,
    AdminDashboardApiView,
    AdminStudentListApiView,
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
    path("admin/scolarite/", AdminAcademicOverviewApiView.as_view(), name="admin_scolarite"),
]
