const jwt = require('jsonwebtoken');

// JWT_SECRET MUST be set in .env — refuse to start with default fallback in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
    process.exit(1);
  } else {
    console.warn('[SECURITY WARNING] JWT_SECRET not set or too short. Using insecure default for DEV only.');
  }
}

const SECRET = JWT_SECRET || 'dev_only_insecure_secret_do_not_use_in_production_ever';

function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  // Reject tokens that are suspiciously long (tamper protection)
  if (token.length > 2048) {
    return res.status(401).json({ error: 'Token invalide.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],     // Lock algorithm — prevent "none" attack
      issuer: 'minane-cargo',    // Optional: validate issuer
    });
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
    }
    return res.status(401).json({ error: 'Token invalide.' });
  }
}

module.exports = {
  authAdmin,
  JWT_SECRET: SECRET
};
