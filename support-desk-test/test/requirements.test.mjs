import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DeskService } from '../src/service.mjs';

const alpha = { id: 'agent-alpha', tenantId: 'alpha' };
const beta = { id: 'agent-beta', tenantId: 'beta' };

function tempDb() {
  const dir = mkdtempSync(join(tmpdir(), 'desk-test-'));
  return join(dir, 'desk.sqlite');
}

function cleanup(path) {
  try { rmSync(join(path, '..'), { recursive: true, force: true }); } catch { /* ignore */ }
}

function unknownError() {
  const e = new Error('Delivery result unavailable');
  e.kind = 'unknown';
  return e;
}

function notAcceptedError() {
  const e = new Error('Explicitly not accepted');
  e.kind = 'not_accepted';
  return e;
}

// --- Requirement 1: idempotent webhook ---
test('webhook replay same eventId creates one customer message', () => {
  const s = new DeskService({ provider: {} });
  try {
    const event = { tenantId: 'alpha', ticketId: 101, eventId: 'event-1', body: 'Please help' };
    s.receiveWebhook(event);
    s.receiveWebhook(event);
    const msgs = s.db.prepare('SELECT * FROM messages WHERE ticket_id = 101').all();
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].body, 'Please help');
  } finally { s.close(); }
});

test('concurrent webhook posts still yield one message', async () => {
  const dbPath = tempDb();
  const s = new DeskService({ databasePath: dbPath, provider: {} });
  try {
    const event = { tenantId: 'alpha', ticketId: 101, eventId: 'evt-race', body: 'Once' };
    await Promise.all([s.receiveWebhook(event), s.receiveWebhook(event)]);
    const count = s.db.prepare('SELECT COUNT(*) AS n FROM messages WHERE event_id = ?').get('evt-race').n;
    assert.equal(count, 1);
  } finally { s.close(); cleanup(dbPath); }
});

test('alpha and beta may share the same eventId independently', () => {
  const s = new DeskService({ provider: {} });
  try {
    s.receiveWebhook({ tenantId: 'alpha', ticketId: 101, eventId: 'shared-id', body: 'A' });
    s.receiveWebhook({ tenantId: 'beta', ticketId: 202, eventId: 'shared-id', body: 'B' });
    assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM messages').get().n, 2);
  } finally { s.close(); }
});

// --- Requirement 2: tenant isolation ---
test('alpha cannot read beta ticket 202', () => {
  const s = new DeskService({ provider: {} });
  try {
    assert.throws(() => s.getTicket(alpha, 202), (e) => e.status === 404);
  } finally { s.close(); }
});

test('beta cannot mutate alpha ticket 101', () => {
  const s = new DeskService({ provider: {} });
  try {
    assert.throws(() => s.updateDraft(beta, 101, 'Hack'), (e) => e.status === 404);
    assert.throws(() => s.approveDraft(beta, 101), (e) => e.status === 404);
  } finally { s.close(); }
});

// --- Requirement 3: exact approval ---
test('edit after approve blocks send until re-approve', async () => {
  const s = new DeskService({
    provider: { send: async () => ({ providerMessageId: 'x' }), lookup: async () => ({ state: 'not_found' }) }
  });
  try {
    s.updateDraft(alpha, 101, 'First');
    s.approveDraft(alpha, 101);
    s.updateDraft(alpha, 101, 'Changed after approve');
    await assert.rejects(() => s.sendReply(alpha, 101), (e) => e.status === 409);
    s.approveDraft(alpha, 101);
    await s.sendReply(alpha, 101);
  } finally { s.close(); }
});

test('double send of same approved version calls provider once', async () => {
  const calls = [];
  const s = new DeskService({
    provider: {
      send: async (m) => { calls.push(m); return { providerMessageId: 'p1' }; },
      lookup: async () => ({ state: 'not_found' })
    }
  });
  try {
    s.updateDraft(alpha, 101, 'Once only');
    s.approveDraft(alpha, 101);
    await s.sendReply(alpha, 101);
    await assert.rejects(() => s.sendReply(alpha, 101), (e) => e.status === 409);
    assert.equal(calls.length, 1);
  } finally { s.close(); }
});

// --- Requirement 4: honest delivery ---
test('provider unknown keeps one clientRef and UNKNOWN state', async () => {
  const sent = [];
  const s = new DeskService({
    provider: {
      send: async (m) => { sent.push(m); throw unknownError(); },
      lookup: async () => ({ state: 'not_found' })
    }
  });
  try {
    s.updateDraft(alpha, 101, 'Body');
    s.approveDraft(alpha, 101);
    const t = await s.sendReply(alpha, 101);
    assert.equal(t.send_state, 'UNKNOWN');
    assert.equal(sent.length, 1);
    assert.equal(t.attempts.length, 1);
    assert.ok(t.attempts[0].client_ref);
    assert.equal(t.attempts.filter(a => a.version === t.version).length, 1);
  } finally { s.close(); }
});

test('after unknown, restart cannot trigger a second provider send for that version', async () => {
  const dbPath = tempDb();
  let sendCount = 0;
  const provider = {
    send: async () => { sendCount++; throw unknownError(); },
    lookup: async () => ({ state: 'not_found' })
  };
  const s1 = new DeskService({ databasePath: dbPath, provider });
  try {
    s1.updateDraft(alpha, 101, 'Persist');
    s1.approveDraft(alpha, 101);
    await s1.sendReply(alpha, 101);
    assert.equal(sendCount, 1);
  } finally { s1.close(); }
  const s2 = new DeskService({ databasePath: dbPath, provider });
  try {
    await assert.rejects(() => s2.sendReply(alpha, 101), /reconcile/i);
    assert.equal(sendCount, 1);
  } finally { s2.close(); cleanup(dbPath); }
});

test('reconcile marks delivered when provider has evidence', async () => {
  const clientRefs = [];
  const s = new DeskService({
    provider: {
      send: async (m) => { clientRefs.push(m.clientRef); throw unknownError(); },
      lookup: async (ref) => ({ state: 'delivered', providerMessageId: 'prov-99', count: 1 })
    }
  });
  try {
    s.updateDraft(alpha, 101, 'Maybe sent');
    s.approveDraft(alpha, 101);
    await s.sendReply(alpha, 101);
    const t = await s.reconcile(alpha, 101);
    assert.equal(t.send_state, 'SENT');
    assert.equal(t.attempts[0].state, 'DELIVERED');
  } finally { s.close(); }
});

test('reconcile with not_found does not auto-resend', async () => {
  let sends = 0;
  const s = new DeskService({
    provider: {
      send: async () => { sends++; throw unknownError(); },
      lookup: async () => ({ state: 'not_found' })
    }
  });
  try {
    s.updateDraft(alpha, 101, 'Uncertain');
    s.approveDraft(alpha, 101);
    await s.sendReply(alpha, 101);
    const t = await s.reconcile(alpha, 101);
    assert.equal(t.send_state, 'UNKNOWN');
    assert.equal(sends, 1);
  } finally { s.close(); }
});

test('explicit 503 rejection marks FAILED without duplicate blind retries', async () => {
  let sends = 0;
  const s = new DeskService({
    provider: {
      send: async () => { sends++; throw notAcceptedError(); },
      lookup: async () => ({ state: 'not_found' })
    }
  });
  try {
    s.updateDraft(alpha, 101, 'Rejected');
    s.approveDraft(alpha, 101);
    await assert.rejects(() => s.sendReply(alpha, 101), (e) => e.status === 502);
    assert.equal(sends, 1);
    const t = s.getTicket(alpha, 101);
    assert.equal(t.send_state, 'FAILED');
  } finally { s.close(); }
});

// --- Requirement 5: human takeover ---
test('automation refused after handoff; manual send still works', async () => {
  const modes = [];
  const s = new DeskService({
    provider: {
      send: async (m) => { modes.push(m.body); return { providerMessageId: 'ok' }; },
      lookup: async () => ({ state: 'not_found' })
    }
  });
  try {
    s.handoff(alpha, 101);
    await assert.rejects(() => s.sendReply(alpha, 101, { automatic: true }), /takeover/i);
    s.updateDraft(alpha, 101, 'Human reply');
    s.approveDraft(alpha, 101);
    await s.sendReply(alpha, 101);
    assert.equal(modes.length, 1);
  } finally { s.close(); }
});

// --- Requirement 6 / XSS: customer text stored literally ---
test('inbound HTML-like text is stored without mutation', () => {
  const s = new DeskService({ provider: {} });
  try {
    const payload = '<script>alert(1)</script>';
    s.receiveWebhook({ tenantId: 'alpha', ticketId: 101, eventId: 'xss-1', body: payload });
    const t = s.getTicket(alpha, 101);
    assert.equal(t.messages.at(-1).body, payload);
  } finally { s.close(); }
});
