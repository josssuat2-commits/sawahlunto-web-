const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

// Target tetap berada di folder proyek dan bernama dist.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
    throw new Error('Lokasi output tidak valid.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const folder of ['css', 'js', 'imge', 'sound']) {
    fs.cpSync(path.join(root, folder), path.join(output, folder), {
        recursive: true
    });
}

fs.mkdirSync(path.join(output, 'html'), { recursive: true });

for (const file of [
    'index.html',
    'login_page.html',
    'surat_page.html',
    'surat_terbuka.html',
    'kotak_terbuka_page.html'
]) {
    fs.copyFileSync(
        path.join(root, 'html', file),
        path.join(output, 'html', file)
    );
}

fs.mkdirSync(path.join(output, 'firebase'), { recursive: true });

for (const file of ['firebase-client.js', 'firebase-config.json']) {
    fs.copyFileSync(
        path.join(root, 'firebase', file),
        path.join(output, 'firebase', file)
    );
}

console.log('Website siap di folder dist.');