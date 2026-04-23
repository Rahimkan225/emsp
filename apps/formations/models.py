from django.db import models


class Filiere(models.Model):
    NIVEAU_CHOICES = [
        ("FSP", "Formation Superieure Postale"),
        ("LICENCE", "Licence FS-MENUM"),
        ("MASTER", "Master FS-MENUM"),
        ("FCQ", "Formation Certifiante"),
    ]

    nom = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES)
    duree = models.CharField(max_length=100)
    description = models.TextField()
    cover = models.ForeignKey(
        "mediatheque.MediaItem", null=True, blank=True, on_delete=models.SET_NULL
    )
    ordre = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return f"{self.code} — {self.nom}"
