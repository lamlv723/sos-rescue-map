from django.db import models
from django.conf import settings # Để lấy User model

class SOSRequest(models.Model):
    # Ánh xạ bảng 'sos_request' trong SQL
    address = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    contact_name = models.CharField(max_length=100, blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    priority = models.CharField(
        max_length=20,
        choices=[('Normal', 'Normal'), ('High', 'High'), ('Emergency', 'Emergency')],
        default='Normal'
    )
    
    status = models.CharField(
        max_length=20,
        choices=[('Open', 'Open'), ('Resolved', 'Resolved')],
        default='Open'
    )
    
    # Lưu dạng text hoặc JSON field nếu dùng PostgreSQL. Với SQLite dùng TextField tạm.
    assistance_types = models.CharField(max_length=255, blank=True, null=True) 
    image_url = models.ImageField(upload_to='sos_images/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    # Quan hệ FK
    location = models.ForeignKey('locations.Point', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_team = models.ForeignKey('core.RescueTeam', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'sos_request'

    def __str__(self):
        return f"SOS #{self.id} - {self.priority}"