from apps.core.models import SiteConfig
from apps.formations.models import Filiere


def global_context(request):
    site = SiteConfig.get()
    fsp = Filiere.objects.filter(niveau="FSP", is_active=True).order_by("ordre")
    licences = Filiere.objects.filter(niveau="LICENCE", is_active=True).order_by("ordre")
    masters = Filiere.objects.filter(niveau="MASTER", is_active=True).order_by("ordre")
    certifiantes = Filiere.objects.filter(niveau="FCQ", is_active=True).order_by("ordre")

    return {
        "site": site,
        "nav_fsp": fsp,
        "nav_licences": licences,
        "nav_masters": masters,
        "nav_certifiantes": certifiantes,
    }
