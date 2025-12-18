"""
 Nạp dữ liệu giả (mock data) từ các file JSON vào database PostgreeSQL
run bằng các lệnh
python manage.py loaddata
python manage.py load_mock_data --mock-folder data/mock --flush
"""

import json
import os

from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.geos import GEOSGeometry, Point
from django.core.management.base import BaseCommand
from django.apps import apps
from gis_map.models import MapPoint, Region
from submissions.models import SOSRequest, RescueTeam, RescueResource, AdminUnit, TeamMember, RequestResource, \
    RequestTeam
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Load mock data into DB from JSON files in folder'

    def add_arguments(self, parser):
        parser.add_argument('--mock-folder', type=str, default='data/mock', help='folder path to mock json files')
        parser.add_argument('--flush', action='store_true', help='flush existing mock data (limited)')

    def handle(self, *args, **options):
        folder = options['mock_folder']
        if not os.path.isdir(folder):
            self.stdout.write(self.style.ERROR(f"Folder not found: {folder}"))
            return

        if options['flush']:
            MapPoint.objects.all().delete()
            Region.objects.all().delete()

            RequestTeam.objects.all().delete()
            RequestResource.objects.all().delete()

            SOSRequest.objects.all().delete()
            TeamMember.objects.all().delete()
            RescueTeam.objects.all().delete()
            RescueResource.objects.all().delete()
            AdminUnit.objects.all().delete()

            User.objects.exclude(is_superuser=True).delete()
            self.stdout.write(self.style.WARNING("Flushed existing mock data"))

        #users
        users_file = os.path.join(folder, 'users.json')
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                users = json.load(f)
                for item in users:
                    user, created = User.objects.update_or_create(
                        id=item.get('id'),
                        defaults={
                            'username': item.get('username'),
                            'email': item.get('email'),
                            'phone_number': item.get('phone_number'),
                            'role': item.get('role', 'USER'),
                            'is_staff': item.get('is_staff', False),
                            'is_superuser': item.get('is_superuser', False),
                        }
                    )
                    # set password (hash)
                    if item.get('password'):
                        user.set_password(item['password'])
                        user.save()
            self.stdout.write(self.style.SUCCESS('Loaded users'))

        # load admin units if any
        au_file = os.path.join(folder, 'admin_units.json')
        if os.path.exists(au_file):
            with open(au_file, 'r', encoding='utf-8') as f:
                for item in json.load(f):
                    AdminUnit.objects.update_or_create(
                        unit_id=item.get('unit_id'),
                        defaults={
                            'name': item.get('name'),
                            'description': item.get('description',''),
                            'type': item.get('type','TINH'),
                            'region_id': item.get('region_id'),
                        }
                    )
            self.stdout.write(self.style.SUCCESS('Loaded admin units.'))

        # --- load regions ---
        regions_file = os.path.join(folder, 'regions.json')
        if os.path.exists(regions_file):
            with open(regions_file, 'r', encoding='utf-8') as f:
                regions = json.load(f)

                for item in regions:
                    geom = GEOSGeometry(json.dumps(item['geometry']), srid=4326)

                    Region.objects.create(
                        name=item.get('name'),
                        description=item.get('description'),
                        geom=geom,
                        properties=item.get('properties', {}),
                        source=item.get('source', 'mock'),
                    )

            self.stdout.write(self.style.SUCCESS("Loaded regions"))

        # reteams
        teams_file = os.path.join(folder, 'teams.json')
        if os.path.exists(teams_file):
            with open(teams_file, 'r', encoding='utf-8') as f:
                for item in json.load(f):
                    RescueTeam.objects.update_or_create(
                        team_id=item.get('team_id'),
                        defaults={
                            'name': item.get('name'),
                            'status': item.get('status','AVAILABLE'),
                            'contact_phone': item.get('contact_phone'),
                            'location_lat': item.get('location_lat'),
                            'location_lng': item.get('location_lng'),
                        }
                    )
            self.stdout.write(self.style.SUCCESS('Loaded team.'))

        # team_members
        team_members_file = os.path.join(folder, 'team_members.json')
        if os.path.exists(team_members_file):
            with open(team_members_file, 'r', encoding='utf-8') as f:
                members = json.load(f)
                # members expected: list of { "member_id":1, "full_name":"Nguyen A", "team_id": 5, "role_in_team":"LEADER", "joined_at":"2025-01-01T08:00:00Z" }
                for item in members:
                    team = None
                    if item.get('team_id') is not None:
                        try:
                            team = RescueTeam.objects.get(team_id=item['team_id'])
                        except RescueTeam.DoesNotExist:
                            team = None
                    defaults = {
                        'full_name': item.get('full_name'),
                        'team': team,
                        'role_in_team': item.get('role_in_team', 'SUPPORT'),
                        'joined_at': item.get('joined_at'),
                    }
                    # if member_id present, use update_or_create to be idempotent; else create new
                    if item.get('member_id'):
                        TeamMember.objects.update_or_create(
                            member_id=item.get('member_id'),
                            defaults=defaults
                        )
                    else:
                        TeamMember.objects.create(**defaults)
            self.stdout.write(self.style.SUCCESS('Loaded team members'))

        # rescue_resources
        resources_file = os.path.join(folder, 'resources.json')
        if os.path.exists(resources_file):
            with open(resources_file, 'r', encoding='utf-8') as f:
                for item in json.load(f):
                    RescueResource.objects.update_or_create(
                        resource_id=item.get('resource_id'),
                        defaults={
                            'name': item.get('name'),
                            'type': item.get('type', 'VEHICLE'),
                            'status': item.get('status', 'AVAILABLE'),
                            'capacity_total': item.get('capacity_total', 0),
                            'capacity_available': item.get('capacity_available', 0),
                            'location_lat': item.get('location_lat'),
                            'location_lng': item.get('location_lng'),
                        }
                    )
            self.stdout.write(self.style.SUCCESS('Loaded rescue resources.'))


        # sos_request
        sos_file = os.path.join(folder, 'sos.json')
        if os.path.exists(sos_file):
            with open(sos_file, 'r', encoding='utf-8') as f:
                sos_list = json.load(f)
                for item in sos_list:
                    user = None
                    if item.get('user_id'):
                        try:
                            user = User.objects.get(pk=item['user_id'])
                        except User.DoesNotExist:
                            user = None
                    SOSRequest.objects.update_or_create(
                        request_id=item.get('request_id'),
                        defaults={
                            'user': user,
                            'status': item.get('status','PENDING'),
                            'priority': item.get('priority','MEDIUM'),
                            'address': item.get('address',''),
                            'message': item.get('message',''),
                            'contact_name': item.get('contact_name'),
                            'contact_phone': item.get('contact_phone'),
                            'assistance_types': item.get('assistance_types', []),
                            'image_url': item.get('image_url'),
                            'latitude': item.get('latitude'),
                            'longitude': item.get('longitude'),
                        }
                    )
            self.stdout.write(self.style.SUCCESS('Loaded sos request.'))

        # --- load request teams ---
        request_teams_file = os.path.join(folder, 'request_teams.json')
        if os.path.exists(request_teams_file):
            with open(request_teams_file, 'r', encoding='utf-8') as f:
                items = json.load(f)

                for item in items:
                    try:
                        sos = SOSRequest.objects.get(request_id=item['request_id'])
                        team = RescueTeam.objects.get(team_id=item['team_id'])

                        RequestTeam.objects.update_or_create(
                            request=sos,
                            team=team,
                            defaults={
                                'status': item.get('status', 'ASSIGNED')
                            }
                        )
                    except (SOSRequest.DoesNotExist, RescueTeam.DoesNotExist):
                        continue

            self.stdout.write(self.style.SUCCESS("Loaded request teams"))

        # --- load request resources ---
        request_resources_file = os.path.join(folder, 'request_resources.json')
        if os.path.exists(request_resources_file):
            with open(request_resources_file, 'r', encoding='utf-8') as f:
                items = json.load(f)

                for item in items:
                    try:
                        sos = SOSRequest.objects.get(request_id=item['request_id'])
                        resource = RescueResource.objects.get(resource_id=item['resource_id'])

                        RequestResource.objects.update_or_create(
                            request=sos,
                            resource=resource,
                            defaults={
                                'status': item.get('status', 'REQUESTED')
                            }
                        )
                    except (SOSRequest.DoesNotExist, RescueResource.DoesNotExist):
                        continue

            self.stdout.write(self.style.SUCCESS("Loaded request resources"))

        # --- load map points ---
        map_points_file = os.path.join(folder, 'map_points.json')
        if os.path.exists(map_points_file):
            with open(map_points_file, 'r', encoding='utf-8') as f:
                points = json.load(f)

                model_map = {
                    'SOS': 'submissions.SOSRequest',
                    'TEAM': 'submissions.RescueTeam',
                    'RESOURCE': 'submissions.RescueResource',
                    'USER': 'core.User',
                }

                for item in points:
                    geom = Point(
                        float(item['longitude']),
                        float(item['latitude']),
                        srid=4326
                    )

                    object_type = item.get('object_type')
                    model_label = model_map.get(object_type)
                    if not model_label:
                        raise ValueError(f"Unsupported object_type: {object_type}")

                    model = apps.get_model(model_label)
                    content_type = ContentType.objects.get_for_model(model)

                    MapPoint.objects.create(
                        title=item.get('title'),
                        description=item.get('description'),
                        content_type=content_type,
                        object_id=str(item.get('object_id')),
                        geom=geom,
                        properties=item.get('properties', {}),
                        source='mock',
                        is_public=item.get('is_public', True),
                    )
            self.stdout.write(self.style.SUCCESS("Loaded map points"))


