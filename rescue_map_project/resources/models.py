from django.db import models

class RescueResource(models.Model):
    # Ánh xạ bảng 'rescue_resource' trong SQL
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=50,
        choices=[('Hospital', 'Hospital'), ('Shelter', 'Shelter'), ('Supply', 'Supply'), ('Vehicle', 'Vehicle')]
    )
    capacity_total = models.IntegerField(default=0)
    capacity_available = models.IntegerField(default=0)
    status = models.CharField(
        max_length=50,
        choices=[('Available', 'Available'), ('Not Available', 'Not Available')],
        default='Available'
    )

    # Quan hệ FK
    admin_unit = models.ForeignKey('locations.AdminUnit', on_delete=models.CASCADE)
    location = models.ForeignKey('locations.Point', on_delete=models.CASCADE)

    class Meta:
            db_table = 'rescue_resource'

    def __str__(self):
        return f"{self.name} ({self.type})"