from django.shortcuts import render


def portail_login(request):
    return render(request, "public/etudiant_login.html")
