import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import os from 'os';
import { UAParser } from 'ua-parser-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'qrs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory database
let qrDatabase = [];

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      qrDatabase = JSON.parse(raw);
    } else {
      qrDatabase = [];
      saveData();
    }
  } catch (err) {
    console.error('Error cargando base de datos:', err);
    qrDatabase = [];
  }
}

function saveData() {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(qrDatabase, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error guardando base de datos:', err);
  }
}

// Initial load
loadData();

// Get local IPv4 address
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Generate short slug
function generateSlug(length = 6) {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  let slug = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    slug += chars[bytes[i] % chars.length];
  }
  return slug;
}

// Hash IP for unique visitor calculation while respecting privacy
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + '-salt-qr').digest('hex').slice(0, 16);
}

// Calculate summary stats
function calculateStats(qr) {
  const scans = qr.scans || [];
  const uniqueIps = new Set(scans.map(s => s.ipHash));
  
  // Device breakdown
  const devices = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
  const osBreakdown = {};
  const browserBreakdown = {};
  const dailyBreakdown = {};

  scans.forEach(scan => {
    // Device
    const dev = scan.deviceType || 'desktop';
    if (devices[dev] !== undefined) {
      devices[dev]++;
    } else {
      devices.other++;
    }

    // OS
    const osName = scan.os || 'Desconocido';
    osBreakdown[osName] = (osBreakdown[osName] || 0) + 1;

    // Browser
    const bName = scan.browser || 'Desconocido';
    browserBreakdown[bName] = (browserBreakdown[bName] || 0) + 1;

    // Daily scans (last 14 days)
    const dateStr = scan.timestamp ? scan.timestamp.split('T')[0] : 'Desconocido';
    dailyBreakdown[dateStr] = (dailyBreakdown[dateStr] || 0) + 1;
  });

  return {
    totalScans: scans.length,
    uniqueVisitors: uniqueIps.size,
    lastScannedAt: scans.length > 0 ? scans[scans.length - 1].timestamp : null,
    devices,
    osBreakdown,
    browserBreakdown,
    dailyBreakdown,
  };
}

// ======================== API ROUTES ========================

// System info
app.get('/api/info', (req, res) => {
  const localIp = getLocalIp();
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol;

  res.json({
    localIp,
    port: PORT,
    localBaseUrl: `http://${localIp}:${PORT}`,
    localhostBaseUrl: `http://localhost:${PORT}`,
    currentBaseUrl: `${protocol}://${host}`,
    totalQrs: qrDatabase.length,
    totalScansRecorded: qrDatabase.reduce((acc, qr) => acc + (qr.scans ? qr.scans.length : 0), 0)
  });
});

// List all QRs (summaries)
app.get('/api/qrs', (req, res) => {
  const list = qrDatabase.map(qr => {
    const stats = calculateStats(qr);
    return {
      id: qr.id,
      code: qr.code,
      title: qr.title,
      originalUrl: qr.originalUrl,
      createdAt: qr.createdAt,
      updatedAt: qr.updatedAt,
      customization: qr.customization,
      totalScans: stats.totalScans,
      uniqueVisitors: stats.uniqueVisitors,
      lastScannedAt: stats.lastScannedAt,
      recentScansCount: qr.scans ? qr.scans.length : 0
    };
  }).reverse(); // Most recent first

  res.json(list);
});

// Create new QR
app.post('/api/qrs', (req, res) => {
  let { url, title, customCode, customization } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Debes proporcionar una URL válida.' });
  }

  // Ensure url has protocol
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Handle slug
  let code = customCode ? customCode.trim().replace(/[^a-zA-Z0-9_-]/g, '') : '';
  if (code) {
    const existing = qrDatabase.find(q => q.code.toLowerCase() === code.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'El código personalizado ya está en uso. Elige otro.' });
    }
  } else {
    // Generate unique slug
    do {
      code = generateSlug(6);
    } while (qrDatabase.some(q => q.code === code));
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newQr = {
    id,
    code,
    title: title && title.trim() ? title.trim() : 'Enlace sin título',
    originalUrl: url,
    createdAt: now,
    updatedAt: now,
    customization: customization || {
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      errorLevel: 'M',
      margin: 2,
      style: 'squares', // squares | rounded | dots
      logo: null
    },
    scans: []
  };

  qrDatabase.push(newQr);
  saveData();

  const stats = calculateStats(newQr);
  res.status(201).json({
    ...newQr,
    stats
  });
});

// Get single QR with full scan logs and aggregations
app.get('/api/qrs/:id', (req, res) => {
  const qr = qrDatabase.find(q => q.id === req.params.id || q.code === req.params.id);
  if (!qr) {
    return res.status(404).json({ error: 'Código QR no encontrado.' });
  }

  const stats = calculateStats(qr);
  
  // Return last 100 scans for detail view
  const recentScans = (qr.scans || []).slice(-100).reverse();

  res.json({
    ...qr,
    stats,
    recentScans
  });
});

// Update QR destination, title or design (Dynamic QR!)
app.patch('/api/qrs/:id', (req, res) => {
  const qr = qrDatabase.find(q => q.id === req.params.id);
  if (!qr) {
    return res.status(404).json({ error: 'Código QR no encontrado.' });
  }

  const { originalUrl, title, customization } = req.body;

  if (originalUrl) {
    let cleanUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    qr.originalUrl = cleanUrl;
  }

  if (title !== undefined) {
    qr.title = title.trim() || 'Enlace sin título';
  }

  if (customization) {
    qr.customization = { ...qr.customization, ...customization };
  }

  qr.updatedAt = new Date().toISOString();
  saveData();

  const stats = calculateStats(qr);
  res.json({ ...qr, stats });
});

// Delete QR
app.delete('/api/qrs/:id', (req, res) => {
  const index = qrDatabase.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Código QR no encontrado.' });
  }

  qrDatabase.splice(index, 1);
  saveData();
  res.json({ success: true, message: 'Código QR eliminado con éxito.' });
});

// Reset scan statistics
app.post('/api/qrs/:id/reset', (req, res) => {
  const qr = qrDatabase.find(q => q.id === req.params.id);
  if (!qr) {
    return res.status(404).json({ error: 'Código QR no encontrado.' });
  }

  qr.scans = [];
  qr.updatedAt = new Date().toISOString();
  saveData();

  const stats = calculateStats(qr);
  res.json({ success: true, message: 'Estadísticas reiniciadas.', stats });
});

// Simulate scan (Great for testing on PC without opening a mobile phone!)
app.post('/api/qrs/:id/simulate-scan', (req, res) => {
  const qr = qrDatabase.find(q => q.id === req.params.id || q.code === req.params.id);
  if (!qr) {
    return res.status(404).json({ error: 'Código QR no encontrado.' });
  }

  const { devicePreset = 'iphone' } = req.body;

  const presets = {
    iphone: {
      deviceType: 'mobile',
      deviceVendor: 'Apple',
      deviceModel: 'iPhone 15 Pro',
      os: 'iOS',
      osVersion: '17.5',
      browser: 'Mobile Safari',
      browserVersion: '17.5',
    },
    android: {
      deviceType: 'mobile',
      deviceVendor: 'Samsung',
      deviceModel: 'Galaxy S24',
      os: 'Android',
      osVersion: '14.0',
      browser: 'Chrome Mobile',
      browserVersion: '125.0',
    },
    ipad: {
      deviceType: 'tablet',
      deviceVendor: 'Apple',
      deviceModel: 'iPad Air',
      os: 'iPadOS',
      osVersion: '17.4',
      browser: 'Mobile Safari',
      browserVersion: '17.4',
    },
    desktop_mac: {
      deviceType: 'desktop',
      deviceVendor: 'Apple',
      deviceModel: 'MacBook Pro',
      os: 'macOS',
      osVersion: '14.4',
      browser: 'Chrome',
      browserVersion: '125.0',
    },
    desktop_win: {
      deviceType: 'desktop',
      deviceVendor: 'PC',
      deviceModel: 'Desktop',
      os: 'Windows',
      osVersion: '11',
      browser: 'Edge',
      browserVersion: '125.0',
    }
  };

  const chosen = presets[devicePreset] || presets.iphone;
  const fakeIp = `192.168.1.${Math.floor(Math.random() * 200) + 10}`;

  const scanRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ipHash: hashIp(fakeIp),
    deviceType: chosen.deviceType,
    deviceVendor: chosen.deviceVendor,
    deviceModel: chosen.deviceModel,
    os: chosen.os,
    osVersion: chosen.osVersion,
    browser: chosen.browser,
    browserVersion: chosen.browserVersion,
    referer: 'Simulación / Prueba interactiva'
  };

  if (!qr.scans) qr.scans = [];
  qr.scans.push(scanRecord);
  saveData();

  const stats = calculateStats(qr);
  res.json({
    success: true,
    message: `Escaneo simulado exitoso (${chosen.deviceVendor} ${chosen.deviceModel})`,
    scan: scanRecord,
    stats
  });
});

// ======================== REDIRECTOR / SCAN TRACKER ========================

app.get('/r/:code', (req, res) => {
  const { code } = req.params;
  const qr = qrDatabase.find(q => q.code === code);

  if (!qr) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código QR no encontrado</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 400px; }
          h1 { color: #f43f5e; font-size: 1.5rem; }
          p { color: #94a3b8; font-size: 0.95rem; }
          a { color: #38bdf8; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚠️ QR no encontrado</h1>
          <p>Este código QR no existe o ha sido eliminado por su creador.</p>
        </div>
      </body>
      </html>
    `);
  }

  // Parse User Agent
  const rawUa = req.headers['user-agent'] || '';
  const parser = new UAParser(rawUa);
  const uaResult = parser.getResult();

  // Extract client IP
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
  const ipHash = hashIp(rawIp);

  // Determine device type
  let deviceType = uaResult.device.type || 'desktop';
  if (!uaResult.device.type) {
    if (/Mobile|Android|iP(hone|od)/i.test(rawUa)) {
      deviceType = 'mobile';
    } else if (/iPad|Tablet/i.test(rawUa)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
  }

  const scanRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ipHash,
    deviceType,
    deviceVendor: uaResult.device.vendor || (deviceType === 'desktop' ? 'PC/Mac' : 'Desconocido'),
    deviceModel: uaResult.device.model || '',
    os: uaResult.os.name || 'Desconocido',
    osVersion: uaResult.os.version || '',
    browser: uaResult.browser.name || 'Desconocido',
    browserVersion: uaResult.browser.version || '',
    referer: req.headers['referer'] || 'Escaneo Directo'
  };

  if (!qr.scans) qr.scans = [];
  qr.scans.push(scanRecord);
  saveData();

  console.log(`[QR SCAN] Código: ${code} | Dispositivo: ${deviceType} (${scanRecord.os} / ${scanRecord.browser}) -> ${qr.originalUrl}`);

  // Check if preview was requested (e.g. for testing)
  if (req.query.preview === '1') {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirigiendo... | PulseQR</title>
        <meta http-equiv="refresh" content="2;url=${qr.originalUrl}">
        <style>
          body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #334155; box-shadow: 0 20px 30px rgba(0,0,0,0.5); max-width: 440px; }
          .badge { display: inline-block; background: #10b98120; color: #10b981; border: 1px solid #10b98150; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
          h1 { margin: 0 0 0.5rem; font-size: 1.35rem; }
          p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
          .url-box { background: #0f172a; padding: 0.75rem 1rem; border-radius: 0.5rem; word-break: break-all; font-family: monospace; font-size: 0.85rem; color: #38bdf8; margin: 1.25rem 0; border: 1px solid #1e293b; }
          .spinner { width: 32px; height: 32px; border: 3px solid #334155; border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 1.25rem auto 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">✓ Escaneo Registrado</div>
          <h1>${qr.title}</h1>
          <p>Tu escaneo ha sido contabilizado en tiempo real. Redirigiendo a tu destino...</p>
          <div class="url-box">${qr.originalUrl}</div>
          <div class="spinner"></div>
          <p style="margin-top: 1rem; font-size: 0.8rem; color: #64748b;">¿No carga? <a href="${qr.originalUrl}" style="color: #38bdf8;">Haz clic aquí</a></p>
        </div>
      </body>
      </html>
    `);
  }

  // Instant 302 redirect
  return res.redirect(302, qr.originalUrl);
});

// Serve frontend static files if built
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback for Express 5
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/r/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`\n🚀 Servidor QR Tracker iniciado:`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - Network:  http://${localIp}:${PORT}`);
  console.log(`   - Data dir: ${DATA_DIR}\n`);
});
