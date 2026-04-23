import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render

from apps.actualites.image_utils import attach_article_display_images
from apps.actualites.models import Article
from apps.formations.models import Filiere
from apps.mediatheque.models import MediaItem

REACT_DIST_DIR = settings.BASE_DIR / "emsp2-frontend" / "dist"
REACT_ASSETS_DIR = REACT_DIST_DIR / "assets"


def home(request):
    """Page d'accueil publique basee sur Purdue."""

    def get_media(category):
        return MediaItem.objects.filter(category=category, is_active=True).first()

    def get_media_list(category, limit=None):
        queryset = MediaItem.objects.filter(
            category=category,
            is_active=True,
            type="image",
        ).order_by("-created_at")
        if limit:
            return queryset[:limit]
        return queryset

    articles_recents = list(
        Article.objects.filter(is_published=True).select_related("cover").order_by("-publie_le")[:3]
    )
    attach_article_display_images(articles_recents)

    context = {
        "hero_image": get_media("hero"),
        "hero_images": get_media_list("hero", limit=5),
        "about_image": get_media("about"),
        "why_image": get_media("why"),
        "promo_image": get_media("promo"),
        "drapeaux_images": get_media_list("drapeaux", limit=8),
        "partenaires_images": get_media_list("partenaires", limit=12),
        "filieres_home": Filiere.objects.filter(is_active=True).order_by("ordre")[:8],
        "formations_vedette": Filiere.objects.filter(is_active=True).order_by("ordre")[:4],
        "articles_recents": articles_recents,
        "enseignants_home": [],
        "temoignages": [],
        "why_items": [],
    }
    return render(request, "public/home.html", context)


def contact(request):
    return render(request, "public/contact.html")


def a_propos(request):
    return render(request, "public/a_propos.html")


def newsletter_subscribe(request):
    return HttpResponseRedirect(reverse("core:home"))


def react_app(request, path=""):
    index_path = REACT_DIST_DIR / "index.html"
    if not index_path.exists():
        raise Http404("Le build frontend est introuvable. Lancez `npm run build` dans `emsp2-frontend`.")

    return FileResponse(index_path.open("rb"), content_type="text/html; charset=utf-8")


def react_asset(request, path):
    asset_path = (REACT_ASSETS_DIR / Path(path)).resolve()

    if REACT_ASSETS_DIR.resolve() not in asset_path.parents or not asset_path.is_file():
        raise Http404("Asset frontend introuvable.")

    content_type, _ = mimetypes.guess_type(asset_path.name)
    return FileResponse(asset_path.open("rb"), content_type=content_type or "application/octet-stream")
