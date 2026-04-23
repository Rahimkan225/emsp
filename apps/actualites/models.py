from django.conf import settings
from django.db import models

class Tag(models.Model):
    nom = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.nom


class Article(models.Model):
    titre = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)
    extrait = models.TextField(max_length=500)
    contenu = models.TextField()
    cover = models.ForeignKey(
        "mediatheque.MediaItem", null=True, blank=True, on_delete=models.SET_NULL
    )
    tags = models.ManyToManyField(Tag, blank=True)
    publie_le = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_articles",
    )

    class Meta:
        ordering = ["-updated_at", "-publie_le"]

    def __str__(self):
        return self.titre
