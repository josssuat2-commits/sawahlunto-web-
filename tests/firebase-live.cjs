// Creates ONE anonymous account and one clearly labelled test profile.
// Explicit user approval required. Tokens stay in memory and are never logged.
const { readFileSync } = require('node:fs');
const { existsSync, writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const report = { testedAt: new Date().toISOString(), transport: 'Firebase REST with end-user ID token', checks: [] };
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  return { status: response.status, data };
}
async function main() {
  if (existsSync('firebase/reports/firebase-live-result.json')) throw new Error('Live test already attempted; review report before creating another account.');
  const { config } = JSON.parse(readFileSync('firebase/firebase-config.json', 'utf8'));
  const auth = await request('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + encodeURIComponent(config.apiKey), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
  });
  if (auth.status !== 200) throw new Error('Anonymous login failed: ' + (auth.data.error?.message || auth.status));
  report.uid = auth.data.localId;
  report.checks.push({ name: 'anonymous-login', passed: true });
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + auth.data.idToken };
  const prefix = 'projects/' + config.projectId + '/databases/(default)/documents';
  const base = 'https://firestore.googleapis.com/v1/' + prefix;
  const name = prefix + '/guestbook/' + report.uid;
  const fields = { nama: { stringValue: 'Uji Koneksi Firebase' }, institusi: { stringValue: 'Pengujian teknis website Sawah Lunto' } };
  async function commit(extra = {}) {
    return request(base + ':commit', { method: 'POST', headers, body: JSON.stringify({ writes: [{
      update: { name, fields: { ...fields, ...extra } },
      updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }]
    }] }) });
  }
  const created = await commit();
  assert.equal(created.status, 200, 'create: ' + (created.data.error?.message || created.status));
  report.documentPath = 'guestbook/' + report.uid;
  report.checks.push({ name: 'create-own-profile-server-timestamp', passed: true });
  const read = await request(base + '/guestbook/' + report.uid, { headers });
  assert.equal(read.status, 200);
  assert.equal(read.data.fields.nama.stringValue, 'Uji Koneksi Firebase');
  assert.ok(read.data.fields.updatedAt.timestampValue);
  report.checks.push({ name: 'read-own-profile', passed: true });
  assert.equal((await commit()).status, 200);
  report.checks.push({ name: 'update-own-valid-profile', passed: true });
  assert.equal((await commit({ role: { stringValue: 'admin' } })).status, 403);
  report.checks.push({ name: 'extra-role-update-denied', passed: true });
  assert.equal((await request(base + '/guestbook/' + report.uid)).status, 403);
  report.checks.push({ name: 'unauthenticated-read-denied', passed: true });
  assert.equal((await request(base + '/guestbook/connection-probe-other-owner', { headers })).status, 403);
  report.checks.push({ name: 'other-owner-read-denied', passed: true });
  assert.equal((await request(base + '/guestbook', { headers })).status, 403);
  report.checks.push({ name: 'guestbook-list-denied', passed: true });
  report.success = true;
}
main().catch(error => { report.success = false; report.error = error.message; process.exitCode = 1; })
  .finally(() => {
    writeFileSync('firebase/reports/firebase-live-result.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  });
