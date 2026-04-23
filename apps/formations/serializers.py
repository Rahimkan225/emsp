from rest_framework import serializers

from apps.mediatheque.serializers import MediaItemSerializer

from .models import Filiere


class FiliereSerializer(serializers.ModelSerializer):
    cover = MediaItemSerializer(read_only=True)

    class Meta:
        model = Filiere
        fields = [
            "id",
            "nom",
            "code",
            "niveau",
            "duree",
            "description",
            "cover",
            "ordre",
            "is_active",
        ]
