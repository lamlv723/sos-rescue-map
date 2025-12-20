# maps/signals.py
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.gis.geos import Point

from submissions.models import SOSRequest
from gis_map.models import MapPoint

@receiver(post_save, sender=SOSRequest)
def sync_sos_to_map(sender, instance, created, **kwargs):
    if instance.latitude is None or instance.longitude is None:
        return

    ct = ContentType.objects.get_for_model(SOSRequest)

    MapPoint.objects.update_or_create(
        content_type=ct,
        object_id=str(instance.request_id),
        defaults={
            "title": f"SOS #{instance.request_id}",
            "description": instance.message,
            "geom": Point(instance.longitude, instance.latitude, srid=4326),
            "properties": {
                "status": instance.status,
                "priority": instance.priority,
            },
            "source": "auto:sos",
            "is_public": True,
        },
    )
