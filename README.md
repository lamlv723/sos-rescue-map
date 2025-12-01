# SOS Rescue Map

A real-time GIS platform connecting people in need with rescue resources during emergencies. This project uses Django for the backend and ArcGIS API for frontend mapping.

## Project Structure

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

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* **Python 3.10+**
* **Git**
* **pip** (Python package installer)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/lamlv723/sos-rescue-map.git
    cd sos-rescue-map
    ```
2.  Move to project folder
    ```
    cd rescue_map_project
    ```

3.  **Create a Virtual Environment**
    It is recommended to use a virtual environment to manage dependencies.
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS / Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

4.  **Install Dependencies**
    Install the required packages from the `requirements.txt` file located in the project folder.
    ```bash
    pip install -r requirements.txt
    ```

5.  **Environment Configuration (ignore this step for now)**
    The project requires certain environment variables to run (e.g., `SECRET_KEY`, `DEBUG`).
    
    * Create a `.env` file in the `rescue_map_project/` folder (where `manage.py` is located).
    * You can use the provided `.env.example` as a template:
    
    ```bash
    cp .env.example rescue_map_project/.env
    ```
    * Open the `.env` file and update the values if necessary.

    *Note: If you haven't set up `python-dotenv` or `django-environ` in your settings.py yet, make sure to set these variables in your system environment or update `settings.py` manually for local development.*

6.  **Apply Database Migrations (ignore this step for now)**
    Navigate to the inner project directory where `manage.py` is located and run migrations to set up the database.
    ```bash
    cd rescue_map_project
    python manage.py migrate
    ```

7.  **Create a Superuser (Optional)**
    To access the Django admin panel:
    ```bash
    python manage.py createsuperuser
    ```

### Running the Application

1.  **Start the Development Server**
    ```bash
    python manage.py runserver
    ```

2.  **Access the App**
    Open your web browser and navigate to:
    * **Main Site:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
    * **Admin Panel:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)