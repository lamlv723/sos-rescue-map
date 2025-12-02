from django.db import models
from django.contrib.auth.models import AbstractUser

class RescueTeam(models.Model):
    # Ánh xạ bảng 'rescue_team' trong SQL
    name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=50, 
        choices=[('Available', 'Available'), ('Busy', 'Busy')],
        default='Available'
    )
    member_count = models.IntegerField(default=0)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # FK tới AdminUnit (App locations)
    managed_by_unit = models.ForeignKey('locations.AdminUnit', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    # Các field bạn đã có
    role = models.CharField(max_length=50, default='Citizen')
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    
    # ForeignKey để liên kết trực tiếp với RescueTeam
    team = models.ForeignKey(RescueTeam, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')

    class Meta:
        db_table = 'core_user'