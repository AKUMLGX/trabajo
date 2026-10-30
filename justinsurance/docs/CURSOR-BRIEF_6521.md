# Cursor brief — JustInsurance support-desk work sample

Paste this whole file into Cursor Agent. Goal: finish the inherited starter so it meets every acceptance criterion, with tests and deliverables. Do not rewrite as Next.js/React. Stay on the supplied Node stack unless you document an equally simple run path with the same HTTP contract.

---

## Who / why

Candidate: Carlos Hernández (Mexico). Role: Senior AI Native Full-Stack at JustInsurance LLC (recruiter Justin vom Eigen via Get on Board). Assessment is unpaid, AI allowed, max **3 hours of implementation**. Finalists get a 45-minute live walkthrough + one small change. Delivery target: Sunday 2 Nov 2026 night, America/Mexico_City.

Carlos screening answers already given (do not contradict in HANDOFF or comments):
1. Rejected an AI Rust helper that cloned large `Vec`s in a hot loop → streaming + load/heap test.
2. Led 320 Access→PostgreSQL migration; learned upsert/idempotency gaps + mass-email send-state machines. Frontend ownership is Angular; no recent Next.js ownership (be honest).
3. Available as IC, English B1, OK with live session.

Salary band for the role (context only, not for code): $4–6k USD/month.

---

## Starter location and stack

Copy the folder `support-desk-test/` into the workspace (or open it as the project root).

- **Node.js >= 24** required (`node:sqlite` / `DatabaseSync`). No npm dependencies. `package.json` engines: `>=24`.
- Plain ESM `.mjs`: `src/server.mjs`, `service.mjs`, `store.mjs`, `provider-client.mjs`, `mock-provider.mjs`, `replay-event.mjs`, `public/index.html`, `test/smoke.test.mjs`.
- App: `127.0.0.1:4300`. Mock provider: `127.0.0.1:4301`. SQLite under `data/` (persist across restarts; exclude `data/` from submission).
- Scripts: `npm run provider` | `npm start` | `npm run event` | `npm test`.

Run order:
1. Terminal A: `npm run provider`
2. Terminal B: `npm start`
3. Browser: `http://127.0.0.1:4300`
4. Terminal C: `npm run event` (twice to prove idempotency after the fix)
5. `npm test`

If setup blocks >20 minutes, stop and note it for Justin (setup time does not count). Baseline smoke tests pass today; **green smoke ≠ requirements met**.

Preserve public HTTP routes and mock-provider semantics in `CONTRACT.md`. You may extend response fields. Do not weaken/bypass the mock provider to make tests pass. Framework migration and visual polish earn no credit.

---

## Fixtures (do not replace auth)

- `Authorization: Bearer demo-alpha-token` → agent-alpha, org `alpha`, ticket `101`
- `Authorization: Bearer demo-beta-token` → agent-beta, org `beta`, ticket `202`
- Webhook: header `X-Demo-Webhook-Secret: fictional-webhook-secret`
- Webhook body example: `{ "tenantId": "alpha", "ticketId": 101, "eventId": "event-1", "body": "Please help" }`
- Event identity is **per organization**: Alpha and Beta may both have `event-1`.

Routes to preserve:
- `GET /api/tickets`
- `GET /api/tickets/:id` (include `messages`, `attempts`, `audit`)
- `POST /api/tickets/:id/draft` `{ "body": "..." }`
- `POST /api/tickets/:id/approve` `{}`
- `POST /api/tickets/:id/send` `{}`
- `POST /api/tickets/:id/handoff` `{}`
- `POST /api/tickets/:id/automation` `{}` — server sets `automatic: true`; needs approval; must respect takeover
- `POST /api/tickets/:id/reconcile` `{}`
- `POST /webhooks/ghl`

Provider:
- `POST /messages` `{clientRef, ticketId, body}` → `{providerMessageId}` on success. **clientRef is correlation, NOT provider-side dedupe.**
- HTTP **503** = definitely not accepted (`kind: 'not_accepted'`).
- HTTP **504** / connection loss = **UNKNOWN** (may have accepted).
- `GET /messages?clientRef=` → `{state:"delivered",...}` or `{state:"not_found"}` — **not_found is inconclusive**, never authorize blind retry.
- `GET /deliveries` = test ledger only.
- `POST /control` modes: `normal` | `accept_then_timeout` | `reject_before_accept` | `accept_then_delay` (accept+store then wait 10s — use to kill/restart mid-send).

`DeskService` API: `listTickets`, `getTicket`, `receiveWebhook`, `updateDraft`, `approveDraft`, `handoff`, `sendReply`, `reconcile`, `close`. Provider injectable with `send` / `lookup`. Prefer fixing via `DeskService` + schema so unit tests stay headless.

---

## Six requirements (all in scope)

### 1. Safe inbound delivery (idempotent webhook)
- Replay of same `(tenantId, eventId)` must not create a second customer message or repeat business effect.
- Must hold under **overlapping concurrent requests** and **app restarts**.
- Event write + business change in **one transaction** (succeed or fail together).
- Reject invalid webhook secret (already partially done in `server.mjs`).
- Suggested: `UNIQUE(tenant_id, event_id)` on messages (or processed_events table keyed by org+eventId), `INSERT ... ON CONFLICT DO NOTHING` inside a transaction; return 200 on duplicate.

### 2. Customer isolation (server-side tenant)
- Actor comes from Bearer token on the server (`actors` map). **Never trust `tenantId` from the browser/body for authorization.**
- Guessing another ticket id or sending another `tenantId` must not read/change ticket, messages, audit, approval, ownership, or delivery.
- Today `row()` loads by id only — **broken**. Fix every read/write: `WHERE id = ? AND tenant_id = ?`. Cross-tenant → 403 or 404 (both OK). Do not “fix” only in the UI.

### 3. Exact approval
- Saved draft needs explicit human approve before send.
- **Editing the draft invalidates approval** (version bump already exists; send must require `approved_version === version` and send the text that was approved, not a later edit).
- Repeated click / overlapping send must not send the same approved version twice.
- AI/suggested text has no special authority.
- Today `sendReply` only checks `approved_version != null` and always sends current `draft` — **broken**. Use `attempts` with `UNIQUE(ticket_id, version)` (table already exists) or equivalent send lock.

### 4. Honest delivery and recovery
- Do **not** auto-resend on uncertain delivery; do not mark SENT without evidence.
- Persist operator-visible `UNKNOWN` (or equivalent) + stable `clientRef` for reconcile.
- Restart after recording an attempt must not cause a second send.
- `reconcile`: lookup by `clientRef`; if provider says delivered → resolve without resend; if `not_found` → inconclusive (do not blind retry).
- Documented explicit rejection before accept (503) → safe failure.
- Today: blind retry loop with **new UUID each try**, marks SENT without writing `attempts`, `reconcile` is 501 — **broken**.

State guidance:
- 503 / `not_accepted` → failed / not sent (safe to allow a later explicit new attempt only if version rules allow).
- 504 / network / other → UNKNOWN; keep same `clientRef`; reconcile later.
- On send start: insert attempt row first (or in same txn as state flip) so crash mid-flight cannot double-send that version.

### 5. Human takeover
- After handoff commits (`owner = 'human'` or equivalent), **server must refuse** new automation dispatch (`automatic: true` / `/automation`).
- Human can still send a properly approved manual reply.
- No need to recall a message already dispatched before takeover.
- Today `sendReply` ignores `owner` — **broken**.

### 6. Usable handoff UI
- Show conversation, owner, draft/approval, delivery state, audit for significant actions and unresolved failures.
- Untrusted customer text as **text**, not HTML (UI already uses `textContent` — keep it that way; add a test or note if you touch rendering).
- Operator should know the next safe action (especially for UNKNOWN).

---

## Known defects in the inherited code (fix these)

File `src/service.mjs` (main work):
1. `row()` / mutations ignore `actor.tenantId` → cross-tenant access.
2. `receiveWebhook` always INSERTs; no unique org+eventId; no transaction; race on concurrent replay.
3. `updateDraft` bumps version but approval is not meaningfully invalidated at send time.
4. `sendReply`: no version match; no takeover check; retries with fresh `clientRef`; never writes `attempts`; always sets SENT.
5. `reconcile` throws 501.

File `src/store.mjs`:
- `attempts` table exists (`client_ref UNIQUE`, `UNIQUE(ticket_id, version)`) but unused — use it.
- `messages` lacks unique `(ticket_id, event_id)` or org-scoped event key — add what you need via migration/`CREATE TABLE IF NOT EXISTS` / careful `ALTER` strategy; prefer additive schema that works on fresh `data/` and `:memory:` tests.

`src/server.mjs`: webhook secret check OK; actor resolution OK; keep loopback bind.

`public/index.html`: functional fixture UI; prefer minimal changes; keep XSS-safe text rendering.

`test/smoke.test.mjs`: keep or extend; add real tests that **fail on the original defects and pass after fixes**.

---

## Tests you must add (minimum)

Use `node:test` + injectable fake provider (and/or real mock modes). At least one test per requirement:

1. Webhook replay same `eventId`+tenant → one message; concurrent double-post still one; invalid secret → 401.
2. Alpha token cannot read/mutate ticket `202` (and vice versa) via API methods / HTTP.
3. Edit after approve → send rejected until re-approve; double send same approved version → one provider call.
4. Provider 504 / thrown `unknown` → state UNKNOWN, one `clientRef` persisted; restart + send again does not duplicate that version; reconcile with delivered resolves; reconcile with `not_found` does not auto-resend.
5. After handoff, `/automation` / `sendReply(..., {automatic:true})` refused; manual approved send still works.
6. Optional: customer body with `<script>` appears as text in ticket view / is not executed (document if UI-only).

Also keep a happy-path approved send against a healthy provider.

Exact commands and results go into `HANDOFF.md`. Include at least one “fails before / passes after” story.

Manual checks to document:
- `npm run event` twice
- Provider mode `accept_then_timeout` then reconcile
- Kill app during `accept_then_delay` send, restart, confirm no double delivery in `GET http://127.0.0.1:4301/deliveries`

---

## Deliverables (submission)

1. Source zip or private repo: changes + tests; commands to start/test from clean checkout; **exclude `data/`**, secrets, `node_modules`.
2. **`HANDOFF.md` ≤ 2 pages** (use `HANDOFF-TEMPLATE.md` sections):
   - Changes and ownership (done vs proposed)
   - Verification (exact commands + results; before/after test)
   - Operator instructions for UNKNOWN (what to do / avoid / after restart)
   - Remaining risks + first checks for a real GHL pilot (monitoring, rollback, handoff) — **do not call it production-ready**
   - AI use + approximate time
3. Short **AI-use note** (can be section in HANDOFF or separate `AI-USE.md`): tools used (Cursor), one suggestion accepted or changed and how verified; if none rejected, say so. No prompt dump required.
4. Approximate time spent (≤3h implementation).

Loom is **NOT required** by the real README (older plan mentioned Loom; ignore Loom unless Carlos wants one later).

---

## Implementation strategy (fit in 3 hours)

Suggested order (stop at 3h and write honest remaining risks):
1. Tenant checks everywhere + tests (fast win, isolation).
2. Webhook idempotency + transaction + tests.
3. Approval version gating + attempts unique(ticket, version) + double-send test.
4. Send path: record attempt first, map 503 vs unknown, no blind retry with new clientRef; takeover guard.
5. Implement `reconcile` via `provider.lookup(clientRef)`.
6. UI polish only if time: surface attempt state / next action clearly.
7. Write HANDOFF + AI-use note last 20–30 min.

Prefer a smaller honest implementation over fake “production ready”.

---

## AI-use note guidance (align with Carlos’s screening)

When documenting AI use, prefer a concrete rejection similar to his style, e.g.:
- AI suggested SELECT-then-INSERT for webhook dedupe or retry-on-any-error with a new clientRef → rejected because race / double-send → used UNIQUE + transaction / persist clientRef + UNKNOWN + reconcile.
- Verify with a failing-then-passing test.

English B1: keep HANDOFF sentences short and literal.

---

## Out of scope (do not build)

Full CRM, real GHL OAuth, production auth, real LLM API, SCORM, avatar tutor, billing, analytics, cloud deploy, replacing demo Bearer tokens, visual redesign.

---

## Definition of done for Cursor

- [ ] Node 24+ runs provider + app + tests
- [ ] All 6 behaviors implemented server-side with meaningful tests
- [ ] Smoke + new tests pass; at least one before/after defect story
- [ ] `HANDOFF.md` ≤2 pages + AI-use note + time spent
- [ ] `data/` not committed; README run commands still accurate (update if needed)
- [ ] No contradiction with Carlos’s screening (Angular honesty, idempotency/send-state narrative)

When finished: zip the project (without `data/`) and give Carlos the path/commands so he can send it for human review before Justin.
