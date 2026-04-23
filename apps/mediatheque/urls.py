from django.urls import path

from . import views

app_name = "mediatheque"

urlpatterns = [
    path("hero-image/", views.hero_image, name="hero_image"),
]
