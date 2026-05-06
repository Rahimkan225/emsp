from pathlib import Path

from rest_framework import serializers

from .models import Candidature, CandidatureDocument


MAX_PHOTO_SIZE = 2 * 1024 * 1024
MAX_DOCUMENT_SIZE = 5 * 1024 * 1024
PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png"}
DOCUMENT_EXTENSIONS = {".pdf"}
ADDITIONAL_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"}


def _get_extension(file_obj):
    return Path(file_obj.name).suffix.lower()


class CandidatureDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidatureDocument
        fields = ["id", "original_name", "file", "created_at"]


class CandidatureCreateSerializer(serializers.ModelSerializer):
    additional_documents = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True,
        write_only=True,
    )
    confirm_email = serializers.EmailField(write_only=True)
    additional_documents_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Candidature
        fields = [
            "id",
            "formation",
            "dossier_number",
            "status",
            "first_name",
            "last_name",
            "date_of_birth",
            "place_of_birth",
            "nationality",
            "residence_country",
            "address",
            "phone",
            "whatsapp",
            "email",
            "confirm_email",
            "photo",
            "highest_degree",
            "institution_name",
            "graduation_year",
            "diploma_country",
            "transcript_file",
            "diploma_file",
            "motivation_file",
            "professional_experience",
            "motivation_text",
            "accuracy_certified",
            "terms_accepted",
            "additional_documents",
            "additional_documents_count",
            "created_at",
        ]
        read_only_fields = ["id", "dossier_number", "status", "created_at"]

    def get_additional_documents_count(self, obj):
        return obj.additional_documents.count()

    def validate_photo(self, value):
        extension = _get_extension(value)
        if extension not in PHOTO_EXTENSIONS:
            raise serializers.ValidationError("La photo doit etre au format JPG ou PNG.")
        if value.size > MAX_PHOTO_SIZE:
            raise serializers.ValidationError("La photo ne doit pas depasser 2 Mo.")
        return value

    def validate_transcript_file(self, value):
        return self._validate_document(value, "Le releve de notes")

    def validate_diploma_file(self, value):
        return self._validate_document(value, "Le diplome")

    def validate_motivation_file(self, value):
        if not value:
            return value
        return self._validate_document(value, "La lettre de motivation")

    def validate_additional_documents(self, value):
        if len(value) > 5:
            raise serializers.ValidationError("Vous pouvez joindre au maximum 5 documents supplementaires.")

        for file_obj in value:
            extension = _get_extension(file_obj)
            if extension not in ADDITIONAL_DOCUMENT_EXTENSIONS:
                raise serializers.ValidationError(
                    "Les documents supplementaires doivent etre en PDF, DOC, DOCX, JPG ou PNG."
                )
            if file_obj.size > MAX_DOCUMENT_SIZE:
                raise serializers.ValidationError(
                    "Chaque document supplementaire doit peser au maximum 5 Mo."
                )
        return value

    def validate(self, attrs):
        confirm_email = attrs.pop("confirm_email")
        if attrs["email"].lower() != confirm_email.lower():
            raise serializers.ValidationError(
                {"confirm_email": "Les deux adresses email doivent correspondre."}
            )

        motivation_text = (attrs.get("motivation_text") or "").strip()
        motivation_file = attrs.get("motivation_file")
        if not motivation_text and not motivation_file:
            raise serializers.ValidationError(
                {
                    "motivation_text": "Ajoutez un texte de motivation ou joignez une lettre au format PDF."
                }
            )

        if not attrs.get("accuracy_certified"):
            raise serializers.ValidationError(
                {"accuracy_certified": "Vous devez certifier l'exactitude des informations fournies."}
            )

        if not attrs.get("terms_accepted"):
            raise serializers.ValidationError(
                {"terms_accepted": "Vous devez accepter les conditions d'admission."}
            )

        return attrs

    def create(self, validated_data):
        additional_documents = validated_data.pop("additional_documents", [])
        candidature = super().create(validated_data)

        for document in additional_documents:
            CandidatureDocument.objects.create(
                candidature=candidature,
                file=document,
                original_name=document.name,
            )

        return candidature

    def _validate_document(self, value, label):
        extension = _get_extension(value)
        if extension not in DOCUMENT_EXTENSIONS:
            raise serializers.ValidationError(f"{label} doit etre fourni au format PDF.")
        if value.size > MAX_DOCUMENT_SIZE:
            raise serializers.ValidationError(f"{label} ne doit pas depasser 5 Mo.")
        return value


class CandidatureSubmissionSerializer(serializers.ModelSerializer):
    acknowledgement_url = serializers.SerializerMethodField()

    class Meta:
        model = Candidature
        fields = [
            "id",
            "dossier_number",
            "status",
            "acknowledgement_url",
            "created_at",
        ]

    def get_acknowledgement_url(self, obj):
        request = self.context.get("request")
        if not request:
            return ""
        return request.build_absolute_uri(f"/api/inscriptions/{obj.dossier_number}/acknowledgement/")


def _build_absolute_file_url(request, file_field):
    if not file_field:
        return ""
    try:
        url = file_field.url
    except ValueError:
        return ""
    if not request:
        return url
    return request.build_absolute_uri(url)


class AdminCandidatureDocumentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = CandidatureDocument
        fields = ["id", "original_name", "created_at", "url"]

    def get_url(self, obj):
        return _build_absolute_file_url(self.context.get("request"), obj.file)


class CandidatureAdminListSerializer(serializers.ModelSerializer):
    formation_name = serializers.CharField(source="formation.nom", read_only=True)
    formation_code = serializers.CharField(source="formation.code", read_only=True)
    nationality_label = serializers.CharField(source="get_nationality_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    acknowledgement_url = serializers.SerializerMethodField()

    class Meta:
        model = Candidature
        fields = [
            "id",
            "dossier_number",
            "status",
            "status_label",
            "first_name",
            "last_name",
            "email",
            "phone",
            "nationality",
            "nationality_label",
            "formation_name",
            "formation_code",
            "created_at",
            "updated_at",
            "acknowledgement_url",
        ]

    def get_acknowledgement_url(self, obj):
        request = self.context.get("request")
        if not request:
            return ""
        return request.build_absolute_uri(f"/api/inscriptions/{obj.dossier_number}/acknowledgement/")


class CandidatureAdminDetailSerializer(CandidatureAdminListSerializer):
    highest_degree_label = serializers.CharField(source="get_highest_degree_display", read_only=True)
    photo_url = serializers.SerializerMethodField()
    transcript_url = serializers.SerializerMethodField()
    diploma_url = serializers.SerializerMethodField()
    motivation_file_url = serializers.SerializerMethodField()
    additional_documents = AdminCandidatureDocumentSerializer(many=True, read_only=True)

    class Meta(CandidatureAdminListSerializer.Meta):
        fields = CandidatureAdminListSerializer.Meta.fields + [
            "date_of_birth",
            "place_of_birth",
            "residence_country",
            "address",
            "whatsapp",
            "photo_url",
            "highest_degree",
            "highest_degree_label",
            "institution_name",
            "graduation_year",
            "diploma_country",
            "transcript_url",
            "diploma_url",
            "motivation_file_url",
            "professional_experience",
            "motivation_text",
            "accuracy_certified",
            "terms_accepted",
            "additional_documents",
        ]

    def get_photo_url(self, obj):
        return _build_absolute_file_url(self.context.get("request"), obj.photo)

    def get_transcript_url(self, obj):
        return _build_absolute_file_url(self.context.get("request"), obj.transcript_file)

    def get_diploma_url(self, obj):
        return _build_absolute_file_url(self.context.get("request"), obj.diploma_file)

    def get_motivation_file_url(self, obj):
        return _build_absolute_file_url(self.context.get("request"), obj.motivation_file)


class CandidatureAdminStatusSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Candidature.STATUS_CHOICES)

    class Meta:
        model = Candidature
        fields = ["status"]
