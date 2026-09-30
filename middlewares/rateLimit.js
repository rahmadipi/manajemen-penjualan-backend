// Pembatas request sederhana (in-memory, per IP) untuk melindungi endpoint login dari brute force.
module.exports = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000)
      for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    const rec = hits.get(req.ip);
    if (!rec || rec.reset <= now) {
      hits.set(req.ip, { count: 1, reset: now + windowMs });
      return next();
    }
    if (rec.count >= max) {
      res.set("Retry-After", String(Math.ceil((rec.reset - now) / 1000)));
      return res
        .status(429)
        .json({
          message:
            "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
        });
    }
    rec.count += 1;
    next();
  };
};
