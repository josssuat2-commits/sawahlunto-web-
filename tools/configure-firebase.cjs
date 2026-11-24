// Optional build step. Output contains only public Firebase Web App settings.
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const local = {};
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(FIREBASE_[A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match) local[match[1]] = match[2].startsWith('"') ? JSON.parse(match[2]) : match[2];
  }
}
const value = key => process.env[key] ?? local[key] ?? '';
const config = {};
for (const [field, suffix] of Object.entries({ apiKey: 'API_KEY', authDomain: 'AUTH_DOMAIN', projectId: 'PROJECT_ID', appId: 'APP_ID' })) {
  config[field] = value('FIREBASE_' + suffix).trim();
  if (!config[field]) throw new Error('Missing FIREBASE_' + suffix);
}
const bucket = value('FIREBASE_STORAGE_BUCKET').trim();
if (bucket) config.storageBucket = bucket;
writeFileSync('firebase/firebase-config.json', JSON.stringify({
  enabled: value('FIREBASE_ENABLED') === 'true', guestbookSync: value('FIREBASE_GUESTBOOK_SYNC') === 'true', config
}, null, 2) + '\n');
console.log('Public Firebase configuration generated. No cloud changes.');
