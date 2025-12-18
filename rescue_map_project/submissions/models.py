# submissions/models.py
from django.db import models
from django.conf import settings

class AdminUnit(models.Model):
    UNIT_TYPE = [
        ('TINH', 'Tỉnh'),
        ('XA', 'Xã'),
        ('HUYEN', 'Huyện'),
    ]
    unit_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=UNIT_TYPE, default='TINH')
    region_id = models.IntegerField(blank=True, null=True)
    parent_unit = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')

    def __str__(self):
        return self.name

class RescueTeam(models.Model):
    STATUS = [
        ('AVAILABLE', 'Available'),
        ('BUSY', 'Busy'),
        ('INACTIVE', 'Inactive'),
    ]
    team_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS, default='AVAILABLE')
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    admin_unit = models.ForeignKey(AdminUnit, null=True, blank=True, on_delete=models.SET_NULL, related_name='teams')
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class RescueResource(models.Model):
    RESOURCE_TYPE = [
        ('VEHICLE','Vehicle'),
        ('MEDICINE','Medicine'),
        ('FOOD','Food'),
    ]
    STATUS = [
        ('AVAILABLE','Available'),
        ('IN_USE','In use'),
        ('MAINTENANCE','Maintenance'),
    ]
    resource_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=30, choices=RESOURCE_TYPE)
    status = models.CharField(max_length=30, choices=STATUS, default='AVAILABLE')
    capacity_total = models.IntegerField(default=0)
    capacity_available = models.IntegerField(default=0)
    admin_unit = models.ForeignKey(AdminUnit, null=True, blank=True, on_delete=models.SET_NULL, related_name='resources')
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class SOSRequest(models.Model):
    STATUS = [
        ('PENDING','Pending'),
        ('ASSIGNED','Assigned'),
        ('RESOLVED','Resolved'),
        ('CANCELLED','Cancelled'),
    ]
    PRIORITY = [
        ('LOW','Low'),
        ('MEDIUM','Medium'),
        ('HIGH','High'),
    ]
    request_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='sos_requests')
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    priority = models.CharField(max_length=10, choices=PRIORITY, default='MEDIUM')
    address = models.TextField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    assistance_types = models.JSONField(default=list, blank=True)  # list of strings
    image_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"SOS #{self.request_id} - {self.status}"

class RequestTeam(models.Model):
    STATUS = [
        ('ASSIGNED','Assigned'),
        ('EN_ROUTE','En route'),
        ('ON_SCENE','On scene'),
        ('COMPLETED','Completed'),
    ]
    request = models.ForeignKey(SOSRequest, on_delete=models.CASCADE, related_name='request_teams')
    team = models.ForeignKey(RescueTeam, on_delete=models.CASCADE, related_name='team_requests')
    assigned_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default='ASSIGNED')

    class Meta:
        unique_together = ('request', 'team')

class RequestResource(models.Model):
    STATUS = [
        ('REQUESTED','Requested'),
        ('DISPATCHED','Dispatched'),
        ('RETURNED','Returned'),
    ]
    request = models.ForeignKey(SOSRequest, on_delete=models.CASCADE, related_name='request_resources')
    resource = models.ForeignKey(RescueResource, on_delete=models.CASCADE, related_name='resource_requests')
    assigned_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default='REQUESTED')

    class Meta:
        unique_together = ('request', 'resource')

class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('LEADER', 'Leader'),
        ('MEDIC', 'Medic'),
        ('DRIVER', 'Driver'),
        ('SUPPORT', 'Support'),
    ]

    member_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=255)
    team = models.ForeignKey('RescueTeam', on_delete=models.CASCADE, related_name='members')
    role_in_team = models.CharField(max_length=20, choices=ROLE_CHOICES, default='SUPPORT')
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'team_member'
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'
        indexes = [
            models.Index(fields=['team']),
            models.Index(fields=['role_in_team']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_in_team_display()})"