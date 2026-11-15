BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION finova_set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END $fn$;
COMMIT;
