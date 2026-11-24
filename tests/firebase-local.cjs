// Offline contracts: no new cloud users or documents.
const { readFileSync, readdirSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('firebase/firebase-client.js', 'utf8');
const settings = JSON.parse(readFileSync('firebase/firebase-config.json', 'utf8'));
function harness(configuration = settings, failWrite = false) {
  const calls = [];
  const auth = { currentUser: null, authStateReady: async () => {} };
  const sdk = {
    initializeApp: () => ({}), getAuth: () => auth, getFirestore: () => ({}),
    browserLocalPersistence: 'local', browserSessionPersistence: 'session',
    setPersistence: async (_, persistence) => calls.push(['persistence', persistence]),
    signInAnonymously: async () => { auth.currentUser = { uid: 'owner-uid' }; return { user: auth.currentUser }; },
    doc: (_, collection, uid) => { calls.push(['path', collection, uid]); return uid; },
    serverTimestamp: () => 'SERVER_TIMESTAMP',
    setDoc: async (uid, data) => { if (failWrite) throw new Error('permission-denied'); calls.push(['write', uid, data]); },
    getDocFromServer: async () => ({ exists: () => true, data: () => ({ nama: 'Tamu', institusi: 'Mandiri' }) }),
    signOut: async () => { auth.currentUser = null; }
  };
  const context = { window: {}, AbortSignal,
    fetch: async url => { assert.equal(url, '../firebase/firebase-config.json'); return { ok: true, json: async () => configuration }; },
    importSDK: async () => sdk };
  vm.runInNewContext(source.replaceAll('import(', 'importSDK('), context);
  return { client: context.window.sawahFirebase, auth, calls };
}
(async () => {
  const { client, calls, auth } = harness();
  assert.equal(await client.getGuest(), null);
  assert.equal((await client.saveGuest({ nama: 'Tamu', institusi: 'Mandiri' })).uid, 'owner-uid');
  const write = calls.find(call => call[0] === 'write');
  assert.equal(write[1], 'owner-uid');
  assert.equal(write[2].updatedAt, 'SERVER_TIMESTAMP');
  assert.deepEqual(Object.keys(write[2]).sort(), ['institusi', 'nama', 'updatedAt']);
  assert.equal(calls.find(call => call[0] === 'persistence')[1], 'session');
  assert.equal((await client.getGuest()).uid, 'owner-uid');
  await client.saveGuest({ nama: 'Tamu', institusi: 'Mandiri', remember: true });
  assert.ok(calls.some(call => call[0] === 'persistence' && call[1] === 'local'));
  assert.equal((await client.testConnection()).status, 'connected');
  await client.signOut();
  assert.equal(auth.currentUser, null);
  const invalid = harness();
  await assert.rejects(invalid.client.saveGuest({ nama: ' ', institusi: 'Mandiri' }), /invalid-guest/);
  await assert.rejects(invalid.client.saveGuest({ nama: 'a'.repeat(256), institusi: 'Mandiri' }), /invalid-guest/);
  assert.equal(invalid.auth.currentUser, null);
  await assert.rejects(harness({ enabled: false }).client.saveGuest({ nama: 'Tamu', institusi: 'Mandiri' }), /disabled/);
  await assert.rejects(harness({ enabled: true, config: {} }).client.ready(), /config-incomplete/);
  await assert.rejects(harness(settings, true).client.saveGuest({ nama: 'Tamu', institusi: 'Mandiri' }), /permission-denied/);
  function checkTree(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (['prototype', '.git', 'node_modules'].includes(item.name)) continue;
      const path = dir + '/' + item.name;
      if (item.isDirectory()) checkTree(path);
      else assert.ok(!/\.(php|sql)$/i.test(path), 'unexpected backend file: ' + path);
    }
  }
  checkTree('.');
  for (const page of ['login_page.html', 'surat_page.html', 'surat_terbuka.html', 'kotak_terbuka_page.html']) {
    const html = readFileSync('html/' + page, 'utf8');
    const clientIndex = html.indexOf('firebase/firebase-client.js?v=2');
    assert.ok(clientIndex >= 0 && clientIndex < html.indexOf('js/script.js?'), page + ': Firebase must load before app');
  }
  assert.ok(!/getApiEndpoint|simpan_tamu|get_surat_data|MySQL|XAMPP/.test(readFileSync('js/script.js', 'utf8')));
  console.log('PASS: Firebase-only source; UID ownership; validation; timestamp; persistence; profile read; logout; failed writes propagate. No cloud mutations.');
})().catch(error => { console.error(error); process.exitCode = 1; });
