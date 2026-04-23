from django.db.models import Q
from django.urls import path
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsStaffOrAdmin

from .models import Article, Tag
from .serializers import ArticleAdminSerializer, ArticleSerializer, TagSerializer


class PublicNewsPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 50


def _parse_limit(value):
    try:
        return max(1, int(value))
    except (TypeError, ValueError):
        return None


class ArticleListApi(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ArticleSerializer
    pagination_class = PublicNewsPagination

    def get_queryset(self):
        queryset = (
            Article.objects.filter(is_published=True)
            .select_related("cover")
            .prefetch_related("tags")
            .order_by("-publie_le")
        )

        tag = self.request.query_params.get("tag", "").strip()
        category = self.request.query_params.get("category", "").strip()
        search = self.request.query_params.get("search", "").strip()
        limit = _parse_limit(self.request.query_params.get("limit"))

        active_tag = tag or category
        if active_tag:
            queryset = queryset.filter(
                Q(tags__slug__iexact=active_tag) | Q(tags__nom__iexact=active_tag)
            ).distinct()
        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search)
                | Q(extrait__icontains=search)
                | Q(contenu__icontains=search)
            )
        if limit:
            queryset = queryset[:limit]

        return queryset


class ArticleDetailApi(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ArticleSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Article.objects.filter(is_published=True)
            .select_related("cover")
            .prefetch_related("tags")
        )


class ArticleAdminListApi(APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        queryset = Article.objects.select_related("cover", "created_by").prefetch_related("tags")
        status = request.query_params.get("status", "").strip().lower()
        search = request.query_params.get("search", "").strip()

        if status == "published":
            queryset = queryset.filter(is_published=True)
        elif status == "draft":
            queryset = queryset.filter(is_published=False)

        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search)
                | Q(slug__icontains=search)
                | Q(extrait__icontains=search)
                | Q(contenu__icontains=search)
            )

        serializer = ArticleAdminSerializer(queryset.order_by("-updated_at", "-publie_le"), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ArticleAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save(created_by=request.user)
        return Response(ArticleAdminSerializer(article).data, status=201)


class ArticleAdminDetailApi(APIView):
    permission_classes = [IsStaffOrAdmin]

    def get_object(self, pk):
        return generics.get_object_or_404(
            Article.objects.select_related("cover", "created_by").prefetch_related("tags"),
            pk=pk,
        )

    def get(self, request, pk):
        serializer = ArticleAdminSerializer(self.get_object(pk))
        return Response(serializer.data)

    def patch(self, request, pk):
        article = self.get_object(pk)
        serializer = ArticleAdminSerializer(article, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ArticleAdminSerializer(article).data)

    def delete(self, request, pk):
        article = self.get_object(pk)
        article.delete()
        return Response(status=204)


@api_view(["GET"])
@permission_classes([AllowAny])
def article_tags_api(request):
    serializer = TagSerializer(Tag.objects.order_by("nom"), many=True)
    return Response(serializer.data)


urlpatterns = [
    path("admin/", ArticleAdminListApi.as_view(), name="article_admin_list_api"),
    path("admin/<int:pk>/", ArticleAdminDetailApi.as_view(), name="article_admin_detail_api"),
    path("tags/", article_tags_api, name="article_tags_api"),
    path("", ArticleListApi.as_view(), name="article_list_api"),
    path("<slug:slug>/", ArticleDetailApi.as_view(), name="article_detail_api"),
]
