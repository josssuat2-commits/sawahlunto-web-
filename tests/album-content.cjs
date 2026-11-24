const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
let photos;
const source = fs.readFileSync('js/relic-album.js', 'utf8').replace('  const modal =', '  capture(photos);\n  const modal =');
vm.runInNewContext(source, { capture: value => { photos = value; }, document: { addEventListener: (_, fn) => fn(), getElementById: () => null } });
assert.equal(photos.length, 12);
assert.equal(photos.reduce((total, photo) => total + photo.images.length, 0), 19);
for (const photo of photos) {
  for (const image of photo.images) assert.ok(fs.existsSync(path.resolve('html', image)), image);
  assert.ok(photo.note.length > 100);
  assert.ok(!photo.note.includes('undefined'));
}
const additions = photos.slice(8);
assert.equal(additions.find(photo => photo.title === 'Danau Biru').images.length, 4);
assert.ok(additions.every(photo => photo.english.length === 3));
assert.ok(additions.find(photo => photo.title === 'Puncak Polan').note.endsWith('masyarakat sekitar.'));
console.log('PASS: 12 album sections, 19 photos, complete descriptions, Danau Biru naming and English content.');
