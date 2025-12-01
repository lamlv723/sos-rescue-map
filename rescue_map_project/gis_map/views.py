from django.shortcuts import render

def index(request):
    return render(request, 'gis_map/index.html')