from django.shortcuts import render

from rest_framework import generics, permissions
from .models import SOSRequest, RescueTeam, RescueResource, TeamMember
from .serializers import SOSRequestListSerializer, SOSRequestDetailSerializer, RescueTeamSerializer, \
    RescueResourceSerializer, TeamMemberSerializer


class SOSListAPIView(generics.ListAPIView):
    queryset = SOSRequest.objects.all().order_by('-created_at')
    serializer_class = SOSRequestListSerializer
    pagination_class = None  # tắt pagination để test trả >=20; hoặc bật page_size

class SOSDetailAPIView(generics.RetrieveAPIView):
    queryset = SOSRequest.objects.all()
    lookup_field = 'request_id'
    serializer_class = SOSRequestDetailSerializer

class TeamListAPIView(generics.ListAPIView):
    queryset = RescueTeam.objects.all()
    serializer_class = RescueTeamSerializer

class ResourceListAPIView(generics.ListAPIView):
    queryset = RescueResource.objects.all()
    serializer_class = RescueResourceSerializer

class TeamMemberListCreateAPIView(generics.ListCreateAPIView):
    queryset = TeamMember.objects.select_related('team').all().order_by('member_id')
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TeamMemberRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeamMember.objects.select_related('team').all()
    serializer_class = TeamMemberSerializer
    lookup_field = 'member_id'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

def submit_sos(request):
    return render(request, 'submissions/submit.html')