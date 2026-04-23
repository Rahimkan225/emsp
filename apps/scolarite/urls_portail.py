from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.portail_login, name="etudiant_login"),
]
