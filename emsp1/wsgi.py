"""
WSGI config for emsp1 project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emsp1.settings')

application = get_wsgi_application()

from apps.scolarite.demo import ensure_admin_bootstrap_data_on_startup

ensure_admin_bootstrap_data_on_startup()
