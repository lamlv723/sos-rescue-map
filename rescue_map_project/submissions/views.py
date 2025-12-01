from django.shortcuts import render

def submit_sos(request):
    return render(request, 'submissions/submit.html')