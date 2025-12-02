-- TRIGGER 1: Tự động cập nhật resolved_at khi status = 'Resolved'
CREATE TRIGGER IF NOT EXISTS update_resolved_time
AFTER UPDATE OF status ON sos_request
FOR EACH ROW
WHEN NEW.status = 'Resolved' AND OLD.status != 'Resolved'
BEGIN
    UPDATE sos_request
    SET resolved_at = DATETIME('now', 'localtime')
    WHERE request_id = NEW.request_id;
END;



-- TRIGGER 2: Khi gán đội vào SOS đang Processing → đội Busy
CREATE TRIGGER IF NOT EXISTS set_team_busy
AFTER UPDATE OF assigned_team_id ON sos_request
FOR EACH ROW
WHEN NEW.assigned_team_id IS NOT NULL AND NEW.status = 'Processing'
BEGIN
    UPDATE rescue_team
    SET status = 'Busy'
    WHERE team_id = NEW.assigned_team_id;
END;



-- TRIGGER 3: Khi SOS được Resolved → giải phóng đội (Available)
CREATE TRIGGER IF NOT EXISTS release_team
AFTER UPDATE OF status ON sos_request
FOR EACH ROW
WHEN NEW.status = 'Resolved' AND NEW.assigned_team_id IS NOT NULL
BEGIN
    UPDATE rescue_team
    SET status = 'Available'
    WHERE team_id = NEW.assigned_team_id;
END;
