from django.test import TestCase
from django.urls import reverse
from gis_map.models import MapPoint, Region
from django.contrib.gis.geos import Point, Polygon

class GeoAPITests(TestCase):
    def setUp(self):
        Region.objects.create(name="Test Region", geom=Polygon(((0,0),(0,1),(1,1),(1,0),(0,0))))
        MapPoint.objects.create(title="P1", geom=Point(0.5,0.5))

    def test_region_list_returns_geojson(self):
        url = reverse('gis_map:region-list')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Depending on serializer renderer, it might be a FeatureCollection or list of Feature
        # If using GeoFeatureModelSerializer default, expect FeatureCollection
        self.assertIn('features', data)

    def test_point_list_returns_geojson(self):
        url = reverse('gis_map:map-point-list')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('features', data)
