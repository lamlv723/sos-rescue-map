PRAGMA foreign_keys = ON;

INSERT INTO point (id, latitude, longitude) VALUES 
(1, 10.776900, 106.700900),
(2, 10.793200, 106.687500),
(3, 10.762600, 106.660100),
(4, 10.786000, 106.662200),
(5, 10.756900, 106.663400);

INSERT INTO region (id, name, description) VALUES 
(1, 'Thành phố Hồ Chí Minh', 'Đô thị đặc biệt');

INSERT INTO admin_unit (id, name, description, type, region_id) VALUES 
(1, 'Quận 1', 'Trung tâm', 'District', 1);

INSERT INTO sos_request (
    id, location_id, user_id, assigned_team_id, 
    status, address, message, contact_name, contact_phone, 
    priority, assistance_types, image_url, created_at
) VALUES 
(101, 1, NULL, NULL, 'Open', '68 Nguyễn Huệ, Q1', 'Nước ngập vào nhà, cần bao cát', 'Người dân A', '0912345678', 'Normal', 'Supply', NULL, '2024-10-15 18:30:00'),
(102, 2, NULL, NULL, 'Processing', 'Công viên Lê Văn Tám', 'Cây đổ đè người đi đường', 'Người đi đường', '0988777666', 'Emergency', 'Medical,Rescue', '/media/sos/tree_fall.jpg', '2024-10-16 07:45:00'),
(103, 3, NULL, NULL, 'Resolved', 'Ngã tư Nguyễn Trãi', 'Va chạm xe máy', 'Anh Hùng', '0999888777', 'High', 'Medical', NULL, '2024-09-01 10:00:00');

INSERT INTO rescue_resource (id, name, admin_unit_id, location_id, type, capacity_total, capacity_available, status) VALUES 
(1, 'Bệnh viện Thống Nhất', 1, 4, 'Hospital', 500, 120, 'Available'),
(2, 'Bệnh viện Chợ Rẫy', 1, 5, 'Hospital', 1500, 450, 'Available');