const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const NETLIFY_TOKEN = 'nfp_Ln5E1exb1B63WQyrW7BkS8DMLAt1LZgxf889';
const SITE_ID = 'c0799f06-45f8-443c-9007-eb04132c7a12';
const DIST_DIR = path.join(__dirname, 'frontend', 'dist');

function sha1(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(data).digest('hex');
}

function getFiles(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results.push(...getFiles(full, base));
    } else {
      const rel = '/' + path.relative(base, full).replace(/\\/g, '/');
      results.push({ rel, full });
    }
  }
  return results;
}

function apiRequest(method, endpoint, data, isBuffer = false) {
  return new Promise((resolve, reject) => {
    const body = isBuffer ? data : (data ? JSON.stringify(data) : null);
    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': isBuffer ? 'application/octet-stream' : 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function deploy() {
  console.log('Scanning dist files...');
  const files = getFiles(DIST_DIR);
  const fileHashes = {};
  for (const { rel, full } of files) {
    fileHashes[rel] = sha1(full);
  }
  console.log(`Found ${files.length} files`);

  console.log('Creating deploy...');
  const deployRes = await apiRequest('POST', `/sites/${SITE_ID}/deploys`, { files: fileHashes });
  if (deployRes.status !== 200) {
    console.error('Deploy creation failed:', JSON.stringify(deployRes.body));
    process.exit(1);
  }

  const deployId = deployRes.body.id;
  const required = deployRes.body.required || [];
  console.log(`Deploy ID: ${deployId}, Files to upload: ${required.length}`);

  // Upload only required (new/changed) files
  for (const hash of required) {
    const fileEntry = files.find(f => fileHashes[f.rel] === hash);
    if (!fileEntry) { console.warn('Could not find file for hash:', hash); continue; }
    console.log(`Uploading: ${fileEntry.rel}`);
    const fileData = fs.readFileSync(fileEntry.full);
    const uploadRes = await apiRequest('PUT', `/deploys/${deployId}/files${fileEntry.rel}`, fileData, true);
    if (uploadRes.status !== 200) {
      console.error(`Upload failed for ${fileEntry.rel}:`, uploadRes.status, JSON.stringify(uploadRes.body));
    }
  }

  console.log('\n✅ Deploy complete!');
  console.log(`🌐 Live URL: https://table-tennis-showcase-club.netlify.app`);
  console.log(`🔗 Deploy URL: https://${deployId}--table-tennis-showcase-club.netlify.app`);
}

deploy().catch(err => { console.error('Fatal error:', err); process.exit(1); });
