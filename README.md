# sos-map

```
rescue_map_project/
├── manage.py
├── rescue_map_project/       # Project configuration (settings.py, urls.py)
├── static/                   # (Optional) Root static for build pipelines
├── media/                    # User uploaded files (SOS photos)
│
├── core/                     # [COMMON APP] - TRÁI TIM CỦA DỰ ÁN
│   ├── apps.py
│   ├── models.py             # Abstract models (if any)
│   ├── context_processors.py # Để đẩy data vào Header (vd: user info)
│   ├── static/
│   │   └── core/
│   │       ├── css/          # Move main.css here
│   │       ├── js/           # Move main.js here
│   │       └── images/       # Move shared logos here
│   └── templates/
│       └── core/
│           ├── base.html     # CHỨA HEADER & FOOTER
│           └── components/   # Partial templates (nếu cần tách nhỏ hơn)
│
├── gis_map/                  # App hiển thị bản đồ
│   ├── views.py
│   └── templates/
│       └── gis_map/
│           └── index.html    # Kế thừa từ core/base.html
│
├── emergency/                # App xử lý SOS
│   ├── models.py             # Models: SOSRequest, SOSImage...
│   ├── forms.py
│   └── templates/
│       └── emergency/
│           └── submit_sos.html
│
└── ... (các app dashboard, resources tương tự)
```