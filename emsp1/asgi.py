"""
ASGI config for emsp1 project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emsp1.settings')

application = get_asgi_application()

from apps.scolarite.demo import ensure_admin_bootstrap_data_on_startup

ensure_admin_bootstrap_data_on_startup()
