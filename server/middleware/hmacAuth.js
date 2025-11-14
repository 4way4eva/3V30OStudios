// HMAC auth middleware for incoming webhook calls
// Verifies header 'x-bleuchain-signature' against HMAC-SHA256 of the raw body
// Requires process.env.WEBHOOK_SECRET to be set to the shared secret
const crypto = require('crypto');

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function createHmac(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Express middleware expects raw body buffered on req.rawBody
module.exports = function hmacAuth(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET || '';
  if (!secret) {
    return res.status(500).json({ ok: false, error: 'WEBHOOK_SECRET not configured' });
  }
  const sig = req.header('x-bleuchain-signature') || '';
  if (!sig) return res.status(401).json({ ok: false, error: 'missing signature' });

  // req.rawBody should be set by a body parser raw middleware or by using a custom body parser.
  const raw = req.rawBody ? req.rawBody : JSON.stringify(req.body || {});
  const expected = createHmac(secret, raw);
  if (!timingSafeEqual(expected, sig)) return res.status(401).json({ ok: false, error: 'invalid signature' });

  next();
};