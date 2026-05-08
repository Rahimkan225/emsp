from decimal import Decimal

from django.db import models


class Promotion(models.Model):
    formation = models.ForeignKey(
        "formations.Filiere",
        on_delete=models.CASCADE,
        related_name="promotions",
    )
    label = models.CharField(max_length=100)
    year_start = models.PositiveIntegerField()
    year_end = models.PositiveIntegerField()

    class Meta:
        ordering = ["-year_start", "label"]

    def __str__(self):
        return self.label

    @property
    def academic_year(self):
        return f"{self.year_start}-{self.year_end}"


class Etudiant(models.Model):
    PAYS_MEMBRES = [
        ("BJ", "Benin"),
        ("BF", "Burkina Faso"),
        ("CI", "Cote d'Ivoire"),
        ("ML", "Mali"),
        ("MR", "Mauritanie"),
        ("NE", "Niger"),
        ("SN", "Senegal"),
        ("TG", "Togo"),
    ]

    user = models.OneToOneField(
        "accounts.CustomUser",
        on_delete=models.CASCADE,
        related_name="etudiant_profile",
    )
    matricule = models.CharField(max_length=20, unique=True)
    formation = models.ForeignKey(
        "formations.Filiere",
        on_delete=models.PROTECT,
        related_name="etudiants",
    )
    promotion = models.ForeignKey(
        Promotion,
        on_delete=models.PROTECT,
        related_name="etudiants",
        null=True,
        blank=True,
    )
    pays = models.CharField(max_length=5, choices=PAYS_MEMBRES)
    date_naissance = models.DateField(null=True, blank=True)
    lieu_naissance = models.CharField(max_length=200, blank=True)
    photo = models.ForeignKey(
        "mediatheque.MediaItem",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="student_photos",
    )
    rang_promotion = models.PositiveIntegerField(default=1)
    solde_scolarite = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["matricule"]

    def __str__(self):
        return f"{self.matricule} - {self.user.full_name}"


class Note(models.Model):
    SEMESTER_CHOICES = [
        ("S1", "Semestre 1"),
        ("S2", "Semestre 2"),
        ("S3", "Semestre 3"),
        ("S4", "Semestre 4"),
    ]

    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    matiere = models.CharField(max_length=200)
    coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("1.00"))
    credits = models.PositiveIntegerField(default=3)
    note = models.DecimalField(max_digits=5, decimal_places=2)
    semestre = models.CharField(max_length=5, choices=SEMESTER_CHOICES)
    annee_academique = models.CharField(max_length=10)
    is_validated = models.BooleanField(default=False)

    class Meta:
        ordering = ["annee_academique", "semestre", "matiere"]

    def __str__(self):
        return f"{self.etudiant.matricule} - {self.matiere}"

    @property
    def mention(self):
        value = float(self.note)
        if value >= 16:
            return "Tres bien"
        if value >= 14:
            return "Bien"
        if value >= 12:
            return "Assez bien"
        if value >= 10:
            return "Passable"
        return "Insuffisant"


class EmploiDuTempsItem(models.Model):
    TYPE_CHOICES = [
        ("cours", "Cours"),
        ("td", "TD"),
        ("examen", "Examen"),
        ("ferie", "Ferie"),
    ]

    promotion = models.ForeignKey(
        Promotion,
        on_delete=models.CASCADE,
        related_name="cours",
    )
    matiere = models.CharField(max_length=200)
    enseignant = models.CharField(max_length=200, blank=True)
    salle = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="cours")
    debut = models.DateTimeField()
    fin = models.DateTimeField()

    class Meta:
        ordering = ["debut"]

    def __str__(self):
        return f"{self.matiere} - {self.promotion.label}"


class StudentDocument(models.Model):
    TYPE_CHOICES = [
        ("certificat", "Certificat de scolarite"),
        ("releve", "Releve de notes"),
        ("bulletin", "Bulletin"),
    ]

    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    title = models.CharField(max_length=200)
    type_document = models.CharField(max_length=20, choices=TYPE_CHOICES)
    semester = models.CharField(max_length=5, blank=True)
    academic_year = models.CharField(max_length=10, blank=True)
    file = models.FileField(upload_to="documents/%Y/%m/", blank=True)
    is_generated = models.BooleanField(default=False)
    generated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title

    @property
    def url(self):
        if self.file:
            return self.file.url
        return ""


class ForumPost(models.Model):
    CATEGORY_CHOICES = [
        ("general", "General"),
        ("filiere", "Ma filiere"),
        ("promotion", "Ma promotion"),
        ("stages", "Offres stages/emplois"),
    ]

    author = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.CASCADE,
        related_name="forum_posts",
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="general")
    title = models.CharField(max_length=200)
    content = models.TextField()
    replies_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Enseignant(models.Model):
    STATUS_CHOICES = [
        ("disponible", "Disponible"),
        ("occupe", "Occupe"),
        ("mission", "Mission"),
    ]

    full_name = models.CharField(max_length=200)
    specialite = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    statut = models.CharField(max_length=15, choices=STATUS_CHOICES, default="disponible")
    disponibilite = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name


class TransportDepot(models.Model):
    label = models.CharField(max_length=120)
    commune = models.CharField(max_length=120, blank=True)
    address = models.CharField(max_length=255, blank=True)
    manager_phone = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["label"]

    def __str__(self):
        return self.label


class TransportCommune(models.Model):
    label = models.CharField(max_length=120, unique=True)
    pickup_point = models.CharField(max_length=255, blank=True)
    monthly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["label"]

    def __str__(self):
        return self.label


class TransportRoute(models.Model):
    label = models.CharField(max_length=160)
    origin = models.ForeignKey(
        TransportCommune,
        on_delete=models.PROTECT,
        related_name="routes_origin",
    )
    destination = models.CharField(max_length=160, default="EMSP")
    pickup_time = models.TimeField(null=True, blank=True)
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["label"]

    def __str__(self):
        return self.label


class TransportCar(models.Model):
    label = models.CharField(max_length=120)
    plate_number = models.CharField(max_length=60, blank=True)
    places = models.PositiveIntegerField(default=0)
    depot = models.ForeignKey(
        TransportDepot,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="cars",
    )
    route = models.ForeignKey(
        TransportRoute,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="cars",
    )
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["label"]

    def __str__(self):
        return self.label


class TransportDriver(models.Model):
    user = models.OneToOneField(
        "accounts.CustomUser",
        on_delete=models.CASCADE,
        related_name="transport_driver_profile",
    )
    car = models.ForeignKey(
        TransportCar,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="drivers",
    )
    phone = models.CharField(max_length=30, blank=True)
    license_number = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self):
        return self.user.full_name


class TransportTrip(models.Model):
    driver = models.ForeignKey(
        TransportDriver,
        on_delete=models.CASCADE,
        related_name="trips",
    )
    car = models.ForeignKey(
        TransportCar,
        on_delete=models.PROTECT,
        related_name="trips",
    )
    route = models.ForeignKey(
        TransportRoute,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="trips",
    )
    service_date = models.DateField()
    departure_time = models.TimeField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-service_date", "-created_at"]

    def __str__(self):
        return f"{self.car.label} - {self.service_date}"


class TransportPayment(models.Model):
    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name="transport_payments",
    )
    car = models.ForeignKey(
        TransportCar,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    commune = models.ForeignKey(
        TransportCommune,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="payments",
    )
    tarif = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    month = models.PositiveSmallIntegerField(null=True, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    operateur = models.CharField(max_length=20, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)
    reference = models.CharField(max_length=60, blank=True)

    class Meta:
        ordering = ["-paid_at"]

    def __str__(self):
        return f"{self.etudiant.matricule} - {self.car.label}"
