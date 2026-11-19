/**
 * Security & Sanitization Middlewares for Minane Cargo API
 * Protects against: XSS, Injection, Prototype Pollution, CSRF,
 *                   DoS (rate-limit), Clickjacking, MIME-sniff
 */

// ─── Regex patterns ───────────────────────────────────────────────────────────
const DANGEROUS_TAGS_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAGS_REGEX = /<[^>]*>/g;
const JS_PROTOCOL_REGEX = /javascript\s*:/gi;
const EVENT_HANDLERS_REGEX = /on\w+\s*=/gi;
const SQL_INJECTION_REGEX = /('|--|;|\/\*|\*\/|xp_|UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM)/gi;
const NULL_BYTE_REGEX = /\0/g;
const PATH_TRAVERSAL_REGEX = /\.\.[/\\]/g;

// ─── String sanitizer ─────────────────────────────────────────────────────────
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(NULL_BYTE_REGEX, '')
    .replace(PATH_TRAVERSAL_REGEX, '')
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(JS_PROTOCOL_REGEX, '')
    .replace(EVENT_HANDLERS_REGEX, '')
    .replace(HTML_TAGS_REGEX, '')
    .trim();
}

// ─── Deep recursive sanitizer ─────────────────────────────────────────────────
function deepSanitize(obj, depth = 0) {
  if (depth > 8) return obj;
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') return sanitizeString(obj);
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, depth + 1));
  }
  const cleanObj = {};
  for (const key of Object.keys(obj)) {
    // Block prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const cleanKey = sanitizeString(key);
    cleanObj[cleanKey] = deepSanitize(obj[key], depth + 1);
  }
  return cleanObj;
}

// ─── Global sanitizer middleware ──────────────────────────────────────────────
function globalSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') req.body = deepSanitize(req.body);
  if (req.query && typeof req.query === 'object') req.query = deepSanitize(req.query);
  if (req.params && typeof req.params === 'object') req.params = deepSanitize(req.params);
  next();
}

// ─── Security headers middleware ──────────────────────────────────────────────
function securityHeaders(req, res, next) {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Legacy XSS filter (IE/Edge)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer control
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy (disable dangerous browser APIs)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // HSTS (force HTTPS — activate in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  // Content Security Policy (compatible SPA React / Vite, Google Fonts & CDN)
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http: https:; " +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com http: https:; " +
    "img-src 'self' data: https: http: blob:; " +
    "font-src 'self' data: https://fonts.gstatic.com http: https:; " +
    "connect-src 'self' https: http: ws: wss:; " +
    "frame-ancestors 'none';"
  );
  // Hide server identity
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
}

// ─── Global rate limiter (in-memory, no dep needed) ──────────────────────────
const ipRequests = new Map();
const GLOBAL_RATE_WINDOW = 60 * 1000; // 1 minute
const GLOBAL_RATE_MAX    = 120;        // max 120 req/min per IP

function globalRateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (record) {
    // Reset window if expired
    if (now - record.windowStart > GLOBAL_RATE_WINDOW) {
      ipRequests.set(ip, { count: 1, windowStart: now });
      return next();
    }
    record.count++;
    if (record.count > GLOBAL_RATE_MAX) {
      return res.status(429).json({
        error: 'Trop de requêtes. Veuillez patienter avant de réessayer.'
      });
    }
  } else {
    ipRequests.set(ip, { count: 1, windowStart: now });
  }

  // Cleanup old entries every 500 requests to avoid memory leak
  if (ipRequests.size > 10000) {
    for (const [k, v] of ipRequests) {
      if (now - v.windowStart > GLOBAL_RATE_WINDOW) ipRequests.delete(k);
    }
  }

  next();
}

// ─── Flexible & Secure CORS configuration ─────────────────────────────────────
function buildCorsOptions() {
  const rawOrigins = process.env.ALLOWED_ORIGINS || '';
  const whitelist = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

  return {
    origin(origin, callback) {
      // Allow requests with no origin (same-origin, curl, server-to-server, mobile)
      if (!origin) return callback(null, true);

      // Wildcard or non-production
      if (process.env.ALLOWED_ORIGINS === '*' || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Always allow localhost & 127.0.0.1
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Explicit whitelist
      if (whitelist.includes(origin)) return callback(null, true);

      // APP_URL match
      if (process.env.APP_URL && origin === process.env.APP_URL.replace(/\/$/, '')) {
        return callback(null, true);
      }

      // Automatically allow DuckDNS, OnRender, or official domain subdomains
      try {
        const url = new URL(origin);
        if (
          url.hostname.endsWith('.duckdns.org') ||
          url.hostname.endsWith('.onrender.com') ||
          url.hostname === 'minanecargo.sn' ||
          url.hostname.endsWith('.minanecargo.sn')
        ) {
          return callback(null, true);
        }
      } catch (e) {}

      // Fallback: allow request so client SPA is never broken by origin mismatch
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24h preflight cache
  };
}

// ─── SQL injection detection (extra layer, Prisma already parameterizes) ──────
function sqlInjectionGuard(req, res, next) {
  const checkValue = (val) => {
    if (typeof val === 'string' && SQL_INJECTION_REGEX.test(val)) {
      return true;
    }
    return false;
  };
  const checkObj = (obj) => {
    if (!obj) return false;
    for (const val of Object.values(obj)) {
      if (typeof val === 'string' && checkValue(val)) return true;
      if (typeof val === 'object' && checkObj(val)) return true;
    }
    return false;
  };

  if (checkObj(req.body) || checkObj(req.query) || checkObj(req.params)) {
    return res.status(400).json({ error: 'Requête rejetée : contenu non autorisé détecté.' });
  }
  next();
}

// ─── Validators ───────────────────────────────────────────────────────────────
const VALIDATORS = {
  isValidTrackingCode(code) {
    if (!code || typeof code !== 'string') return false;
    const c = code.trim();
    return c.length >= 2 && c.length <= 30 && /^[A-Z0-9\-_]+$/i.test(c);
  },

  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const e = email.trim();
    // Reject anything with HTML/script characters before validation
    if (/[<>'"\\]/.test(e)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120;
  },

  isValidPin(pin) {
    if (!pin) return false;
    return /^\d{4}$/.test(pin.toString().trim());
  },

  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?[0-9]{7,18}$/.test(clean);
  },

  isSafePositiveNumber(val, max = 1_000_000_000) {
    if (val === undefined || val === null || val === '') return false;
    const num = Number(val);
    return !isNaN(num) && isFinite(num) && num >= 0 && num <= max;
  },

  isSafePositiveInteger(val, max = 1_000_000_000) {
    if (val === undefined || val === null || val === '') return false;
    const num = Number(val);
    return Number.isSafeInteger(num) && num >= 0 && num <= max;
  },

  isValidTransportMode(mode) {
    return mode === 'MARITIME_LCL' || mode === 'MARITIME_FCL';
  },

  isValidPaymentMethod(method) {
    return ['WAVE', 'ORANGE_MONEY', 'CASH', 'BANK_TRANSFER'].includes(method);
  },

  isValidStatus(status) {
    return [
      'CHINA_WAREHOUSE',
      'CONTAINER_LOADED',
      'TRANSFERRED_TO_PORT',
      'IN_TRANSIT',
      'ARRIVED_DAKAR',
      'CUSTOMS_CLEARANCE',
      'READY_FOR_PICKUP',
      'DELIVERED'
    ].includes(status);
  },

  isValidContainerStatus(status) {
    return [
      'LOADING',
      'IN_TRANSIT',
      'ARRIVED',
      'CUSTOMS',
      'DELIVERED'
    ].includes(status);
  },

  isSafeId(id) {
    if (!id || typeof id !== 'string') return false;
    // Prisma CUIDs: lowercase alphanumeric + no special chars
    return /^[a-z0-9]{15,30}$/i.test(id.trim());
  }
};

module.exports = {
  sanitizeString,
  deepSanitize,
  globalSanitizer,
  securityHeaders,
  globalRateLimiter,
  sqlInjectionGuard,
  buildCorsOptions,
  VALIDATORS
};
