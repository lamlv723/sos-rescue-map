from django.contrib import admin
from .models import AdminUnit, RescueResource, RequestTeam, SOSRequest, TeamMember, RescueTeam

admin.site.register(AdminUnit)
admin.site.register(RescueResource)
admin.site.register(RequestTeam)
admin.site.register(SOSRequest)
admin.site.register(TeamMember)
admin.site.register(RescueTeam)