from django.urls import path

from . import views

app_name = "formations"

urlpatterns = [
    path("", views.liste_formations, name="liste"),
    path("<str:code>/", views.detail_formation, name="detail"),
]
