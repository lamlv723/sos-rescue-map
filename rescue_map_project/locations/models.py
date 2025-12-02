from django.db import models

class Point(models.Model):
    # Ánh xạ bảng 'point' trong SQL
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"({self.latitude}, {self.longitude})"

class Region(models.Model):
    # Ánh xạ bảng 'region' trong SQL
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class AdminUnit(models.Model):
    # Ánh xạ bảng 'admin_unit' trong SQL
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=50, choices=[('District', 'District'), ('Ward', 'Ward')], default='District')
    
    # Quan hệ FK với Region
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.type})"