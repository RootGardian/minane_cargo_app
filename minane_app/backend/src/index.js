require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {
  globalSanitizer,
  securityHeaders,
  globalRateLimiter,
  sqlInjectionGuard,
  buildCorsOptions
} = require('./middleware/sanitize');

const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');
const trackingRoutes = require('./routes/tracking.routes');
const clientRoutes = require('./routes/client.routes');
const shipmentsRoutes = require('./routes/shipments.routes');
const containersRoutes = require('./routes/containers.routes');
const paymentsRoutes = require('./routes/payments.routes');
const clientsRoutes = require('./routes/clients.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

// ─── 1. Security Headers (first — before anything else) ──────────────────────
app.use(securityHeaders);

// ─── 2. Serve Static Frontend Files (High Performance, No API Overhead) ──────
const possibleDistPaths = [
  process.env.CLIENT_BUILD_PATH,
  path.join(__dirname, '../public_frontend'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../dist')
].filter(Boolean);

const frontendDist = possibleDistPaths.find(p => fs.existsSync(p));

if (frontendDist) {
  console.log(`📦 Distribution frontend détectée : ${frontendDist}`);
  app.use(express.static(frontendDist, {
    maxAge: '1d',
    etag: true
  }));
}

// ─── 3. CORS (strict whitelist avec fallback dynamique) ───────────────────────
app.use(cors(buildCorsOptions()));
app.options('*', cors(buildCorsOptions())); // Handle preflight

// ─── 4. Body parsing with strict size limit ───────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// ─── 5. Global rate limiter (API protection) ──────────────────────────────────
app.use('/api', globalRateLimiter);

// ─── 6. Input sanitization (XSS, Prototype Pollution, Null Bytes) ─────────────
app.use('/api', globalSanitizer);

// ─── 7. SQL Injection guard (extra layer) ─────────────────────────────────────
app.use('/api', sqlInjectionGuard);

// ─── 8. Logging (minimal in production — no sensitive data) ───────────────────
if (ENV === 'production') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
} else {
  app.use(morgan('dev'));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/containers', containersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/clients', clientsRoutes);

// ─── Healthcheck (public) ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Minane Cargo API',
    corridor: 'Chine (Guangzhou / Yiwu) -> Sénégal (Port de Dakar Môle 2)',
    env: ENV,
    timestamp: new Date().toISOString()
  });
});

// ─── SPA Fallback pour le frontend React ──────────────────────────────────────
if (frontendDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ─── 404 handler (don't leak route info) ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint introuvable.' });
});

// ─── Global error handler (never leak stack traces) ───────────────────────────
app.use((err, req, res, next) => {
  // Log full error server-side only
  console.error('[ERROR]', err.message);
  if (ENV === 'development') console.error(err.stack);

  // CORS error
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: 'Accès refusé (origine non autorisée).' });
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Corps de requête JSON invalide.' });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Requête trop volumineuse.' });
  }

  // Generic 500 (never leak internal details to client)
  res.status(500).json({ error: 'Une erreur interne est survenue.' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🚀 Minane Cargo Backend [${ENV.toUpperCase()}] — port ${PORT}`);
  console.log('🔐 Corridor sécurisé: Chine (Guangzhou) -> Dakar');
  console.log('=========================================');
});
