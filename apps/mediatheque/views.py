from django.http import Http404, HttpResponseRedirect
from django.templatetags.static import static

from .models import MediaItem


def hero_image(request):
    item = MediaItem.objects.filter(category="hero", is_active=True).first()
    if item and item.url:
        return HttpResponseRedirect(item.url)
    return HttpResponseRedirect(static("purdue/images/all-img/home-image.png"))


def media_index(request):
    raise Http404("Page media non implementee")
