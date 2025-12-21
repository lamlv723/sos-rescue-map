from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/summary/', views.SummaryKPIView.as_view(), name='api_summary'),
    path('api/timeline/', views.TimelineChartDataView.as_view(), name='api-timeline'),
    path('api/distribution/', views.DistributionChartDataView.as_view(), name='api-distribution'),
    path('api/resolved-time/', views.ResolvedTimeChartDataView.as_view(), name='api-resolved-time'),
]