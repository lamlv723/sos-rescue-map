from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.db import models as geomodels
from django.db import models
import uuid

class Region(geomodels.Model):
    """
    Polygon region for administrative boundaries or custom operational zones.
    Use SRID=4326 (WGS84) for GeoJSON compatibility with most web maps.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    # geometry polygon, SRID 4326
    geom = geomodels.PolygonField(srid=4326, spatial_index=True)
    properties = models.JSONField(default=dict, blank=True)  # free-form metadata
    source = models.CharField(max_length=255, blank=True, null=True)  # e.g., "GADM", "admin-upload"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Region"
        verbose_name_plural = "Regions"
        indexes = [
            # spatial_index is created by GeoDjango; additional indexes can be added if needed
        ]

    def __str__(self):
        return self.name


class MapPoint(geomodels.Model):
    """
    Generic point that can reference any domain object (SOSRequest, RescueTeam, RescueResource, User).
    Use ContentType + object_id (GenericForeignKey) for flexible linking.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    # Generic relation to domain objects (SOSRequest, RescueTeam, RescueResource, AdminUnit, User...)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)  # store PK as string to be generic
    content_object = GenericForeignKey('content_type', 'object_id')

    # geometry point, SRID=4326
    geom = geomodels.PointField(srid=4326, spatial_index=True)
    properties = models.JSONField(default=dict, blank=True)  # e.g., {"status":"pending","priority":"high"}
    source = models.CharField(max_length=255, blank=True, null=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Map Point"
        verbose_name_plural = "Map Points"
        # add DB indexes on common query fields
        indexes = [
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title or str(self.id)
