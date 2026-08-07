import rateLimit from 'express-rate-limit';

/**
 * Rate limiter umum untuk seluruh API.
 * Maks 200 request per 15 menit per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi dalam beberapa menit.' },
});

/**
 * Rate limiter ketat khusus untuk public form submission.
 * Maks 5 submit per IP per 10 menit — cukup untuk user normal,
 * tapi mencegah bot / spam masal.
 */
export const formSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Anda sudah mengirim terlalu banyak form. Silakan coba lagi dalam 10 menit.' },
  keyGenerator: (req) => req.ip ?? 'unknown',
});

/**
 * Rate limiter ketat khusus untuk public feedback/testimoni submission.
 * Maks 5 submit per IP per 10 menit.
 */
export const feedbackSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Anda sudah mengirim terlalu banyak feedback. Silakan coba lagi dalam 10 menit.' },
  keyGenerator: (req) => req.ip ?? 'unknown',
});
