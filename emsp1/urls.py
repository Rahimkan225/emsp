from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import RedirectView

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path("etudiant/login/", RedirectView.as_view(url="/login", permanent=False)),
    path("formations/", include("apps.formations.urls")),
    path("actualites/", include("apps.actualites.urls")),
    path("mediatheque/", include("apps.mediatheque.urls")),
    path("inscription/", include("apps.inscriptions.urls")),
    path(
        "api/",
        include(
            [
                path("config/", include("apps.core.api_urls")),
                path("contact/", include("apps.core.contact_api_urls")),
                path("formations/", include("apps.formations.api_urls")),
                path("actualites/", include("apps.actualites.api_urls")),
                path("media/", include("apps.mediatheque.api_urls")),
                path("inscriptions/", include("apps.inscriptions.api_urls")),
                path("scolarite/", include("apps.scolarite.api_urls")),
                path("comptabilite/", include("apps.comptabilite.api_urls")),
                path("auth/", include("apps.accounts.api_urls")),
            ]
        ),
    ),
    path("", include("apps.core.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
