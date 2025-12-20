from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import MapPoint, Region

class MapPointGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = MapPoint
        geo_field = "geom"
        fields = ('id','title','description','properties','source','is_public','created_at','updated_at','content_type','object_id')

    # optional: represent content_type as model name
    content_type = serializers.SerializerMethodField()
    def get_content_type(self, obj):
        return obj.content_type.model if obj.content_type else None

class RegionGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Region
        geo_field = "geom"
        fields = ('id','name','description','properties','source','created_at','updated_at')
