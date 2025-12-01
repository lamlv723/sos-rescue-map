from django.urls import path
from . import views

app_name = 'emergency' # Matching the namespace used in your base.html

urlpatterns = [
    path('submit/', views.submit_sos, name='submit'),
]