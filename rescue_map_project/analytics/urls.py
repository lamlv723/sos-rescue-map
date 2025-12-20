from django.urls import path
from . import views
from .views import TimelineChartDataView

app_name = 'analytics'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/summary/', views.get_summary_kpi, name='api_summary'),
    path('api/timeline/', TimelineChartDataView.as_view(), name='api-timeline'),
]