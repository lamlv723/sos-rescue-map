from django.shortcuts import render

def dashboard(request):
    mockdata = fetch ("dường dẫn tới file dashboard_mocdata.json") # thay thế ghi ghép hoàn chỉnh
    # dựa theo CRUD

    total_request = mockdata_getallrequest;

    return render(request, total_request, 'analytics/dashboard.html')