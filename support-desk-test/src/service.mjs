import { randomUUID } from 'node:crypto';
import { openStore, record, ticketView, DeskError, runTransaction } from './store.mjs';

export class DeskService {
  constructor({ databasePath = ':memory:', provider }) {
    this.db = openStore(databasePath);
    this.provider = provider;
    this.databasePath = databasePath;
  }
  close() { this.db.close(); }

  listTickets(actor) {
    return this.db.prepare('SELECT * FROM tickets WHERE tenant_id = ? ORDER BY id').all(actor.tenantId);
  }

  row(actor, id) {
    const row = this.db.prepare('SELECT * FROM tickets WHERE id = ? AND tenant_id = ?').get(id, actor.tenantId);
    if (!row) throw new DeskError(404, 'Ticket not found');
    return row;
  }

  getTicket(actor, id) { return ticketView(this.db, this.row(actor, id)); }

  receiveWebhook(event) {
    const t = this.db.prepare('SELECT * FROM tickets WHERE id = ? AND tenant_id = ?')
      .get(event.ticketId, event.tenantId);
    if (!t || !event.eventId || typeof event.body !== 'string') throw new DeskError(400, 'Invalid event');

    return runTransaction(this.db, () => {
      const ins = this.db.prepare(
        'INSERT INTO processed_events(tenant_id, event_id, ticket_id) VALUES (?, ?, ?) ON CONFLICT DO NOTHING'
      ).run(event.tenantId, event.eventId, t.id);
      if (ins.changes === 0) return { accepted: true, duplicate: true };
      this.db.prepare('INSERT INTO messages(ticket_id, event_id, body) VALUES (?, ?, ?)')
        .run(t.id, event.eventId, event.body);
      record(this.db, t.id, 'inbound', event.eventId);
      return { accepted: true };
    });
  }

  updateDraft(actor, id, body) {
    this.row(actor, id);
    if (typeof body !== 'string' || !body.trim()) throw new DeskError(400, 'A reply is required');
    this.db.prepare(
      "UPDATE tickets SET draft = ?, version = version + 1, approved_version = NULL, send_state = 'DRAFT' WHERE id = ? AND tenant_id = ?"
    ).run(body, id, actor.tenantId);
    record(this.db, id, 'draft_updated', actor.id);
    return this.getTicket(actor, id);
  }

  approveDraft(actor, id) {
    const t = this.row(actor, id);
    if (!t.draft) throw new DeskError(400, 'No draft');
    this.db.prepare('UPDATE tickets SET approved_version = version WHERE id = ? AND tenant_id = ?')
      .run(id, actor.tenantId);
    record(this.db, id, 'approved', actor.id);
    return this.getTicket(actor, id);
  }

  handoff(actor, id) {
    this.row(actor, id);
    this.db.prepare("UPDATE tickets SET owner = 'human' WHERE id = ? AND tenant_id = ?").run(id, actor.tenantId);
    record(this.db, id, 'human_handoff', actor.id);
    return this.getTicket(actor, id);
  }

  _attemptForVersion(ticketId, version) {
    return this.db.prepare('SELECT * FROM attempts WHERE ticket_id = ? AND version = ?').get(ticketId, version);
  }

  async sendReply(actor, id, { automatic = false } = {}) {
    const t = this.row(actor, id);
    if (automatic && t.owner === 'human') {
      throw new DeskError(409, 'Automation blocked after human takeover');
    }
    if (t.approved_version == null || t.approved_version !== t.version) {
      throw new DeskError(409, 'Approve the current draft version first');
    }

    let attempt = this._attemptForVersion(id, t.version);
    if (attempt) {
      if (attempt.state === 'DELIVERED') throw new DeskError(409, 'This version was already sent');
      if (attempt.state === 'UNKNOWN') throw new DeskError(409, 'Delivery uncertain; reconcile before sending again');
      if (attempt.state === 'IN_FLIGHT') throw new DeskError(409, 'Send already in progress');
    }

    const clientRef = attempt?.client_ref ?? randomUUID();
    const body = t.draft;

    runTransaction(this.db, () => {
      if (!attempt) {
        this.db.prepare(
          'INSERT INTO attempts(ticket_id, version, client_ref, body, state) VALUES (?, ?, ?, ?, ?)'
        ).run(id, t.version, clientRef, body, 'IN_FLIGHT');
      } else {
        this.db.prepare('UPDATE attempts SET state = ? WHERE ticket_id = ? AND version = ?')
          .run('IN_FLIGHT', id, t.version);
      }
      this.db.prepare("UPDATE tickets SET send_state = 'SENDING' WHERE id = ? AND tenant_id = ?")
        .run(id, actor.tenantId);
    });

    try {
      const result = await this.provider.send({ clientRef, ticketId: id, body });
      this.db.prepare(
        "UPDATE attempts SET state = 'DELIVERED', provider_id = ? WHERE ticket_id = ? AND version = ?"
      ).run(result.providerMessageId, id, t.version);
      this.db.prepare("UPDATE tickets SET send_state = 'SENT' WHERE id = ? AND tenant_id = ?")
        .run(id, actor.tenantId);
      record(this.db, id, 'sent', `${automatic ? 'automation' : actor.id}: ${result.providerMessageId}`);
      return this.getTicket(actor, id);
    } catch (error) {
      if (error.kind === 'not_accepted') {
        this.db.prepare("UPDATE attempts SET state = 'FAILED' WHERE ticket_id = ? AND version = ?")
          .run(id, t.version);
        this.db.prepare("UPDATE tickets SET send_state = 'FAILED' WHERE id = ? AND tenant_id = ?")
          .run(id, actor.tenantId);
        record(this.db, id, 'send_rejected', 'Provider did not accept');
        throw new DeskError(502, 'Provider did not accept the message');
      }
      this.db.prepare("UPDATE attempts SET state = 'UNKNOWN' WHERE ticket_id = ? AND version = ?")
        .run(id, t.version);
      this.db.prepare("UPDATE tickets SET send_state = 'UNKNOWN' WHERE id = ? AND tenant_id = ?")
        .run(id, actor.tenantId);
      record(this.db, id, 'send_unknown', clientRef);
      return this.getTicket(actor, id);
    }
  }

  async reconcile(actor, id) {
    const t = this.row(actor, id);
    const attempt = this.db.prepare(
      "SELECT * FROM attempts WHERE ticket_id = ? AND state = 'UNKNOWN' ORDER BY id DESC LIMIT 1"
    ).get(id);
    if (!attempt) throw new DeskError(400, 'No uncertain delivery to reconcile');

    const lookup = await this.provider.lookup(attempt.client_ref);
    if (lookup.state === 'delivered') {
      this.db.prepare(
        "UPDATE attempts SET state = 'DELIVERED', provider_id = ? WHERE id = ?"
      ).run(lookup.providerMessageId ?? '', attempt.id);
      this.db.prepare("UPDATE tickets SET send_state = 'SENT' WHERE id = ? AND tenant_id = ?")
        .run(id, actor.tenantId);
      record(this.db, id, 'reconciled_delivered', attempt.client_ref);
    } else {
      record(this.db, id, 'reconcile_inconclusive', attempt.client_ref);
    }
    return this.getTicket(actor, id);
  }
}
