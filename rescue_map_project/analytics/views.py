# analytics/views.py
from django.shortcuts import render
from django.db.models import Count, Q, Min, Avg, F, ExpressionWrapper, DurationField, OuterRef, Subquery

# time functions
from django.db.models.functions import TruncHour, TruncDay, TruncMonth
from django.utils import timezone

# Import Django REST Framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from submissions.models import SOSRequest, RequestTeam
from .utils import get_date_ranges

def dashboard(request):
    return render(request, 'analytics/dashboard.html')

class SummaryKPIView(APIView):
    def get(self, request):
        period = request.GET.get('period', 'month')
        
        # Sử dụng hàm tiện ích có sẵn của bạn
        curr_start, curr_end, prev_start, prev_end = get_date_ranges(period)

        current_stats = self._fetch_stats(curr_start, curr_end)
        previous_stats = self._fetch_stats(prev_start, prev_end)

        trends = {
            "total": self._calc_trend(current_stats['total'], previous_stats['total']),
            "pending": self._calc_trend(current_stats['pending'], previous_stats['pending']),
            "processing": self._calc_trend(current_stats['assigned'], previous_stats['assigned']),
            "resolved": self._calc_trend(current_stats['resolved'], previous_stats['resolved']),
        }

        data = {
            "total_requests": current_stats['total'] or 0,
            "pending_requests": current_stats['pending'] or 0,
            "processing_requests": current_stats['assigned'] or 0,
            "resolved_requests": current_stats['resolved'] or 0,
            "trends": trends
        }
        return Response(data, status=status.HTTP_200_OK)

    # Helper methods (private)
    def _fetch_stats(self, start, end):
        qs = SOSRequest.objects.filter(created_at__gte=start, created_at__lt=end)
        return qs.aggregate(
            total=Count('request_id'),
            pending=Count('request_id', filter=Q(status='PENDING')),
            assigned=Count('request_id', filter=Q(status='ASSIGNED')),
            resolved=Count('request_id', filter=Q(status='RESOLVED'))
        )

    def _calc_trend(self, curr, prev):
        curr = curr or 0
        prev = prev or 0
        if prev == 0:
            return 100 if curr > 0 else 0
        return round(((curr - prev) / prev) * 100, 1)

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
    
# --- API DISTRIBUTION ---
class DistributionChartDataView(APIView):
    """
    API for "Trạng thái xử lý" & "Mức độ ưu tiên" chart
    """
    def get(self, request):
        period = request.GET.get('period', 'month')
        now = timezone.now()
        data_query = SOSRequest.objects.all()

        # Filter time range
        if period == 'day':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
        else: # month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)

        # --- STATUS DISTRIBUTION ---
        status_counts = data_query.values('status').annotate(count=Count('request_id'))
        status_map = {item['status']: item['count'] for item in status_counts}

        # Config for consistent ordering and colors
        status_config = [
            {'key': 'PENDING', 'label': 'Mới', 'color': '#ea292c'},
            {'key': 'ASSIGNED', 'label': 'Đang xử lý', 'color': '#ff7800'},
            {'key': 'RESOLVED', 'label': 'Hoàn thành', 'color': '#378e5b'},
            {'key': 'CANCELLED', 'label': 'Đã hủy', 'color': '#292731'}
        ]

        status_data = {
            "labels": [item['label'] for item in status_config],
            "values": [status_map.get(item['key'], 0) for item in status_config],
            "colors": [item['color'] for item in status_config]
        }

        # --- B. PRIORITY DISTRIBUTION ---
        priority_counts = data_query.values('priority').annotate(count=Count('request_id'))
        priority_map = {item['priority']: item['count'] for item in priority_counts}

        priority_config = [
            {'key': 'HIGH', 'label': 'Cao', 'color': '#fe1e25'},
            {'key': 'MEDIUM', 'label': 'Trung bình', 'color': '#fead30'},
            {'key': 'LOW', 'label': 'Thấp', 'color': '#67c75c'}
        ]

        priority_data = {
            "labels": [item['label'] for item in priority_config],
            "values": [priority_map.get(item['key'], 0) for item in priority_config],
            "colors": [item['color'] for item in priority_config]
        }

        return Response({
            "status": status_data,
            "priority": priority_data
        }, status=status.HTTP_200_OK)

class DispatchTimeChartDataView(APIView):
    """
    API For Average Dispatch Time
    Formula: RequestTeam.assigned_at - SOSRequest.created_at
    """
    def get(self, request):
        period = request.GET.get('period', 'month')
        now = timezone.now()
        
        # Filter time range
        data_query = SOSRequest.objects.all()
        if period == 'day':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
            trunc_func = TruncHour('created_at')
            format_str = '%H:00'
        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
            trunc_func = TruncMonth('created_at')
            format_str = 'Tháng %m'
        else: # month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            data_query = data_query.filter(created_at__gte=start_date)
            trunc_func = TruncDay('created_at')
            format_str = '%d/%m'

        # Calculate duration  dispatch time
        # Step 1: Get first assigned_at per request (avoid multiple assignments)
        # Step 2: Calculate wait_duration = first_assigned - created_at
        # Step 3: Group by time unit and average wait_duration
        earliest_assignment = RequestTeam.objects.filter(
            request=OuterRef('pk'),
            assigned_at__isnull=False
        ).order_by('assigned_at').values('assigned_at')[:1]

        result = (data_query
            # Gán giá trị Subquery vào field ảo 'first_assigned'
            # Lúc này 'first_assigned' được coi là giá trị thường, không phải Aggregate
            .annotate(first_assigned=Subquery(earliest_assignment))
            .filter(first_assigned__isnull=False)
            .annotate(
                wait_duration=ExpressionWrapper(
                    F('first_assigned') - F('created_at'),
                    output_field=DurationField()
                )
            )
            .annotate(time_unit=trunc_func)
            .values('time_unit')
            .annotate(avg_wait=Avg('wait_duration'))
            .order_by('time_unit')
        )

        # Format data for response
        labels = []
        values = []

        for entry in result:
            time_val = entry['time_unit']
            avg_wait = entry['avg_wait']
            
            # Format Label
            if period == 'year':
                label = f"Tháng {time_val.month}"
            else:
                label = time_val.strftime(format_str)
            
            # Convert Timedelta to Minutes (roudn to 1 decimal)
            minutes = round(avg_wait.total_seconds() / 60, 1)
            
            labels.append(label)
            values.append(minutes)

        # Calculate overall average (for main KPI display)
        overall_avg = 0
        if values:
            overall_avg = round(sum(values) / len(values), 1)

        return Response({
            "labels": labels,
            "values": values,
            "average": overall_avg,
            "unit": "phút"
        }, status=status.HTTP_200_OK)