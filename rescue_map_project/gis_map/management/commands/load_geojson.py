import json
import os
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from maps.models import Region, MapPoint
from django.contrib.contenttypes.models import ContentType

class Command(BaseCommand):
    help = "Load geojson files into Region / MapPoint"

    def add_arguments(self, parser):
        parser.add_argument('--geo-folder', type=str, default='data/geo', help='folder path to geojson files')

    def handle(self, *args, **options):
        folder = options['geo_folder']
        regions_fp = os.path.join(folder, 'regions.geojson')
        points_fp = os.path.join(folder, 'points.geojson')

        if os.path.exists(regions_fp):
            with open(regions_fp, 'r', encoding='utf-8') as f:
                gj = json.load(f)
                for feat in gj.get('features', []):
                    props = feat.get('properties', {})
                    geom_json = json.dumps(feat.get('geometry'))
                    geom = GEOSGeometry(geom_json, srid=4326)
                    Region.objects.update_or_create(
                        name=props.get('name') or props.get('id'),
                        defaults={
                            'description': props.get('description',''),
                            'geom': geom,
                            'properties': props,
                            'source': props.get('source', 'geojson'),
                        }
                    )
            self.stdout.write(self.style.SUCCESS("Loaded regions"))

        if os.path.exists(points_fp):
            with open(points_fp, 'r', encoding='utf-8') as f:
                gj = json.load(f)
                for feat in gj.get('features', []):
                    props = feat.get('properties', {})
                    geom_json = json.dumps(feat.get('geometry'))
                    geom = GEOSGeometry(geom_json, srid=4326)
                    # optional: link to domain objects by content_type + object_id if provided in props
                    ct = None
                    obj_id = None
                    if 'linked_model' in props and 'linked_id' in props:
                        try:
                            ct = ContentType.objects.get(model=props['linked_model'])
                            obj_id = str(props['linked_id'])
                        except ContentType.DoesNotExist:
                            ct = None
                            obj_id = None
                    MapPoint.objects.create(
                        title=props.get('title'),
                        description=props.get('description',''),
                        content_type=ct,
                        object_id=obj_id,
                        geom=geom,
                        properties=props,
                        source=props.get('source','geojson'),
                        is_public=props.get('is_public', True),
                    )
            self.stdout.write(self.style.SUCCESS("Loaded points"))
