from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # New fields added to the default User model
    role = models.CharField(max_length=50, default='Citizen')
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    team_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'core_user'