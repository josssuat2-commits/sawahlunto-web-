// Firebase is the only guestbook backend. Public Web App settings need no PHP.
(() => {
  'use strict';
  let pending;
  async function load() {
    const response = await fetch('../firebase/firebase-config.json', {
      cache: 'no-store', signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('firebase-config-unavailable');
    const settings = await response.json();
    if (!settings.enabled) return { enabled: false };
    if (!['apiKey', 'authDomain', 'projectId', 'appId'].every(key =>
      typeof settings.config?.[key] === 'string' && settings.config[key].trim())) {
      throw new Error('firebase-config-incomplete');
    }
    // Version pinned to the official modular CDN release.
    const [appSDK, authSDK, dbSDK] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js')
    ]);
    const app = appSDK.initializeApp(settings.config, 'sawah-lunto');
    return { enabled: true, settings, authSDK, dbSDK,
      auth: authSDK.getAuth(app), db: dbSDK.getFirestore(app) };
  }
  function ready() {
    if (!pending) pending = load().catch(error => { pending = null; throw error; });
    return pending;
  }
  async function userFor(client, remember) {
    const { auth, authSDK } = client;
    await authSDK.setPersistence(auth, remember
      ? authSDK.browserLocalPersistence : authSDK.browserSessionPersistence);
    await auth.authStateReady();
    return auth.currentUser || (await authSDK.signInAnonymously(auth)).user;
  }
  async function recordVisit(client, user) {
    // New optional tracking collection. Failure under older deployed rules never breaks guestbook.
    const { doc, runTransaction, serverTimestamp } = client.dbSDK;
    if (!runTransaction) return;
    try {
      await runTransaction(client.db, async transaction => {
        const reference = doc(client.db, 'visitors', user.uid), current = await transaction.get(reference);
        const old = current.data();
        transaction.set(reference, { firstSeenAt: old?.firstSeenAt || serverTimestamp(), lastSeenAt: serverTimestamp(),
          authType: user.isAnonymous ? 'anonymous' : (user.providerData?.[0]?.providerId || 'unknown') });
      });
    } catch (error) { console.warn('Statistik kunjungan belum tersedia:', error.code || error.message); }
  }
  window.sawahFirebase = Object.freeze({
    ready,
    async saveGuest({ nama, institusi, remember = false }) {
      if (![nama, institusi].every(v => typeof v === 'string' && v.trim().length > 0 && v.length <= 255)) {
        throw new Error('firebase-invalid-guest');
      }
      const client = await ready();
      if (!client.enabled || !client.settings.guestbookSync) throw new Error('firebase-disabled');
      const user = await userFor(client, remember);
      const { doc, setDoc, serverTimestamp } = client.dbSDK;
      await setDoc(doc(client.db, 'guestbook', user.uid), {
        nama: nama.trim(), institusi: institusi.trim(), updatedAt: serverTimestamp()
      });
      recordVisit(client, user);
      return { uid: user.uid };
    },
    async getGuest() {
      const client = await ready();
      if (!client.enabled) throw new Error('firebase-disabled');
      await client.auth.authStateReady();
      const user = client.auth.currentUser;
      if (!user) return null;
      const snapshot = await client.dbSDK.getDocFromServer(client.dbSDK.doc(client.db, 'guestbook', user.uid));
      if (snapshot.exists()) recordVisit(client, user);
      return snapshot.exists() ? { ...snapshot.data(), uid: user.uid } : null;
    },
    // Read-only network test. Does not create an account or write a document.
    async testConnection() {
      const client = await ready();
      if (!client.enabled) return { status: 'disabled', reason: 'Konfigurasi Firebase belum diaktifkan.' };
      await client.auth.authStateReady();
      const user = client.auth.currentUser;
      if (!user) return { status: 'auth-required', reason: 'SDK siap; perlu sesi Firebase untuk menguji baca Firestore.' };
      const snapshot = await client.dbSDK.getDocFromServer(client.dbSDK.doc(client.db, 'guestbook', user.uid));
      return { status: 'connected', documentExists: snapshot.exists() };
    },
    async signOut() {
      const client = await ready();
      if (client.enabled) await client.authSDK.signOut(client.auth);
    }
  });
})();
