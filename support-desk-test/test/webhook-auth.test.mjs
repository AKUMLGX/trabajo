import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('POST /webhooks/ghl rejects invalid secret with 401', async () => {
  const port = 4320 + Math.floor(Math.random() * 50);
  const child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), DESK_DB: ':memory:' },
    stdio: 'ignore'
  });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server start timeout')), 5000);
    child.on('error', reject);
    setTimeout(() => { clearTimeout(t); resolve(); }, 400);
  });
  try {
    const r = await fetch(`http://127.0.0.1:${port}/webhooks/ghl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Demo-Webhook-Secret': 'wrong' },
      body: JSON.stringify({ tenantId: 'alpha', ticketId: 101, eventId: 'e', body: 'x' })
    });
    assert.equal(r.status, 401);
  } finally {
    child.kill('SIGTERM');
    await new Promise(r => child.on('exit', r));
  }
});
