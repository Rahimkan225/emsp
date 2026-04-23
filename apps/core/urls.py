from django.urls import path, re_path

from . import views

app_name = "core"

urlpatterns = [
    path("", views.react_app, name="home"),
    path("contact/", views.react_app, name="contact"),
    path("newsletter/subscribe/", views.newsletter_subscribe, name="newsletter_subscribe"),
    path("a-propos/", views.a_propos, name="a_propos"),
    path("legacy/", views.home, name="legacy_home"),
    path("legacy/contact/", views.contact, name="legacy_contact"),
    path("assets/<path:path>", views.react_asset, name="react_asset"),
    re_path(
        r"^(?!(?:django-admin|api|assets|media|static)(?:/|$)|(?:a-propos|newsletter)(?:/|$)|mediatheque/hero-image(?:/|$)).*$",
        views.react_app,
        name="react_app",
    ),
]
