import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

admin.initializeApp();

// Secrets set via Firebase CLI / Secret Manager:
// firebase functions:secrets:set STAFF_USERNAME
// firebase functions:secrets:set STAFF_PASSWORD
const STAFF_USERNAME = defineSecret('STAFF_USERNAME');
const STAFF_PASSWORD = defineSecret('STAFF_PASSWORD');

function json(res: any, status: number, body: unknown) {
  res.status(status);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

export const staffLogin = onRequest(
  {
    region: 'us-central1',
    secrets: [STAFF_USERNAME, STAFF_PASSWORD]
  },
  async (req, res) => {
    // Minimal CORS (adjust allowed origin(s) once you know your domains)
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      json(res, 405, { ok: false });
      return;
    }

    const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown };

    const u = typeof username === 'string' ? username.trim() : '';
    const p = typeof password === 'string' ? password : '';

    // Never reveal which field is wrong.
    if (!u || !p) {
      json(res, 401, { ok: false });
      return;
    }

    const expectedUsername = STAFF_USERNAME.value();
    const expectedPassword = STAFF_PASSWORD.value();

    if (u !== expectedUsername || p !== expectedPassword) {
      json(res, 401, { ok: false });
      return;
    }

    // Username-only account: create custom token for a stable UID.
    const uid = `staff_${expectedUsername}`;
    const token = await admin.auth().createCustomToken(uid, { role: 'staff' });

    json(res, 200, { ok: true, token });
  }
);

