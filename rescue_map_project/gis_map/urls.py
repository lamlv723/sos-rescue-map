from django.urls import path
from . import views

app_name = 'gis_map'

urlpatterns = [
    path('', views.index, name='index'),

    path('points/', views.MapPointListAPIView.as_view(), name='map-point-list'),
    path('points/<uuid:id>/', views.MapPointDetailAPIView.as_view(), name='map-point-detail'),
    path('regions/', views.RegionListAPIView.as_view(), name='region-list'),
    path('regions/<uuid:id>/', views.RegionDetailAPIView.as_view(), name='region-detail'),
]