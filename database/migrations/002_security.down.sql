BEGIN;
DROP TABLE IF EXISTS audit_logs,user_sessions,role_permissions,permissions,users,roles CASCADE;
COMMIT;
