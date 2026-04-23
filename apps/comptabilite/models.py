from decimal import Decimal

from django.db import models


class Paiement(models.Model):
    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("confirmed", "Confirme"),
        ("failed", "Echoue"),
        ("refunded", "Rembourse"),
    ]
    OPERATOR_CHOICES = [
        ("orange", "Orange Money"),
        ("mtn", "MTN MoMo"),
        ("wave", "Wave"),
    ]

    etudiant = models.ForeignKey(
        "scolarite.Etudiant",
        on_delete=models.CASCADE,
        related_name="paiements",
    )
    montant = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    operateur = models.CharField(max_length=20, choices=OPERATOR_CHOICES, default="orange")
    phone_number = models.CharField(max_length=30, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.etudiant.matricule} - {self.montant}"
