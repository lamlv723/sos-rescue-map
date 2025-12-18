from django.urls import path
from . import views

app_name = 'emergency' # Matching the namespace used in your base.html

urlpatterns = [
    path('submit/', views.submit_sos, name='submit'),

    path('sos/', views.SOSListAPIView.as_view(), name='sos-list'),
    path('sos/<int:request_id>/', views.SOSDetailAPIView.as_view(), name='sos-detail'),
    path('teams/', views.TeamListAPIView.as_view(), name='team-list'),
    path('resources/', views.ResourceListAPIView.as_view(), name='resource-list'),
    path('team-members/', views.TeamMemberListCreateAPIView.as_view(), name='team-member-list'),
    path('team-members/<int:member_id>/', views.TeamMemberRetrieveUpdateDestroyAPIView.as_view(),
         name='team-member-detail'),
]