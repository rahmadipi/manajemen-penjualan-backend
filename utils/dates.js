// Helper tanggal berbasis zona waktu aplikasi (default Asia/Jakarta).
const DAY_MS = 86400000;

const dayKey = (date, tz) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

function tzOffsetMs(date, tz) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// "2026-09-29" -> awal hari (00:00) pada zona waktu tz, dalam bentuk Date (UTC instant).
function startOfDay(dateStr, tz) {
  const guess = new Date(`${dateStr}T00:00:00Z`);
  return new Date(guess.getTime() - tzOffsetMs(guess, tz));
}

function addDays(dateStr, n) {
  return new Date(Date.parse(`${dateStr}T00:00:00Z`) + n * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function isDateString(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Deret penjualan harian untuk n hari terakhir (termasuk hari ini), hari tanpa transaksi bernilai 0.
function buildDailySeries(rows, days, tz, now = new Date()) {
  const keys = Array.from({ length: days }, (_, i) =>
    dayKey(new Date(now.getTime() - (days - 1 - i) * DAY_MS), tz),
  );
  const map = new Map(
    keys.map((k) => [k, { tanggal: k, total: 0, transaksi: 0 }]),
  );
  for (const r of rows) {
    const entry = map.get(dayKey(new Date(r.tanggal_transaksi), tz));
    if (entry) {
      entry.total += Number(r.total_harga);
      entry.transaksi += 1;
    }
  }
  return keys.map((k) => map.get(k));
}

module.exports = {
  DAY_MS,
  dayKey,
  startOfDay,
  addDays,
  isDateString,
  buildDailySeries,
};
