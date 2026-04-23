from decimal import Decimal

from rest_framework import serializers

from .models import Paiement


class PaiementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="etudiant.user.full_name", read_only=True)
    matricule = serializers.CharField(source="etudiant.matricule", read_only=True)
    formation_name = serializers.CharField(source="etudiant.formation.nom", read_only=True)
    student_country = serializers.CharField(source="etudiant.get_pays_display", read_only=True)
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Paiement
        fields = [
            "id",
            "student_name",
            "matricule",
            "formation_name",
            "student_country",
            "montant",
            "operateur",
            "phone_number",
            "reference",
            "statut",
            "status_label",
            "description",
            "created_at",
            "confirmed_at",
        ]

    def get_status_label(self, obj):
        return obj.get_statut_display()


class PaiementInitiateSerializer(serializers.Serializer):
    operateur = serializers.ChoiceField(choices=["orange", "mtn", "wave"])
    phone = serializers.CharField(max_length=30)
    montant = serializers.DecimalField(max_digits=12, decimal_places=2)
    description = serializers.CharField(max_length=255)


class PaiementSummarySerializer(serializers.Serializer):
    amount_due = serializers.CharField()
    amount_paid = serializers.CharField()
    remaining_balance = serializers.CharField()
    transactions = PaiementSerializer(many=True)
