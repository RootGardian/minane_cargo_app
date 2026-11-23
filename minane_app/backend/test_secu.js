/**
 * Minane Cargo — Test de sécurité complet
 * Exécuter: node test_secu.js
 */

const { sanitizeString, deepSanitize, VALIDATORS, globalRateLimiter, sqlInjectionGuard } = require('./src/middleware/sanitize');

let passed = 0;
let failed = 0;

function test(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${name}${detail ? ' → ' + detail : ''}`);
    failed++;
  }
}

console.log('\n═══════════════════════════════════════════');
console.log('  🔐 Minane Cargo — Audit Sécurité Complet');
console.log('═══════════════════════════════════════════\n');

// ─── 1. XSS Protection ────────────────────────────────────────────────────────
console.log('📌 1. Protection XSS');
test('Suppression script tag', sanitizeString('<script>alert(1)</script>') === '');
test('Suppression event handler', !sanitizeString('"><img onerror="alert(1)">').includes('onerror'));
test('Suppression javascript:', !sanitizeString('javascript:alert(1)').includes('javascript:'));
test('Suppression tags HTML', !sanitizeString('<b>bold</b>').includes('<b>'));
test('Texte normal préservé', sanitizeString('Colis Guangzhou → Dakar') === 'Colis Guangzhou → Dakar');

// ─── 2. Prototype Pollution ───────────────────────────────────────────────────
console.log('\n📌 2. Protection Prototype Pollution');
const polluted = deepSanitize({ '__proto__': { admin: true }, 'constructor': { evil: true }, 'prototype': { bad: true }, name: 'test' });
test('__proto__ supprimé (pas dans OwnProperties)', !Object.prototype.hasOwnProperty.call(polluted, '__proto__'));
test('constructor supprimé (pas dans OwnProperties)', !Object.prototype.hasOwnProperty.call(polluted, 'constructor'));
test('prototype supprimé (pas dans OwnProperties)', !Object.prototype.hasOwnProperty.call(polluted, 'prototype'));
test('Données légitimes préservées', polluted.name === 'test');

// ─── 3. Null bytes & Path Traversal ──────────────────────────────────────────
console.log('\n📌 3. Null Bytes & Path Traversal');
test('Null byte supprimé', !sanitizeString('test\0hack').includes('\0'));
test('Path traversal supprimé', !sanitizeString('../../../etc/passwd').includes('../'));
test('Double path traversal supprimé', !sanitizeString('..\\..\\windows').includes('..\\'));

// ─── 4. Validators ────────────────────────────────────────────────────────────
console.log('\n📌 4. Validateurs métier');

// Tracking codes
test('Code valide MNC-1234A', VALIDATORS.isValidTrackingCode('MNC-1234A'));
test('Code valide MSKU-123456', VALIDATORS.isValidTrackingCode('MSKU-123456'));
test('Code vide rejeté', !VALIDATORS.isValidTrackingCode(''));
test('Code SQL injection rejeté', !VALIDATORS.isValidTrackingCode("'; DROP TABLE--"));
test('Code trop long rejeté', !VALIDATORS.isValidTrackingCode('A'.repeat(31)));

// Email
test('Email valide accepté', VALIDATORS.isValidEmail('admin@minanecargo.sn'));
test('Email sans @ rejeté', !VALIDATORS.isValidEmail('adminminanecargo.sn'));
test('Email injection rejeté', !VALIDATORS.isValidEmail('<script>@x.com'));

// PIN
test('PIN 4 chiffres valide', VALIDATORS.isValidPin('1234'));
test('PIN lettres rejeté', !VALIDATORS.isValidPin('abcd'));
test('PIN trop court rejeté', !VALIDATORS.isValidPin('123'));
test('PIN trop long rejeté', !VALIDATORS.isValidPin('12345'));

// Phone
test('Téléphone sénégalais valide', VALIDATORS.isValidPhone('+221705961276'));
test('Téléphone chinois valide', VALIDATORS.isValidPhone('+8613800138000'));
test('Téléphone trop court rejeté', !VALIDATORS.isValidPhone('123'));
test('Téléphone avec lettres rejeté', !VALIDATORS.isValidPhone('+221abc123'));

// Transport mode
test('MARITIME_LCL valide', VALIDATORS.isValidTransportMode('MARITIME_LCL'));
test('MARITIME_FCL valide', VALIDATORS.isValidTransportMode('MARITIME_FCL'));
test('AIR_EXPRESS valide', VALIDATORS.isValidTransportMode('AIR_EXPRESS'));
test('AIR_NORMAL valide', VALIDATORS.isValidTransportMode('AIR_NORMAL'));
test('Injection rejetée', !VALIDATORS.isValidTransportMode("'; DROP TABLE--"));

// Payment method
test('WAVE valide', VALIDATORS.isValidPaymentMethod('WAVE'));
test('ORANGE_MONEY valide', VALIDATORS.isValidPaymentMethod('ORANGE_MONEY'));
test('CASH valide', VALIDATORS.isValidPaymentMethod('CASH'));
test('BITCOIN rejeté', !VALIDATORS.isValidPaymentMethod('BITCOIN'));

// Numbers
test('Nombre positif valide', VALIDATORS.isSafePositiveNumber(165000, 10000000));
test('Nombre négatif rejeté', !VALIDATORS.isSafePositiveNumber(-1));
test('NaN rejeté', !VALIDATORS.isSafePositiveNumber(NaN));
test('Infinity rejeté', !VALIDATORS.isSafePositiveNumber(Infinity));
test('Dépassement max rejeté', !VALIDATORS.isSafePositiveNumber(999999999, 100));

// Status
test('IN_TRANSIT valide', VALIDATORS.isValidStatus('IN_TRANSIT'));
test('DELIVERED valide', VALIDATORS.isValidStatus('DELIVERED'));
test('HACKED rejeté', !VALIDATORS.isValidStatus('HACKED'));

// ID safety
test('CUID valide', VALIDATORS.isSafeId('clng1234567890abc'));
test('ID avec injection rejeté', !VALIDATORS.isSafeId("'; DROP--"));
test('ID vide rejeté', !VALIDATORS.isSafeId(''));

// ─── 5. SQL Injection patterns ────────────────────────────────────────────────
console.log('\n📌 5. Détection SQL Injection');
const mockRes = {
  status(c) { this._status = c; return this; },
  json(d) { this._data = d; return this; }
};
let sqlBlocked = false;
const mockReq = { body: { name: "' OR 1=1--" }, query: {}, params: {} };
sqlInjectionGuard(mockReq, mockRes, () => { });
test('SQL OR 1=1 bloqué', mockRes._status === 400);

const mockReq2 = { body: { name: 'Colis normal Guangzhou' }, query: {}, params: {} };
let passed2 = false;
sqlInjectionGuard(mockReq2, mockRes, () => { passed2 = true; });
test('Texte normal passe le guard SQL', passed2);

// ─── Résumé ───────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════');
console.log(`  Résultat: ${passed} réussis / ${passed + failed} tests`);
if (failed === 0) {
  console.log('  🎉 TOUS LES TESTS PASSENT — Sécurité OK');
} else {
  console.log(`  ⚠️  ${failed} TEST(S) EN ÉCHEC — À corriger`);
}
console.log('═══════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);

