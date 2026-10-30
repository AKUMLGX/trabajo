# AI use (Cursor Cloud Agent)

**Tools:** Cursor Agent with shell, file edit, and automated tests.

**Suggestion rejected:** The model first proposed `db.transaction()` on `DatabaseSync` and a retry loop on send with a new `clientRef` each attempt (same as the broken starter). I rejected both: Node’s `DatabaseSync` in this environment has no `transaction()` helper, so I used `BEGIN IMMEDIATE` / `COMMIT` in `runTransaction()`; for sends I kept one `clientRef` per draft version and persist `UNKNOWN` instead of blind retries.

**Verification:** Added `test/requirements.test.mjs` — these tests fail on the inherited code (tenant leak, double webhook insert, version mismatch send) and pass after the fixes. `npm test` → 17/17 pass.

**Approximate implementation time:** ~2 h 45 min (within the 3 h cap).
