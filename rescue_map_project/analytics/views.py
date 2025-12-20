# analytics/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count, Q

# time functions
from django.db.models.functions import TruncHour, TruncDay, TruncMonth
from django.utils import timezone

# Import Django REST Framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from submissions.models import SOSRequest
from .utils import get_date_ranges

def dashboard(request):
    return render(request, 'analytics/dashboard.html')

def get_summary_kpi(request):
    period = request.GET.get('period', 'month')
    
    # get_date_ranges
    curr_start, curr_end, prev_start, prev_end = get_date_ranges(period)

    def fetch_stats(start, end):
        # Filter SOSRequest within the given date range
        qs = SOSRequest.objects.filter(created_at__gte=start, created_at__lt=end)
        
        return qs.aggregate(
            total=Count('request_id'),
            pending=Count('request_id', filter=Q(status='PENDING')),
            assigned=Count('request_id', filter=Q(status='ASSIGNED')),
            resolved=Count('request_id', filter=Q(status='RESOLVED'))
        )

    current_stats = fetch_stats(curr_start, curr_end)
    previous_stats = fetch_stats(prev_start, prev_end)

    # Calculate trends
    def calc_trend(curr, prev):
        curr = curr or 0 # Handle None
        prev = prev or 0
        if prev == 0:
            return 100 if curr > 0 else 0
        return round(((curr - prev) / prev) * 100, 1)

    trends = {
        "total": calc_trend(current_stats['total'], previous_stats['total']),
        "pending": calc_trend(current_stats['pending'], previous_stats['pending']),
        "processing": calc_trend(current_stats['assigned'], previous_stats['assigned']),
        "resolved": calc_trend(current_stats['resolved'], previous_stats['resolved']),
    }

    # response data
    data = {
        "total_requests": current_stats['total'] or 0,
        "pending_requests": current_stats['pending'] or 0,
        "processing_requests": current_stats['assigned'] or 0,
        "resolved_requests": current_stats['resolved'] or 0,
        "trends": trends
    }
    
    return JsonResponse(data)

class TimelineChartDataView(APIView):
    """
    API View to provide timeline chart data based on selected period (day, month, year).
    Logic:
    - day   -> Get today's data -> Group by Hour
    - month -> Get this month's data -> Group by Day
    - year  -> Get this year's data -> Group by Month
    """
    def get(self, request):
        period = request.GET.get('period', 'month')
        now = timezone.now()
        data_query = SOSRequest.objects.all()

        # Identify time range and grouping function
        if period == 'day':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
            trunc_func = TruncHour('created_at')
            format_str = '%H:00' # Eg: 14:00
            label_text = "Hôm nay (theo giờ)"

        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
            trunc_func = TruncMonth('created_at')
            format_str = 'Tháng %m' # Eg: Tháng 05
            label_text = "Năm nay (theo tháng)"

        else: # Default: month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
            trunc_func = TruncDay('created_at')
            format_str = '%d/%m' # Eg: 20/10
            label_text = "Tháng này (theo ngày)"

        # Aggregate data
        result = (data_query
                  .annotate(time_unit=trunc_func)
                  .values('time_unit')
                  .annotate(count=Count('request_id'))
                  .order_by('time_unit'))

        # Format data for response
        labels = []
        values = []

        for entry in result:
            time_val = entry['time_unit']
            # label formatting
            if period == 'year':
                label = f"Tháng {time_val.month}"
            else:
                label = time_val.strftime(format_str)
            
            labels.append(label)
            values.append(entry['count'])

        return Response({
            "labels": labels,
            "values": values,
            "label_text": label_text
        }, status=status.HTTP_200_OK)