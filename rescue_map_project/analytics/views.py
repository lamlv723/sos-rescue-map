# analytics/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count, Q
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