from django.db import models
from django.utils import timezone


class Candidature(models.Model):
    STATUS_CHOICES = [
        ("submitted", "Soumis"),
        ("under_review", "En cours d'examen"),
        ("accepted", "Accepte"),
        ("rejected", "Refuse"),
    ]

    NATIONALITY_CHOICES = [
        ("BJ", "Benin"),
        ("BF", "Burkina Faso"),
        ("CI", "Cote d'Ivoire"),
        ("ML", "Mali"),
        ("MR", "Mauritanie"),
        ("NE", "Niger"),
        ("SN", "Senegal"),
        ("TG", "Togo"),
        ("OTHER", "Autre"),
    ]

    DEGREE_CHOICES = [
        ("BAC", "Bac"),
        ("BAC_1", "Bac+1"),
        ("BAC_2", "Bac+2"),
        ("BTS_DUT", "BTS / DUT"),
        ("LICENCE", "Licence"),
        ("MASTER", "Master"),
        ("DOCTORAT", "Doctorat"),
        ("OTHER", "Autre"),
    ]

    formation = models.ForeignKey(
        "formations.Filiere",
        on_delete=models.PROTECT,
        related_name="candidatures",
    )
    dossier_number = models.CharField(max_length=30, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    place_of_birth = models.CharField(max_length=150)
    nationality = models.CharField(max_length=10, choices=NATIONALITY_CHOICES)
    residence_country = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=30)
    whatsapp = models.CharField(max_length=30, blank=True)
    email = models.EmailField()

    photo = models.ImageField(upload_to="inscriptions/photos/")

    highest_degree = models.CharField(max_length=20, choices=DEGREE_CHOICES)
    institution_name = models.CharField(max_length=200)
    graduation_year = models.PositiveIntegerField()
    diploma_country = models.CharField(max_length=100)
    transcript_file = models.FileField(upload_to="inscriptions/documents/transcripts/")
    diploma_file = models.FileField(upload_to="inscriptions/documents/diplomas/")
    motivation_file = models.FileField(
        upload_to="inscriptions/documents/motivation/",
        blank=True,
    )
    professional_experience = models.TextField(blank=True)
    motivation_text = models.TextField(blank=True)

    accuracy_certified = models.BooleanField(default=False)
    terms_accepted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"

    def __str__(self):
        return f"{self.dossier_number or 'Brouillon'} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new and not self.dossier_number:
            dossier_number = f"EMSP-{timezone.now().year}-{self.pk:04d}"
            type(self).objects.filter(pk=self.pk).update(dossier_number=dossier_number)
            self.dossier_number = dossier_number


class CandidatureDocument(models.Model):
    candidature = models.ForeignKey(
        Candidature,
        on_delete=models.CASCADE,
        related_name="additional_documents",
    )
    file = models.FileField(upload_to="inscriptions/documents/additional/")
    original_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Document complementaire"
        verbose_name_plural = "Documents complementaires"

    def __str__(self):
        return self.original_name or self.file.name
