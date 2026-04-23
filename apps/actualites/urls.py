from django.urls import path

from . import views

app_name = "actualites"

urlpatterns = [
    path("", views.liste_articles, name="liste"),
    path("<slug:slug>/", views.detail_article, name="detail"),
]
