from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import connection
from django.db.utils import OperationalError, ProgrammingError
from django.utils import timezone

from apps.actualites.models import Article
from apps.comptabilite.models import Paiement
from apps.formations.models import Filiere

from .models import EmploiDuTempsItem, Etudiant, ForumPost, Note, Promotion, StudentDocument


User = get_user_model()

ADMIN_BOOTSTRAP_USERS = {
    "admin": (
        "admin@emsp.int",
        {
            "first_name": "Admin",
            "last_name": "EMSP",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
        },
    ),
    "direction": (
        "direction@emsp.int",
        {
            "first_name": "Aminata",
            "last_name": "Diallo",
            "role": "direction",
            "is_staff": True,
        },
    ),
    "compta": (
        "compta@emsp.int",
        {
            "first_name": "Koffi",
            "last_name": "Traore",
            "role": "compta",
            "is_staff": True,
        },
    ),
    "staff": (
        "staff@emsp.int",
        {
            "first_name": "Mariam",
            "last_name": "Toure",
            "role": "staff",
            "is_staff": True,
        },
    ),
}


def legacy_student_table_exists():
    return "etudiant" in connection.introspection.table_names()


def _ensure_user(email, defaults):
    user, _ = User.objects.get_or_create(
        email=email,
        defaults={
            "username": email,
            **defaults,
        },
    )
    if not user.check_password("emsp12345"):
        user.set_password("emsp12345")
        user.save()
    return user


def ensure_admin_bootstrap_data():
    return {
        key: _ensure_user(email, defaults)
        for key, (email, defaults) in ADMIN_BOOTSTRAP_USERS.items()
    }


def get_admin_bootstrap_users():
    bootstrap_users = {}
    for key, (email, _) in ADMIN_BOOTSTRAP_USERS.items():
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return {}
        bootstrap_users[key] = user
    return bootstrap_users


def ensure_admin_bootstrap_data_on_startup():
    try:
        if User._meta.db_table not in connection.introspection.table_names():
            return False
    except (OperationalError, ProgrammingError):
        return False

    ensure_admin_bootstrap_data()
    return True


def ensure_portal_demo_data(bootstrap_users=None):
    if legacy_student_table_exists():
        return

    if User.objects.exists() and Etudiant.objects.exists():
        return

    if bootstrap_users is None:
        bootstrap_users = get_admin_bootstrap_users()

    formations = {
        "ADM": Filiere.objects.get_or_create(
            code="ADM",
            defaults={
                "nom": "Administration et Management Postal",
                "niveau": "FSP",
                "duree": "2 ans",
                "description": "Programme superieur axe sur la gestion et la performance des services postaux.",
                "ordre": 1,
                "is_active": True,
            },
        )[0],
        "INP": Filiere.objects.get_or_create(
            code="INP",
            defaults={
                "nom": "Ingenierie Numerique Postale",
                "niveau": "MASTER",
                "duree": "2 ans",
                "description": "Parcours de transformation numerique pour les institutions et services publics.",
                "ordre": 2,
                "is_active": True,
            },
        )[0],
        "CTR": Filiere.objects.get_or_create(
            code="CTR",
            defaults={
                "nom": "Controle et Regulation",
                "niveau": "FCQ",
                "duree": "6 mois",
                "description": "Cycle court de specialisation sur la conformite et la regulation sectorielle.",
                "ordre": 3,
                "is_active": True,
            },
        )[0],
    }

    promotion, _ = Promotion.objects.get_or_create(
        formation=formations["ADM"],
        label="Promotion 2025-2026",
        defaults={"year_start": 2025, "year_end": 2026},
    )

    direction_user = bootstrap_users.get("direction") if bootstrap_users else None
    staff_user = bootstrap_users.get("staff") if bootstrap_users else None

    student_specs = [
        ("etudiant@emsp.int", "Awa", "Kone", "EMSP25001", "CI", 3, Decimal("125000.00")),
        ("benin@emsp.int", "Ibrahim", "Bio", "EMSP25002", "BJ", 1, Decimal("0.00")),
        ("senegal@emsp.int", "Fatou", "Ndiaye", "EMSP25003", "SN", 2, Decimal("45000.00")),
        ("niger@emsp.int", "Moussa", "Issa", "EMSP25004", "NE", 4, Decimal("90000.00")),
        ("mali@emsp.int", "Salif", "Diarra", "EMSP25005", "ML", 5, Decimal("20000.00")),
    ]

    students = []
    for email, first_name, last_name, matricule, pays, rang, solde in student_specs:
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": first_name,
                "last_name": last_name,
                "role": "etudiant",
            },
        )
        if not user.check_password("emsp12345"):
            user.set_password("emsp12345")
            user.save()

        student, _ = Etudiant.objects.get_or_create(
            user=user,
            defaults={
                "matricule": matricule,
                "formation": formations["ADM"],
                "promotion": promotion,
                "pays": pays,
                "lieu_naissance": "Abidjan",
                "rang_promotion": rang,
                "solde_scolarite": solde,
            },
        )
        students.append(student)

    main_student = students[0]

    if not main_student.notes.exists():
        note_specs = [
            ("Management postal", Decimal("2.00"), Decimal("13.50"), "S1", 4),
            ("Regulation postale", Decimal("1.50"), Decimal("11.50"), "S1", 3),
            ("Transformation digitale", Decimal("2.00"), Decimal("14.50"), "S2", 4),
            ("Logistique du dernier kilometre", Decimal("1.50"), Decimal("12.00"), "S2", 3),
            ("Pilotage de la performance", Decimal("2.00"), Decimal("15.00"), "S3", 4),
            ("Innovation de service", Decimal("1.00"), Decimal("13.00"), "S3", 2),
            ("Data & qualite", Decimal("1.50"), Decimal("16.00"), "S4", 3),
            ("Projet professionnel", Decimal("2.00"), Decimal("14.00"), "S4", 4),
        ]
        for matiere, coefficient, note, semestre, credits in note_specs:
            Note.objects.create(
                etudiant=main_student,
                matiere=matiere,
                coefficient=coefficient,
                note=note,
                semestre=semestre,
                credits=credits,
                annee_academique="2025-2026",
                is_validated=note >= 10,
            )

    if not EmploiDuTempsItem.objects.filter(promotion=promotion).exists():
        now = timezone.now().replace(minute=0, second=0, microsecond=0)
        monday = now - timedelta(days=now.weekday())
        schedule_specs = [
            ("Management postal", "Pr. Niamke", "Salle A1", "cours", monday.replace(hour=9), monday.replace(hour=11)),
            ("Transformation digitale", "Dr. Faye", "Salle Lab 2", "td", monday.replace(hour=14), monday.replace(hour=16)),
            ("Examen pilotage", "Jury EMSP", "Amphi 1", "examen", (monday + timedelta(days=2)).replace(hour=8), (monday + timedelta(days=2)).replace(hour=10)),
            ("Logistique du dernier kilometre", "Mme Bamba", "Salle B3", "cours", (monday + timedelta(days=3)).replace(hour=10), (monday + timedelta(days=3)).replace(hour=12)),
        ]
        for matiere, enseignant, salle, type_, debut, fin in schedule_specs:
            EmploiDuTempsItem.objects.create(
                promotion=promotion,
                matiere=matiere,
                enseignant=enseignant,
                salle=salle,
                type=type_,
                debut=debut,
                fin=fin,
            )

    if not main_student.documents.exists():
        StudentDocument.objects.bulk_create(
            [
                StudentDocument(
                    etudiant=main_student,
                    title="Certificat de scolarite 2025-2026",
                    type_document="certificat",
                    academic_year="2025-2026",
                    is_generated=True,
                    generated_at=timezone.now() - timedelta(days=10),
                ),
                StudentDocument(
                    etudiant=main_student,
                    title="Releve de notes - Semestre 1",
                    type_document="releve",
                    semester="S1",
                    academic_year="2025-2026",
                    is_generated=True,
                    generated_at=timezone.now() - timedelta(days=7),
                ),
                StudentDocument(
                    etudiant=main_student,
                    title="Bulletin - Semestre 2",
                    type_document="bulletin",
                    semester="S2",
                    academic_year="2025-2026",
                    is_generated=False,
                ),
            ]
        )

    if not ForumPost.objects.exists():
        forum_posts = [
            ForumPost(
                author=main_student.user,
                category="promotion",
                title="Organisation des revisions du semestre",
                content="Qui est disponible pour une session de revision jeudi apres-midi ?",
                replies_count=5,
            )
        ]
        if direction_user is not None:
            forum_posts.insert(
                0,
                ForumPost(
                    author=direction_user,
                    category="general",
                    title="Bienvenue sur le portail etudiant",
                    content="Utilisez cet espace pour suivre vos activites, paiements et documents.",
                    replies_count=8,
                ),
            )
        if staff_user is not None:
            forum_posts.append(
                ForumPost(
                    author=staff_user,
                    category="stages",
                    title="Offre de stage - Transformation digitale",
                    content="Une mission de stage est ouverte chez un operateur partenaire a Abidjan.",
                    replies_count=2,
                )
            )
        ForumPost.objects.bulk_create(forum_posts)

    if not main_student.paiements.exists():
        Paiement.objects.bulk_create(
            [
                Paiement(
                    etudiant=main_student,
                    montant=Decimal("150000.00"),
                    operateur="orange",
                    phone_number="+2250700000000",
                    reference="PAY-EMSP-001",
                    statut="confirmed",
                    description="Inscription annuelle 2025-2026",
                    confirmed_at=timezone.now() - timedelta(days=45),
                ),
                Paiement(
                    etudiant=main_student,
                    montant=Decimal("75000.00"),
                    operateur="wave",
                    phone_number="+2250700000000",
                    reference="PAY-EMSP-002",
                    statut="confirmed",
                    description="Acompte scolarite semestre 1",
                    confirmed_at=timezone.now() - timedelta(days=18),
                ),
                Paiement(
                    etudiant=main_student,
                    montant=Decimal("50000.00"),
                    operateur="mtn",
                    phone_number="+2250700000000",
                    reference="PAY-EMSP-003",
                    statut="pending",
                    description="Solde restant",
                ),
            ]
        )

    if not Article.objects.filter(is_published=True).exists():
        Article.objects.bulk_create(
            [
                Article(
                    titre="Rentree academique 2025-2026",
                    slug="rentree-academique-2025-2026",
                    extrait="L'EMSP ouvre une nouvelle annee academique sous le signe de l'innovation et de la professionnalisation.",
                    contenu="La nouvelle annee academique met l'accent sur les competences numeriques, la qualite de service et l'integration regionale.",
                    is_published=True,
                ),
                Article(
                    titre="Atelier regional sur la transformation postale",
                    slug="atelier-regional-transformation-postale",
                    extrait="Des experts des huit pays membres ont partage leurs retours d'experience a Abidjan.",
                    contenu="Pendant trois jours, responsables, apprenants et partenaires ont travaille sur les leviers de modernisation des operateurs.",
                    is_published=True,
                ),
            ]
        )
