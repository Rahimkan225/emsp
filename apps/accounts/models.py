from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Utilisateur applicatif extensible pour JWT + admin Django."""

    class Roles:
        ADMIN = "admin"
        DIRECTION = "direction"
        STAFF = "staff"
        COMPTA = "compta"
        ETUDIANT = "etudiant"
        ENSEIGNANT = "enseignant"

    ROLE_CHOICES = (
        (Roles.ADMIN, "Administrateur"),
        (Roles.DIRECTION, "Direction"),
        (Roles.STAFF, "Staff"),
        (Roles.COMPTA, "Comptabilite"),
        (Roles.ETUDIANT, "Etudiant"),
        (Roles.ENSEIGNANT, "Enseignant"),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=Roles.ETUDIANT)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ForeignKey(
        "mediatheque.MediaItem",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="account_avatars",
    )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
