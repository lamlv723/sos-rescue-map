from django.apps import AppConfig

class MapsConfig(AppConfig):
    name = "gis_map"
    def ready(self):
        import gis_map.signals

