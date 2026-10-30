# Handoff — JustInsurance support desk work sample

Candidate: Carlos Hernández · Senior AI Native Full-Stack exercise

## Changes and ownership

**Done (server + tests + minimal UI):**

1. **Idempotent webhook** — `processed_events` table with `PRIMARY KEY (tenant_id, event_id)`; insert message + audit in one SQLite transaction (`runTransaction`); duplicate replay returns 200 without a second message.
2. **Tenant isolation** — All ticket reads/writes use `WHERE id = ? AND tenant_id = ?` from the Bearer-resolved actor; cross-org → 404.
3. **Exact approval** — Saving a draft clears `approved_version`; send requires `approved_version === version`; `attempts` enforces `UNIQUE(ticket_id, version)`.
4. **Honest delivery** — Attempt row written before provider call; one `clientRef` per version; 503 → `FAILED`; timeout/unknown → `UNKNOWN` (no auto-resend); `reconcile()` uses `provider.lookup`.
5. **Human takeover** — `sendReply(..., { automatic: true })` rejected when `owner === 'human'`; manual approved send still allowed.
6. **UI** — Status line hints for UNKNOWN / FAILED / needs-approve; customer text still rendered via `textContent`.

**Not done (proposed for a real pilot):** Real GHL OAuth, distributed idempotency, metrics, multi-instance locks, LLM integration.

## Verification

From `support-desk-test/` (Node ≥ 24 recommended; tests pass on Node 22 with experimental `node:sqlite`):

```sh
npm test
```

**Result (2026-10-30):** 17 tests, 17 pass, 0 fail (~0.5 s).

**Before / after story:** `double send of same approved version calls provider once` and `webhook replay same eventId creates one customer message` fail on the inherited starter (second provider call / second message) and pass after this branch.

**Manual (documented, run locally):**

```sh
# Terminal A
npm run provider
# Terminal B
npm start
# Terminal C — same eventId twice → one inbound message in UI
npm run event
npm run event
# Provider timeout + reconcile
curl -X POST http://127.0.0.1:4301/control -H 'Content-Type: application/json' -d '{"mode":"accept_then_timeout"}'
# approve + send in UI → UNKNOWN → Check delivery
curl -X POST http://127.0.0.1:4301/control -H 'Content-Type: application/json' -d '{"mode":"normal"}'
```

For `accept_then_delay`: send after approve, kill `npm start` mid-flight, restart, confirm a single row in `GET http://127.0.0.1:4301/deliveries` for that `clientRef`.

## Operator instructions (UNKNOWN)

**Meaning:** The provider may have accepted the message, but the desk did not get proof (504, network, etc.). State shows `UNKNOWN` with an `attempts` row and stable `client_ref`.

**Do:** Click **Check delivery** (`POST …/reconcile`) — if provider says `delivered`, ticket moves to `SENT` without resending.

**Avoid:** Clicking **Send** again for the same draft version (server returns 409). Do not assume `not_found` from lookup means failure — it is inconclusive; do not blind retry.

**After restart:** Attempt row remains; same version will not call the provider again until you reconcile or start a **new** draft version (edit → approve → send).

## Remaining risks and production plan

Single-process SQLite; no horizontal scale; demo Bearer tokens; webhook `tenantId` in body is trusted only for routing inbound events (not for agent API). For a GHL pilot: add real auth, structured logging on `attempts`, alerts on `UNKNOWN` age, runbook for reconcile, and staged rollback — **this repo is not production-ready**.

## AI use and time

See `AI-USE.md`. Approximate implementation time: **~2 h 45 min**.
