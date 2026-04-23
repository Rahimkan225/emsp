from django.urls import path

from . import views

app_name = "inscriptions"

urlpatterns = [
    path("", views.formulaire, name="formulaire"),
]
