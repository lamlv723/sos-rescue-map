from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, RescueTeam

# Đăng ký User với giao diện mặc định + field mới
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone_number', 'team')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(RescueTeam)