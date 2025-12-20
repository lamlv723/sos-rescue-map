# README — Backend & Mock Data (Phần A: SOS Rescue Map)

Tài liệu này tóm tắt **toàn bộ phần đã triển khai** (models, mock data, management command, sinh dữ liệu GIS, API endpoints, test) và hướng dẫn chi tiết để chạy, kiểm tra, debug, và mở rộng.

---

## Mục lục

1. [Tổng quan ngắn](#tổng-quan-ngắn)
2. [Danh sách tệp chính (vị trí)](#danh-sách-tệp-chính-vị-trí)
3. [Models (tóm tắt các thực thể)](#models-tóm-tắt-các-thực-thể)
4. [Mock data (file JSON) — nội dung & thứ tự nạp](#mock-data-file-json---nội-dung--thứ-tự-nạp)
5. [Script sinh geo mock](#script-sinh-geo-mock)
6. [Lệnh CLI cơ bản (migrate, load mock, runserver, test)](#lệnh-cli-cơ-bản-migrate-load-mock-runserver-test)
7. [Kiểm tra API (httpie / curl) — ví dụ](#kiểm-tra-api-httpie--curl---ví-dụ)
8. [Các lỗi phổ biến & cách khắc phục nhanh](#các-lỗi-phổ-biến--cách-khắc-phục-nhanh)
9. [Acceptance checklist (QA)](#acceptance-checklist-qa)
10. [Gợi ý mở rộng / next steps](#gợi-ý-mở-rộng--next-steps)

---

## Tổng quan ngắn

Triển khai backend Django (Django + DRF) cho domain SOS/Dispatch và phần GIS (GeoDjango `Region`, `MapPoint`), kèm `management command` `load_mock_data.py` để nạp dữ liệu mock từ `data/mock/`. Bổ sung model `TeamMember`, `RequestTeam`, `RequestResource`. Có script `scripts/generate_geo_mock.py` để sinh `map_points.json` & `regions.json` (UUID).

Mục tiêu: có thể chạy local, nạp mock data (≥20 bản ghi cho các entities phù hợp), gọi API từ CLI, và frontend/ArcGIS có thể lấy GeoJSON.

---

## Danh sách tệp chính (vị trí)

Giả sử project gốc là `rescue_map_project/`:

```
rescue_map_project/
├─ submissions/                    # app chứa SOS, teams, resources, requests...
│  ├─ models.py                    # AdminUnit, RescueTeam, RescueResource, SOSRequest, RequestTeam, RequestResource, TeamMember
│  ├─ serializers.py
│  ├─ views.py
│  ├─ urls.py
│  └─ management/
│     └─ commands/
│        └─ load_mock_data.py      # management command nạp mock data
├─ core/
│  ├─ models.py                    # custom User (AbstractUser)
│  └─ ...
├─ maps/                           # app GIS
│  ├─ models.py                    # Region, MapPoint (GeoDjango)
│  ├─ serializers.py               # GeoFeatureModelSerializer
│  ├─ views.py
│  └─ urls.py
├─ data/
│  └─ mock/                        # tất cả file JSON mock
│     ├─ users.json
│     ├─ admin_units.json
│     ├─ teams.json
│     ├─ resources.json
│     ├─ sos.json
│     ├─ team_members.json
│     ├─ request_teams.json
│     ├─ request_resources.json
│     ├─ map_points.json           # có thể generate bằng script
│     └─ regions.json              # có thể generate bằng script
├─ scripts/
│  └─ generate_geo_mock.py
├─ requirements.txt
└─ manage.py
```

---

## Models (tóm tắt các thực thể)

**core.User** (custom, extends `AbstractUser`):
`id`, `username`, `phone_number`, `role` (USER/OPERATOR/ADMIN), `is_staff`, `is_superuser`.

**AdminUnit**
`unit_id`, `name`, `type` (TINH/HUYEN/XA), `parent_unit`, `region_id`.

**RescueTeam**
`team_id`, `name`, `status`, `contact_phone`, `admin_unit`, `location_lat`, `location_lng`.

**RescueResource**
`resource_id`, `name`, `type`, `status`, `capacity_total`, `capacity_available`, `admin_unit`, `location_lat`, `location_lng`.

**SOSRequest**
`request_id`, `user` (FK User), `status`, `priority`, `address`, `message`, `contact_name`, `contact_phone`, `assistance_types` (JSON), `latitude`, `longitude`, timestamps.

**RequestTeam**
`request` (FK `SOSRequest`), `team` (FK `RescueTeam`), `assigned_at`, `status`. `unique_together=(request, team)`.

**RequestResource**
`request` (FK `SOSRequest`), `resource` (FK `RescueResource`), `assigned_at`, `status`. `unique_together=(request, resource)`.

**TeamMember**
`member_id`, `full_name`, `team` (FK `RescueTeam`), `role_in_team`, `joined_at`.

**Region (maps.models)**
`id` UUID PK, `name`, `geom` `PolygonField(srid=4326)`, `properties` JSONField, `source`, timestamps.

**MapPoint (maps.models)**
`id` UUID PK, `title`, `description`, `content_type` + `object_id` (GenericForeignKey), `geom` `PointField(srid=4326)`, `properties` JSONField, `is_public`, `source`, timestamps.

---

## Mock data (file JSON) — nội dung & thứ tự nạp

**Nguyên tắc**:

* Mỗi file (khi hợp lý) ≥ 20 bản ghi.
* Loader dùng `update_or_create` để idempotent.
* Thứ tự nạp phải chính xác để tránh FK errors.

**Thứ tự bắt buộc trong `load_mock_data.py`:**

1. `users.json` (User)
2. `admin_units.json` (AdminUnit)
3. `regions.json` (Region) — optional, loader có thể xử lý
4. `teams.json` (RescueTeam)
5. `team_members.json` (TeamMember)
6. `resources.json` (RescueResource)
7. `sos.json` (SOSRequest)
8. `request_teams.json` (RequestTeam)
9. `request_resources.json` (RequestResource)
10. `map_points.json` (MapPoint) — nên load cuối cùng hoặc tạo tự động từ domain objects

**Đã chuẩn bị các file JSON mẫu** (users, admin_units, teams, resources, sos (50), team_members, request_teams, request_resources). `map_points.json` / `regions.json` có thể được sinh bằng script.

---

## Script sinh geo mock

`scripts/generate_geo_mock.py` — công cụ generate:

* `regions.json` (UUID `region_id`, GeoJSON polygon)
* `map_points.json` (UUID `point_id`, `object_type` in {SOS, TEAM, RESOURCE, USER}, `object_id` numeric)

**Ví dụ chạy:**

```bash
python scripts/generate_geo_mock.py --points 200 --regions 20 --out data/mock --seed 42
```

Script dùng bounding box mặc định (HCM area) nhưng support `--bbox` để thay đổi.

---

## Lệnh CLI cơ bản (migrate, load mock, runserver, test)

Khi làm việc local (virtualenv active):

```bash
# cài dependencies
pip install -r requirements.txt

# migrations
python manage.py makemigrations
python manage.py migrate

# (tùy chọn) tạo superuser
python manage.py createsuperuser

# (tùy chọn) generate geo mock
python scripts/generate_geo_mock.py --points 200 --regions 20 --out data/mock

# nạp mock data (flush để reset)
python manage.py load_mock_data --mock-folder data/mock --flush

# chạy dev server
python manage.py runserver

# chạy test
pytest -v
```

**Lưu ý Windows / PowerShell**: khi URL chứa `&` hãy bọc URL bằng dấu `"..."` hoặc dùng cú pháp `httpie` `key==value`.

---

## Kiểm tra API (httpie / curl) — ví dụ

Giả sử server chạy tại `http://127.0.0.1:8000`.

**List SOS**

```bash
http GET "http://127.0.0.1:8000/api/sos/"
# hoặc
curl -sS http://127.0.0.1:8000/api/sos/ | jq
```

**Detail SOS**

```bash
http GET "http://127.0.0.1:8000/api/sos/1/"
```

**List teams**

```bash
http GET "http://127.0.0.1:8000/api/teams/"
```

**Team members**

```bash
http GET "http://127.0.0.1:8000/api/team-members/"
```

**List resources**

```bash
http GET "http://127.0.0.1:8000/api/resources/"
```

**MapPoint GeoJSON**

```bash
http GET "http://127.0.0.1:8000/api/maps/points/"
```

**Regions filter (PowerShell safe)**

```powershell
http GET "http://127.0.0.1:8000/api/maps/regions/?name=TP%20Hồ%20Chí%20Minh&properties__level=city"
# hoặc httpie param syntax:
http GET http://127.0.0.1:8000/api/maps/regions/ name=="TP Hồ Chí Minh" properties__level==city
```

> Nếu API trả paginated results thì nội dung trả về nằm trong `results`.

---

## Các lỗi phổ biến & cách khắc phục nhanh

1. **`ConnectionError (WinError 10061)`**

   * Nguyên nhân: server không chạy. Chạy `python manage.py runserver` hoặc kiểm tra port (`netstat -ano | findstr :8000`).

2. **PowerShell `&` error**

   * Quote URL: `"http://127.0.0.1:8000/?a=1&b=2"` hoặc dùng httpie `key==value`.

3. **`FieldError: Invalid field name(s) for model Region: 'region_type'`**

   * Nguyên nhân: loader cố ghi `region_type` vào field không tồn tại. Giải pháp: map `region_type` vào `properties` JSONField.

4. **`FieldError: Cannot resolve keyword 'object_type'` khi load MapPoint**

   * MapPoint dùng `GenericForeignKey`. Loader phải map `object_type` string → `ContentType` và set `content_type` + `object_id`.

5. **GeoDjango / spatial errors**

   * Field geometry yêu cầu PostGIS (khuyến nghị). Nếu dev dùng SQLite, phải cài lib spatial hoặc chuyển DB sang Postgres+PostGIS.

6. **UUID handling**

   * MapPoint/Region PK là UUID. Loader có thể dùng `point_id` / `region_id` trong JSON to set `id` explicitly hoặc tạo record mới và dùng auto-UUID.

---

## Acceptance checklist (QA)

* [ ] `pip install -r requirements.txt` thành công.
* [ ] Database (Postgres + PostGIS) sẵn sàng nếu dùng GeoDjango.
* [ ] `python manage.py migrate` chạy không lỗi.
* [ ] `python manage.py load_mock_data --mock-folder data/mock --flush` chạy, in success cho mọi phần.
* [ ] `python manage.py runserver` chạy, endpoints truy cập được.
* [ ] `GET /api/sos/` trả ≥20 bản ghi.
* [ ] `GET /api/teams/`, `GET /api/resources/`, `GET /api/team-members/` trả ≥20.
* [ ] `GET /api/maps/points/` và `GET /api/maps/regions/` trả GeoJSON / FeatureCollection.
* [ ] Unit tests `python manage.py test` pass.
* [ ] `scripts/generate_geo_mock.py` chạy và tạo file `map_points.json` / `regions.json`.

---

## Gợi ý mở rộng (next steps)

* Thêm `code` (human-friendly) vào `Region` để hỗ trợ `/api/regions/by-code/<code>/`.
* `post_save` signals:

  * auto-create/update `MapPoint` khi `SOSRequest`, `RescueTeam`, `RescueResource` thay đổi.
  * auto-assign `Region` cho `MapPoint` sử dụng `ST_Contains` (PostGIS).
* Expose GeoJSON endpoints rõ ràng (ví dụ `/api/maps/points/?format=geojson`).
* Phân quyền: chỉ Operator được update assignments.
* CI: thêm test + `load_mock_data --mock-folder data/mock --flush` sanity check vào pipeline.
* Add OpenAPI / Swagger docs cho API.

---
