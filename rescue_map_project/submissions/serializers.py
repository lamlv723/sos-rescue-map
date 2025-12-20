# submissions/serializers.py
from rest_framework import serializers
from .models import SOSRequest, RescueTeam, RescueResource, TeamMember

class SOSRequestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSRequest
        fields = ('request_id','latitude','longitude','status','priority','created_at','address','contact_name','contact_phone')

class SOSRequestDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSRequest
        fields = '__all__'

class RescueTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescueTeam
        fields = '__all__'

class RescueResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescueResource
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    team_id = serializers.IntegerField(source='team.team_id', read_only=True)

    class Meta:
        model = TeamMember
        fields = ('member_id', 'full_name', 'team', 'team_id', 'role_in_team', 'joined_at')
        read_only_fields = ('member_id', 'team_id')