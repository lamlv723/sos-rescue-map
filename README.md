# SOS Rescue Map

Hệ thống bản đồ cứu hộ khẩn cấp thời gian thực, kết nối người cần giúp đỡ với các nguồn lực cứu trợ. Dự án sử dụng Django (Backend) và ArcGIS API (Frontend).

```text
rescue_map_project/
 ├── manage.py                # Trình quản lý dự án Django
 ├── requirements.txt         # Danh sách thư viện phụ thuộc
 ├── .env.example             # Mẫu biến môi trường (cần đổi tên thành .env)
 ├── rescue_map_project/      # Cấu hình lõi của dự án (Settings, URLs, WSGI)
 ├── sql_scripts/             # Các script SQL (Tạo bảng, Trigger, Dữ liệu mẫu)
 ├── diagrams/                # Tài liệu thiết kế hệ thống (ERD, Use Case...)
 │
 ├── core/                    # [App] Quản lý User, Authentication & Giao diện nền (Base)
 ├── gis_map/                 # [App] Hiển thị bản đồ chính & Tích hợp ArcGIS
 ├── locations/               # [App] Quản lý dữ liệu địa lý (Tọa độ, Quận/Huyện)
 ├── resources/               # [App] Quản lý nguồn lực cứu hộ (Xe, Thuốc, Nhu yếu phẩm)
 ├── submissions/             # [App] Xử lý các yêu cầu cứu hộ (SOS Request)
 ├── analytics/               # [App] Dashboard thống kê & Phân tích dữ liệu
 └── about/                   # [App] Trang giới thiệu thông tin dự án
 ```
 
## Hướng dẫn Cài đặt & Chạy (Dev)

Yêu cầu: Python 3.10+, Git.

### 1. Thiết lập môi trường

```bash
# Clone dự án
git clone https://github.com/lamlv723/sos-rescue-map.git
cd rescue_map_project

# Tạo môi trường ảo (Virtual Environment)
python -m venv venv

# Kích hoạt môi trường (Windows)
.\venv\Scripts\activate
# Kích hoạt môi trường (Mac/Linux)
source venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt
````

### 2\. Khởi tạo Database

Để đảm bảo dữ liệu và logic hoạt động đúng, hãy chạy lần lượt các lệnh sau để tạo mới database và nạp dữ liệu mẫu:

**Bước 1: Xóa DB cũ (nếu có, chi thực hiện bước này khi muốn reset lại)**

  * Xóa file `db.sqlite3`
  * Xóa các file trong thư mục `migrations` của các app (trừ `__init__.py`) nếu cần thiết.

**Bước 2: Tạo cấu trúc bảng**

```bash
python manage.py makemigrations core locations resources submissions
python manage.py migrate
```

**Bước 3: Nạp Logic & Dữ liệu mẫu (Bắt buộc)**

```bash
# Bỏ qua file 01_schema.sql
# Nạp Triggers (Tự động cập nhật trạng thái)
sqlite3 db.sqlite3 < sql_scripts/02_triggers.sql

# Nạp dữ liệu mẫu (Địa điểm, Đội cứu hộ, SOS...)
sqlite3 db.sqlite3 < sql_scripts/03_seed.sql
```

**Bước 4: Tạo tài khoản Admin**

```bash
python manage.py createsuperuser
```

### 3\. Chạy Server

```bash
python manage.py runserver
```

Truy cập:

  * **Trang chủ:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
  * **Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)