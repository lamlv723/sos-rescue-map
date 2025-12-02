PRAGMA foreign_keys = ON;

-- ========================================================
-- 1. LEVEL 0: POINT, REGION, LINE
-- ========================================================

-- POINT
INSERT INTO point (point_id, latitude, longitude) VALUES 
(1, 10.7769, 106.7009), -- Trung tâm Q1
(2, 10.7932, 106.6875), -- Trung tâm Q3
(3, 10.7626, 106.6601), -- Trung tâm Q5
(4, 10.7500, 106.6700), -- Resource A
(5, 10.7800, 106.6900), -- Resource B
(11, 10.7700, 106.7050), -- SOS 1
(12, 10.7900, 106.6950), -- SOS 2
(13, 10.7650, 106.6650), -- SOS 3
(21, 10.7710, 106.7010), -- Line point 1
(22, 10.7720, 106.7020), -- Line point 2
(23, 10.7730, 106.7030); -- Line point 3

-- REGION
INSERT INTO region (region_id, name, description) VALUES 
(1, 'Thành phố Hồ Chí Minh', 'Đô thị đặc biệt'),
(2, 'Đông Nam Bộ', 'Vùng kinh tế trọng điểm phía Nam');

-- LINE
INSERT INTO line (line_id, description) VALUES 
(1, 'Lộ trình sơ tán khẩn cấp Quận 1');

-- ========================================================
-- 2. LEVEL 1: ADMIN_UNIT + ADMIN_UNIT_POINTS
-- ========================================================

INSERT INTO admin_unit (unit_id, name, description, type, region_id) VALUES 
(1, 'Quận 1', 'Trung tâm hành chính', 'District', 1),
(2, 'Quận 3', 'Khu vực nội thành', 'District', 1),
(3, 'Quận 5', 'Khu vực Chợ Lớn', 'District', 1);

-- INSERT INTO admin_unit_point (unit_id, point_id, sequence_order) VALUES
-- (1, 21, 1),
-- (1, 22, 2),
-- (1, 23, 3);

-- ========================================================
-- 3. LEVEL 2: RESCUE_TEAM + RESCUE_RESOURCE
-- ========================================================

INSERT INTO rescue_team (team_id, name, status, member_count, contact_phone, managed_by_unit_id) VALUES 
(1, 'Đội phản ứng nhanh Q1', 'Available', 10, '0909113113', 1),
(2, 'Đội cứu hộ y tế Q3', 'Busy', 5, '0909115115', 2),
(3, 'Đội cứu hỏa Q5', 'Offline', 8, '0909114114', 3);

INSERT INTO rescue_resource (resource_id, name, admin_unit_id, location, type,
                             capacity_total, capacity_available, status)
VALUES 
(1, 'Xe cứu thương 51A-123.45', 1, 4, 'Vehicle', 1, 1, 'Available'),
(2, 'Thuyền máy cao tốc', 1, 5, 'Boat', 6, 6, 'Available'),
(3, 'Máy phát điện công nghiệp', 2, 2, 'Supply', 1, 0, 'In Use');

-- ========================================================
-- 4. LEVEL 3: USER + SOS_REQUEST + LINE_POINT
-- ========================================================

INSERT INTO user (user_id, username, role, team_id, phone_number, password_hash,
                  full_name, created_at)
VALUES 
(1, 'admin', 'Admin', NULL, '0909000000', 'pbkdf2_sha256$260000$adminhash',
     'Quản Trị Viên', '2024-01-01 08:00:00'),
(2, 'rescuer_a', 'Rescuer', 1, '0909111222', 'pbkdf2_sha256$260000$rescuerhash',
     'Nguyễn Văn Cứu', '2024-02-15 09:30:00'),
(3, 'citizen_b', 'Citizen', NULL, '0912345678', 'pbkdf2_sha256$260000$citizenhash',
     'Trần Thị Dân', '2024-05-20 14:15:00');

INSERT INTO sos_request (
    request_id, location, user_id, assigned_team_id, status, address,
    message, contact_name, contact_phone, priority, assistance_types,
    image_url, created_at, resolved_at
) VALUES 
(101, 11, 3, NULL, 'Open', '68 Nguyễn Huệ, Q1',
    'Nước ngập vào nhà, cần bao cát',
    'Trần Thị Dân', '0912345678', 'Normal', 'Supply',
    NULL, '2024-10-15 18:30:00', NULL),

(102, 12, NULL, 1, 'Processing', 'Công viên Lê Văn Tám',
    'Cây đổ đè người đi đường',
    'Người đi đường', '0988777666', 'Emergency', 'Medical,Rescue',
    '/media/sos/tree_fall.jpg', '2024-10-16 07:45:00', NULL),

(103, 13, NULL, 2, 'Resolved', 'Ngã tư Nguyễn Trãi',
    'Va chạm xe máy',
    'Anh Hùng', '0999888777', 'High', 'Medical',
    NULL, '2024-09-01 10:00:00', '2024-09-01 11:30:00');

INSERT INTO line_point (line_id, point_id, sequence_order) VALUES 
(1, 21, 1),
(1, 22, 2),
(1, 23, 3);
