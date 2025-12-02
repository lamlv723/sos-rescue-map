-- ==========================================
-- 1. CÁC BẢNG CƠ SỞ
-- ==========================================

CREATE TABLE point (
    point_id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

CREATE TABLE region (
    region_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

-- Placeholder for line table
CREATE TABLE line (
    line_id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT
);

-- ==========================================
-- 2. CÁC BẢNG CHÍNH
-- ==========================================

CREATE TABLE admin_unit (
    unit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    region_id INTEGER,
    FOREIGN KEY (region_id) REFERENCES region(region_id)
);

CREATE TABLE rescue_team (
    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT,
    member_count INTEGER DEFAULT 0,
    contact_phone TEXT,
    managed_by_unit_id INTEGER,
    FOREIGN KEY (managed_by_unit_id) REFERENCES admin_unit(unit_id)
);

-- !!! KHÔNG CẦN BẢNG USER Ở ĐÂY (DJANGO ĐÃ TẠO 'core_user') !!!

-- ==========================================
-- 3. CÁC BẢNG NGHIỆP VỤ
-- ==========================================

CREATE TABLE rescue_resource (
    resource_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    admin_unit_id INTEGER NOT NULL,
    location INTEGER NOT NULL,
    type TEXT,
    capacity_total INTEGER,
    capacity_available INTEGER,
    status TEXT,
    FOREIGN KEY (admin_unit_id) REFERENCES admin_unit(unit_id),
    FOREIGN KEY (location) REFERENCES point(point_id)
);

CREATE TABLE sos_request (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    location INTEGER NOT NULL,
    user_id INTEGER,
    assigned_team_id INTEGER,
    status TEXT DEFAULT 'Open',
    address TEXT,
    message TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    priority TEXT DEFAULT 'Normal',
    assistance_types TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (location) REFERENCES point(point_id),
    -- Quan trọng: Trỏ vào bảng core_user do Django tạo
    FOREIGN KEY (user_id) REFERENCES core_user(id), 
    FOREIGN KEY (assigned_team_id) REFERENCES rescue_team(team_id)
);

-- ==========================================
-- 4. BẢNG TRUNG GIAN
-- ==========================================

CREATE TABLE line_point (
    line_id INTEGER,
    point_id INTEGER,
    sequence_order INTEGER NOT NULL,
    PRIMARY KEY (line_id, point_id),
    FOREIGN KEY (line_id) REFERENCES line(line_id),
    FOREIGN KEY (point_id) REFERENCES point(point_id)
);

CREATE TABLE admin_unit_point (
    unit_id INTEGER,
    point_id INTEGER,
    sequence_order INTEGER NOT NULL,
    PRIMARY KEY (unit_id, point_id),
    FOREIGN KEY (unit_id) REFERENCES admin_unit(unit_id),
    FOREIGN KEY (point_id) REFERENCES point(point_id)
);