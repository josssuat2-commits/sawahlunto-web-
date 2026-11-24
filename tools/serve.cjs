// Static local preview without PHP or dependency installation.
const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : 8000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Gunakan --port 1024 sampai 65535.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.mpeg': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/surat_page.php') { res.writeHead(302, { Location: '/html/surat_page.html' }); res.end(); return; }
    if (/^\/[a-z_]+\.html$/.test(pathname)) { res.writeHead(302, { Location: '/html' + pathname }); res.end(); return; }
    if (pathname === '/') { res.writeHead(302, { Location: '/html/login_page.html' }); res.end(); return; }
    const relative = pathname.slice(1);
    const allowed = /^(?:html\/[a-z_]+\.html|firebase\/firebase-(?:client\.js|config\.json)|(?:css|js|imge|sound)\/[^\0]+)$/.test(relative);
    const file = path.resolve(root, relative);
    if (!allowed || !file.startsWith(root + path.sep) || relative.split(/[\\/]/).some(part => part.startsWith('.'))) {
      res.writeHead(404); res.end(); return;
    }
    const type = types[path.extname(file).toLowerCase()];
    if (!type) { res.writeHead(404); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end(); }
}).on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port ' + port + ' sedang digunakan. Hentikan server lama dengan Ctrl+C lalu mulai ulang, atau gunakan --port 8001.' : error.message);
  process.exitCode = 1;
}).listen(port, '127.0.0.1', () => console.log('Website: http://localhost:' + port + ' (Ctrl+C to stop)'));
