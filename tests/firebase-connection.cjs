// Read-only probes: no sign-up, document write, cloud configuration or deployment.
const { readFileSync } = require('node:fs');
const { writeFileSync } = require('node:fs');
async function main() {
  const settings = JSON.parse(readFileSync('firebase/firebase-config.json', 'utf8'));
  if (!settings.enabled) throw new Error('Firebase disabled');
  const config = settings.config;
  const checks = [
    ['sdk-app', 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js'],
    ['sdk-auth', 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js'],
    ['sdk-firestore', 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js'],
    ['auth-public-config', 'https://identitytoolkit.googleapis.com/v1/projects?key=' + encodeURIComponent(config.apiKey)],
    ['firestore-unauthenticated-read', 'https://firestore.googleapis.com/v1/projects/' +
      encodeURIComponent(config.projectId) + '/databases/(default)/documents/guestbook/connection-probe-read-only?key=' + encodeURIComponent(config.apiKey)]
  ];
  const results = await Promise.all(checks.map(async ([name, url]) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const body = await response.text();
      let data;
      try { data = JSON.parse(body); } catch {}
      const result = { name, httpStatus: response.status };
      if (data?.error) result.error = { status: data.error.status, message: data.error.message };
      if (name === 'auth-public-config' && response.ok) {
        result.projectId = data.projectId;
        result.authorizedDomains = data.authorizedDomains;
      }
      return result;
    } catch (error) {
      return { name, networkError: error.cause?.code || error.message };
    }
  }));
  const report = { testedAt: new Date().toISOString(), projectId: config.projectId,
    guestbookSync: settings.guestbookSync, mode: 'read-only', results };
  writeFileSync('firebase/reports/firebase-connection-result.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (results.some(result => result.networkError)) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
