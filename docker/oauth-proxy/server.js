const http = require('http');
const https = require('https');
const url = require('url');

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const ORIGIN = process.env.ORIGIN || '';
const PORT = process.env.PORT || 3000;
const SCOPE = 'repo,user';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET are required');
  process.exit(1);
}

function randomState() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sendHTML(res, script) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html><html><body><script>${script}</script></body></html>`);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;

  // ── /auth — redirect to GitHub ──────────────────────────────
  if (path === '/auth') {
    const state = randomState();
    const ghUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&scope=${SCOPE}` +
      `&state=${state}`;
    res.writeHead(302, { Location: ghUrl });
    res.end();
    return;
  }

  // ── /callback — exchange code for token ─────────────────────
  if (path === '/callback') {
    const { code, state } = parsed.query;
    if (!code) {
      sendHTML(res, `window.opener.postMessage('authorization:github:error:missing code','*');window.close();`);
      return;
    }

    const body = JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, state });
    const options = {
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const ghReq = https.request(options, (ghRes) => {
      let data = '';
      ghRes.on('data', (chunk) => { data += chunk; });
      ghRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error || !json.access_token) {
            const msg = json.error_description || json.error || 'unknown error';
            sendHTML(res, `window.opener.postMessage('authorization:github:error:${msg}','*');window.close();`);
            return;
          }
          // Decap CMS expects this exact postMessage format
          const content = JSON.stringify({ token: json.access_token, provider: 'github' });
          const encoded = JSON.stringify(`authorization:github:success:${content}`);
          sendHTML(res, `window.opener.postMessage(${encoded},'*');window.close();`);
        } catch (e) {
          sendHTML(res, `window.opener.postMessage('authorization:github:error:parse error','*');window.close();`);
        }
      });
    });

    ghReq.on('error', (e) => {
      sendHTML(res, `window.opener.postMessage('authorization:github:error:${e.message}','*');window.close();`);
    });

    ghReq.write(body);
    ghReq.end();
    return;
  }

  // ── health check ─────────────────────────────────────────────
  if (path === '/health') {
    res.writeHead(200);
    res.end('ok');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OAuth proxy listening on :${PORT}`);
});
