from django.db import models


class SiteConfig(models.Model):
    """Configuration globale du site — singleton."""

    logo = models.ImageField(upload_to="config/", blank=True)
    logo_alt = models.CharField(max_length=100, default="Logo EMSP")
    site_name = models.CharField(max_length=100, default="EMSP")
    slogan = models.CharField(max_length=255, blank=True)
    phone_1 = models.CharField(max_length=30, default="+225 27 21 21 45 60")
    phone_2 = models.CharField(max_length=30, blank=True)
    email_contact = models.EmailField(default="contact@emsp.int")
    email_info = models.EmailField(default="info@emsp.int")
    address = models.TextField(
        default="Treichville, Zone 3, Km4, Boulevard de Marseille, Abidjan"
    )
    show_homepage_banner = models.BooleanField(default=True)
    homepage_banner_text = models.CharField(max_length=255, blank=True)
    about_text = models.TextField(blank=True)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    footer_text = models.TextField(blank=True)

    class Meta:
        verbose_name = "Configuration du site"
        verbose_name_plural = "Configuration du site"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.site_name


class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ("inscription", "Inscription"),
        ("information", "Information"),
        ("partenariat", "Partenariat"),
        ("autre", "Autre"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=30, choices=SUBJECT_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.get_subject_display()}"
