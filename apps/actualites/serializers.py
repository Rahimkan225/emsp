from django.utils.text import slugify
from rest_framework import serializers

from apps.mediatheque.serializers import MediaItemSerializer
from apps.mediatheque.models import MediaItem

from .models import Article, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "nom", "slug"]


class TagNameListField(serializers.ListField):
    def get_attribute(self, instance):
        if instance is None:
            return []
        return list(instance.tags.values_list("nom", flat=True))


class ArticleSerializer(serializers.ModelSerializer):
    cover = MediaItemSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    category = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "titre",
            "slug",
            "extrait",
            "contenu",
            "cover",
            "tags",
            "category",
            "publie_le",
        ]

    def get_category(self, obj):
        tags = list(obj.tags.all())
        if not tags:
            return "Actualite"
        return sorted(tags, key=lambda item: item.nom.lower())[0].nom


class ArticleListSerializer(ArticleSerializer):
    class Meta(ArticleSerializer.Meta):
        fields = [
            "id",
            "titre",
            "slug",
            "extrait",
            "cover",
            "tags",
            "category",
            "publie_le",
        ]


class ArticleAdminSerializer(serializers.ModelSerializer):
    cover = MediaItemSerializer(read_only=True)
    cover_id = serializers.PrimaryKeyRelatedField(
        source="cover",
        queryset=MediaItem.objects.all(),
        write_only=True,
        allow_null=True,
        required=False,
    )
    tags = TagNameListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
    )
    author_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "titre",
            "slug",
            "extrait",
            "contenu",
            "cover",
            "cover_id",
            "tags",
            "status",
            "is_published",
            "author_name",
            "publie_le",
            "updated_at",
        ]

    def get_author_name(self, obj):
        if not obj.created_by:
            return "EMSP"
        return obj.created_by.get_full_name() or obj.created_by.username or obj.created_by.email

    def get_status(self, obj):
        return "Publie" if obj.is_published else "Brouillon"

    def validate_cover_id(self, value):
        if value and value.type != "image":
            raise serializers.ValidationError("La couverture doit etre une image.")
        return value

    def validate(self, attrs):
        title = attrs.get("titre") or getattr(self.instance, "titre", "")
        slug = attrs.get("slug")
        if not slug:
            base_slug = slugify(title) or "article"
            slug = base_slug
            queryset = Article.objects.all()
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            suffix = 2
            while queryset.filter(slug=slug).exists():
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            attrs["slug"] = slug
        return attrs

    def _sync_tags(self, article, tags):
        if tags is None:
            return
        tag_objects = []
        for tag_name in tags:
            cleaned = tag_name.strip()
            if not cleaned:
                continue
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(cleaned),
                defaults={"nom": cleaned},
            )
            if tag.nom != cleaned:
                tag.nom = cleaned
                tag.save(update_fields=["nom"])
            tag_objects.append(tag)
        article.tags.set(tag_objects)

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        article = Article.objects.create(**validated_data)
        self._sync_tags(article, tags)
        return article

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._sync_tags(instance, tags)
        return instance
