-- TRIGGER 1: request_id --> id
CREATE TRIGGER IF NOT EXISTS update_resolved_time
AFTER UPDATE OF status ON sos_request
FOR EACH ROW
WHEN NEW.status = 'Resolved' AND OLD.status != 'Resolved'
BEGIN
    UPDATE sos_request
    SET resolved_at = DATETIME('now', 'localtime')
    WHERE id = NEW.id; 
END;

-- TRIGGER 2: team_id --> id
CREATE TRIGGER IF NOT EXISTS set_team_busy
AFTER UPDATE OF assigned_team_id ON sos_request
FOR EACH ROW
WHEN NEW.assigned_team_id IS NOT NULL AND NEW.status = 'Processing'
BEGIN
    UPDATE rescue_team
    SET status = 'Busy'
    WHERE id = NEW.assigned_team_id;
END;

-- TRIGGER 3: team_id --> id
CREATE TRIGGER IF NOT EXISTS release_team
AFTER UPDATE OF status ON sos_request
FOR EACH ROW
WHEN NEW.status = 'Resolved' AND NEW.assigned_team_id IS NOT NULL
BEGIN
    UPDATE rescue_team
    SET status = 'Available'
    WHERE id = NEW.assigned_team_id;
END;