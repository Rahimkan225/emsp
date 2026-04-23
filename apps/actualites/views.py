from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render

from .image_utils import attach_article_display_images
from .models import Article, Tag


def liste_articles(request):
    tag_slug = request.GET.get("tag", "")
    articles = Article.objects.filter(is_published=True).select_related("cover")
    if tag_slug:
        articles = articles.filter(tags__slug=tag_slug)
    paginator = Paginator(articles, 9)
    page = paginator.get_page(request.GET.get("page"))
    attach_article_display_images(page.object_list)
    tags = Tag.objects.all()
    return render(
        request,
        "public/actualites.html",
        {"page_obj": page, "tags": tags, "tag_actif": tag_slug},
    )


def detail_article(request, slug):
    article = get_object_or_404(Article.objects.select_related("cover"), slug=slug, is_published=True)
    articles_recents = list(
        Article.objects.filter(is_published=True).exclude(pk=article.pk).select_related("cover")[:3]
    )
    attach_article_display_images([article, *articles_recents])
    return render(
        request,
        "public/actualite_detail.html",
        {"article": article, "articles_recents": articles_recents},
    )
