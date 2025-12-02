from django.contrib import admin
from .models import Point, Region, AdminUnit

admin.site.register(Point)
admin.site.register(Region)
admin.site.register(AdminUnit)