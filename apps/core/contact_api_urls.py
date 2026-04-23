from django.urls import path

from .api_urls import ContactMessageApiView


urlpatterns = [path("", ContactMessageApiView.as_view(), name="contact_message_api")]
