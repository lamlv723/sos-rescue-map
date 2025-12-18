from django.shortcuts import render
def index(request):
    return render(request, 'gis_map/index.html')

from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import MapPoint, Region
from .serializers import MapPointGeoSerializer, RegionGeoSerializer

class MapPointListAPIView(generics.ListAPIView):
    queryset = MapPoint.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = MapPointGeoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # add filtering by content_type/object_id, or bbox/distance if implemented

class MapPointDetailAPIView(generics.RetrieveAPIView):
    queryset = MapPoint.objects.all()
    serializer_class = MapPointGeoSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticatedOrReadOnly]

class RegionListAPIView(generics.ListAPIView):
    queryset = Region.objects.all().order_by('name')
    serializer_class = RegionGeoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class RegionDetailAPIView(generics.RetrieveAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionGeoSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticatedOrReadOnly]
