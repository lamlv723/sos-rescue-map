PRAGMA foreign_keys = ON;

-- ========================================================
-- 1. LEVEL 0: POINT (Cần thiết nhất để vẽ bản đồ)
-- ========================================================

-- Tọa độ khu vực TP.HCM
INSERT INTO point (point_id, latitude, longitude) VALUES 
(1, 10.776900, 106.700900), -- Điểm SOS 1 (Q1)
(2, 10.793200, 106.687500), -- Điểm SOS 2 (Q3)
(3, 10.762600, 106.660100), -- Điểm SOS 3 (Q5)
(4, 10.786000, 106.662200), -- Bệnh viện Thống Nhất
(5, 10.756900, 106.663400); -- Bệnh viện Chợ Rẫy

-- ========================================================
-- 2. LEVEL 1: ADMIN_UNIT & REGION (Cần thiết cho cấu trúc)
-- ========================================================

INSERT INTO region (region_id, name, description) VALUES 
(1, 'Thành phố Hồ Chí Minh', 'Đô thị đặc biệt');

INSERT INTO admin_unit (unit_id, name, description, type, region_id) VALUES 
(1, 'Quận 1', 'Trung tâm', 'District', 1);

-- ========================================================
-- 3. LEVEL 2: SOS REQUEST (Trọng tâm)
-- ========================================================

-- Lưu ý: user_id và assigned_team_id đều để NULL
INSERT INTO sos_request (
    request_id, location, user_id, assigned_team_id, 
    status, address, message, contact_name, contact_phone, 
    priority, assistance_types, image_url, created_at
) VALUES 
(101, 1, NULL, NULL, 
 'Open', '68 Nguyễn Huệ, Q1', 
 'Nước ngập vào nhà, cần bao cát', 
 'Người dân A', '0912345678', 
 'Normal', 'Supply', NULL, '2024-10-15 18:30:00'),

(102, 2, NULL, NULL, 
 'Open', 'Công viên Lê Văn Tám', 
 'Cây đổ đè người đi đường', 
 'Người đi đường', '0988777666', 
 'Emergency', 'Medical,Rescue', '/media/sos/tree_fall.jpg', '2024-10-16 07:45:00'),

(103, 3, NULL, NULL, 
 'Resolved', 'Ngã tư Nguyễn Trãi', 
 'Va chạm xe máy', 
 'Anh Hùng', '0999888777', 
 'High', 'Medical', NULL, '2024-09-01 10:00:00');

-- ========================================================
-- 4. LEVEL 2: RESOURCES (Để hiển thị cho đẹp bản đồ)
-- ========================================================

INSERT INTO rescue_resource (resource_id, name, admin_unit_id, location, type, capacity_total, capacity_available, status) VALUES 
(1, 'Bệnh viện Thống Nhất', 1, 4, 'Hospital', 500, 120, 'Available'),
(2, 'Bệnh viện Chợ Rẫy', 1, 5, 'Hospital', 1500, 450, 'Available');