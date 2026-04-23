from django.core.management.base import BaseCommand

from apps.scolarite.demo import ensure_admin_bootstrap_data, ensure_portal_demo_data


class Command(BaseCommand):
    help = "Create or update the EMSP admin bootstrap users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--with-portal-demo",
            action="store_true",
            help="Also seed the portal demo data once the admin bootstrap is ready.",
        )

    def handle(self, *args, **options):
        bootstrap_users = ensure_admin_bootstrap_data()
        emails = ", ".join(user.email for user in bootstrap_users.values())

        if options["with_portal_demo"]:
            ensure_portal_demo_data(bootstrap_users=bootstrap_users)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Bootstrap admin pret et donnees portail verifiees: {emails}"
                )
            )
            return

        self.stdout.write(self.style.SUCCESS(f"Bootstrap admin pret: {emails}"))
