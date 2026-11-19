const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { JWT_SECRET, authAdmin } = require('../middleware/auth');
const { VALIDATORS } = require('../middleware/sanitize');

// ─── In-memory brute-force protection ─────────────────────────────────────────
const loginAttempts = new Map();
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return true;
  if (record.attempts >= MAX_ATTEMPTS && now - record.lastAttempt < LOCKOUT_MS) return false;
  if (now - record.lastAttempt >= LOCKOUT_MS) { loginAttempts.delete(ip); return true; }
  return true;
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, lastAttempt: now };
  record.attempts++;
  record.lastAttempt = now;
  loginAttempts.set(ip, record);
}

function resetFailedAttempts(ip) {
  loginAttempts.delete(ip);
}

// ─── POST /api/auth/admin/login ───────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

    // 1. Brute-force check
    if (!checkBruteForce(clientIp)) {
      return res.status(429).json({
        error: 'Trop de tentatives échouées. Compte verrouillé pour 15 minutes.'
      });
    }

    const { email, password } = req.body;

    // 2. Presence check
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // 3. Format validation
    if (!VALIDATORS.isValidEmail(email)) {
      return res.status(400).json({ error: 'Format d\'adresse email invalide.' });
    }
    if (typeof password !== 'string' || password.length < 4 || password.length > 128) {
      return res.status(400).json({ error: 'Mot de passe invalide.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 4. Lookup admin
    let admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });

    // 5. Auto-create from .env if first login and credentials match
    const envEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (!admin && envEmail && cleanEmail === envEmail) {
      if (password === process.env.ADMIN_PASSWORD) {
        const hash = await bcrypt.hash(password, 12);
        admin = await prisma.admin.create({
          data: {
            email: envEmail,
            passwordHash: hash,
            name: process.env.ADMIN_NAME || 'Direction Minane Cargo'
          }
        });
      }
    }

    // 6. Constant-time comparison to prevent timing attacks
    if (!admin) {
      await bcrypt.compare('dummy', '$2b$12$dummyhashtopreventtimingattacks1234567');
      recordFailedAttempt(clientIp);
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    resetFailedAttempts(clientIp);

    // 7. Issue token with issuer claim
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256', issuer: 'minane-cargo' }
    );

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    console.error('[AUTH] Admin login error:', error.message);
    res.status(500).json({ error: 'Erreur interne lors de la connexion.' });
  }
});

// ─── GET /api/auth/admin/me ───────────────────────────────────────────────────
router.get('/admin/me', authAdmin, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!admin) return res.status(404).json({ error: 'Admin introuvable.' });
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
