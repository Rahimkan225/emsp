from django.shortcuts import get_object_or_404, render

from .models import Filiere


def liste_formations(request):
    niveau = request.GET.get("niveau", "")
    formations = Filiere.objects.filter(is_active=True)
    if niveau:
        formations = formations.filter(niveau=niveau)
    return render(
        request,
        "public/formations.html",
        {"formations": formations, "niveau_actif": niveau},
    )


def detail_formation(request, code):
    formation = get_object_or_404(Filiere, code=code, is_active=True)
    return render(request, "public/formation_detail.html", {"formation": formation})
