# analytics/utils.py
from django.utils import timezone
from datetime import timedelta

def get_date_ranges(period):
    """
    Return a tuple of (current_start, current_end, previous_start, previous_end) based on the given period.
    period: 'day', 'month', 'year'
    """
    now = timezone.now()
    current_end = now

    # Define time ranges for current and previous periods
    if period == 'day':
        # Today vs Yesterday
        current_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        previous_start = current_start - timedelta(days=1)
        previous_end = current_start # Kết thúc hôm qua là đầu ngày hôm nay
        
    elif period == 'year':
        # CY vs PY
        current_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        previous_start = current_start.replace(year=current_start.year - 1)
        previous_end = current_start
        
    else: # Default is 'month'
        # CY Month vs PY Month
        current_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        previous_end = current_start
        previous_start = (previous_end - timedelta(days=1)).replace(day=1)

    return current_start, current_end, previous_start, previous_end