BEGIN;
CREATE TABLE IF NOT EXISTS accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity_id uuid NOT NULL REFERENCES entities(id), parent_account_id uuid REFERENCES accounts(id), account_number varchar(30) NOT NULL, account_name varchar(255) NOT NULL, account_type varchar(20) NOT NULL CHECK(account_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')), normal_balance varchar(6) NOT NULL CHECK(normal_balance IN ('DEBIT','CREDIT')), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz, UNIQUE(entity_id,account_number));
CREATE TABLE IF NOT EXISTS journal_entries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity_id uuid NOT NULL REFERENCES entities(id), period_id uuid NOT NULL REFERENCES accounting_periods(id), journal_number varchar(60) NOT NULL, journal_date date NOT NULL, description text NOT NULL, reference_number varchar(100), status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SUBMITTED','REVIEWED','APPROVED','POSTED','LOCKED','REJECTED')), prepared_by uuid REFERENCES users(id), reviewed_by uuid REFERENCES users(id), approved_by uuid REFERENCES users(id), posted_by uuid REFERENCES users(id), submitted_at timestamptz, approved_at timestamptz, posted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(entity_id,journal_number));
CREATE TABLE IF NOT EXISTS journal_entry_lines (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE, account_id uuid NOT NULL REFERENCES accounts(id), line_number integer NOT NULL, description text, debit numeric(20,2) NOT NULL DEFAULT 0 CHECK(debit>=0), credit numeric(20,2) NOT NULL DEFAULT 0 CHECK(credit>=0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(journal_entry_id,line_number), CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0)));
CREATE TABLE IF NOT EXISTS ledger_transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity_id uuid NOT NULL REFERENCES entities(id), account_id uuid NOT NULL REFERENCES accounts(id), journal_entry_id uuid NOT NULL REFERENCES journal_entries(id), journal_line_id uuid NOT NULL UNIQUE REFERENCES journal_entry_lines(id), transaction_date date NOT NULL, debit numeric(20,2) NOT NULL DEFAULT 0, credit numeric(20,2) NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS ix_journal_entity_date ON journal_entries(entity_id,journal_date);
CREATE INDEX IF NOT EXISTS ix_journal_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS ix_ledger_account_date ON ledger_transactions(account_id,transaction_date);
CREATE OR REPLACE FUNCTION finova_validate_journal_posting() RETURNS trigger LANGUAGE plpgsql AS $fn$
DECLARE d numeric(20,2); c numeric(20,2); n integer;
BEGIN
 IF NEW.status='POSTED' AND OLD.status IS DISTINCT FROM 'POSTED' THEN
  IF OLD.status <> 'APPROVED' THEN RAISE EXCEPTION 'Journal must be approved before posting'; END IF;
  SELECT COALESCE(sum(debit),0),COALESCE(sum(credit),0),count(*) INTO d,c,n FROM journal_entry_lines WHERE journal_entry_id=NEW.id;
  IF n<2 OR d<=0 OR d<>c THEN RAISE EXCEPTION 'Journal must contain at least two lines and balanced positive debits and credits'; END IF;
  IF EXISTS (SELECT 1 FROM accounting_periods p WHERE p.id=NEW.period_id AND (p.status<>'OPEN' OR NEW.journal_date NOT BETWEEN p.start_date AND p.end_date)) THEN RAISE EXCEPTION 'Accounting period is not open or date is outside period'; END IF;
  INSERT INTO ledger_transactions(entity_id,account_id,journal_entry_id,journal_line_id,transaction_date,debit,credit)
   SELECT NEW.entity_id,l.account_id,NEW.id,l.id,NEW.journal_date,l.debit,l.credit FROM journal_entry_lines l WHERE l.journal_entry_id=NEW.id;
  NEW.posted_at=now();
 END IF;
 RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS trg_validate_journal_posting ON journal_entries;
CREATE TRIGGER trg_validate_journal_posting BEFORE UPDATE OF status ON journal_entries FOR EACH ROW EXECUTE FUNCTION finova_validate_journal_posting();
COMMIT;
