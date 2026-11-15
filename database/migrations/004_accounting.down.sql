BEGIN;
DROP TRIGGER IF EXISTS trg_validate_journal_posting ON journal_entries;
DROP FUNCTION IF EXISTS finova_validate_journal_posting();
DROP TABLE IF EXISTS ledger_transactions,journal_entry_lines,journal_entries,accounts CASCADE;
COMMIT;
