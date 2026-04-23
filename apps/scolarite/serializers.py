from decimal import Decimal

from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.actualites.models import Article
from apps.actualites.serializers import ArticleListSerializer
from apps.mediatheque.serializers import MediaItemSerializer

from .models import EmploiDuTempsItem, Etudiant, ForumPost, Note, Promotion, StudentDocument


class PromotionSerializer(serializers.ModelSerializer):
    academic_year = serializers.CharField(read_only=True)

    class Meta:
        model = Promotion
        fields = ["id", "label", "year_start", "year_end", "academic_year"]


class EtudiantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    photo = MediaItemSerializer(read_only=True)
    formation_name = serializers.CharField(source="formation.nom", read_only=True)
    formation_code = serializers.CharField(source="formation.code", read_only=True)
    promotion = PromotionSerializer(read_only=True)

    class Meta:
        model = Etudiant
        fields = [
            "id",
            "matricule",
            "user",
            "formation_name",
            "formation_code",
            "promotion",
            "pays",
            "photo",
            "rang_promotion",
            "solde_scolarite",
        ]


class NoteSerializer(serializers.ModelSerializer):
    mention = serializers.CharField(read_only=True)
    validation = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id",
            "matiere",
            "coefficient",
            "credits",
            "note",
            "semestre",
            "annee_academique",
            "mention",
            "validation",
        ]

    def get_validation(self, obj):
        return bool(obj.note >= Decimal("10.00"))


class EmploiDuTempsSerializer(serializers.ModelSerializer):
    color = serializers.SerializerMethodField()

    class Meta:
        model = EmploiDuTempsItem
        fields = [
            "id",
            "matiere",
            "enseignant",
            "salle",
            "type",
            "debut",
            "fin",
            "color",
        ]

    def get_color(self, obj):
        return {
            "cours": "#22C55E",
            "td": "#FACC15",
            "examen": "#EF4444",
            "ferie": "#94A3B8",
        }.get(obj.type, "#22C55E")


class StudentDocumentSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentDocument
        fields = [
            "id",
            "title",
            "type_document",
            "semester",
            "academic_year",
            "is_generated",
            "generated_at",
            "download_url",
        ]

    def get_download_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return ""


class ForumPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)

    class Meta:
        model = ForumPost
        fields = [
            "id",
            "category",
            "title",
            "content",
            "author_name",
            "replies_count",
            "created_at",
        ]


class StudentDashboardSerializer(serializers.Serializer):
    moyenne_generale = serializers.FloatField()
    rang_promotion = serializers.IntegerField()
    prochain_examen = serializers.CharField(allow_blank=True)
    solde_scolarite = serializers.CharField()
    trend = serializers.ListField(child=serializers.DictField())
    prochains_cours = EmploiDuTempsSerializer(many=True)
    actualites = ArticleListSerializer(many=True)
