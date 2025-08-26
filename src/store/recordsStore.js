const fs = require('fs');
const path = require('path');

const DEFAULT_FILE = path.resolve(process.cwd(), 'data', 'records.jsonl');

function getStorePath() {
  const p = process.env.RECORDS_FILE || DEFAULT_FILE;
  const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  // ensure dir exists
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  return abs;
}

function appendRecord(rec) {
  const file = getStorePath();
  const line = JSON.stringify(rec) + '\n';
  fs.appendFileSync(file, line, 'utf8');
}

function readAllRecords() {
  const file = getStorePath();
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.trim()) return [];
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const recs = [];
  for (const l of lines) {
    try { recs.push(JSON.parse(l)); } catch { /* ignore bad lines */ }
  }
  return recs;
}

function getRecordsByCountry(code) {
  if (!code) return [];
  const key = code.toLowerCase();
  return readAllRecords().filter(r => (r.country || 'unknown').toLowerCase() === key);
}

function listCountries() {
  const set = new Set();
  for (const r of readAllRecords()) set.add((r.country || 'unknown').toLowerCase());
  return Array.from(set);
}

function computeStats(scores) {
  if (!scores.length) return null;
  const n = scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / n;
  const median = percentile(sorted, 50);
  const p10 = percentile(sorted, 10);
  const p90 = percentile(sorted, 90);
  return {
    average_score: Math.round(avg),
    median_score: Math.round(median),
    p10: Math.round(p10),
    p90: Math.round(p90),
    sample_size: n,
  };
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0;
  const rank = (p / 100) * (sortedAsc.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sortedAsc[low];
  const weight = rank - low;
  return sortedAsc[low] * (1 - weight) + sortedAsc[high] * weight;
}

function computeBenchmarksForCountry(code) {
  const recs = getRecordsByCountry(code);
  const stats = computeStats(recs.map(r => r.score));
  if (!stats) return null;
  return { country: code.toUpperCase(), ...stats };
}

function computeAllBenchmarks() {
  const countries = listCountries();
  const out = {};
  for (const c of countries) {
    const stats = computeBenchmarksForCountry(c);
    if (stats) out[c] = stats;
  }
  return out;
}

module.exports = {
  appendRecord,
  readAllRecords,
  getRecordsByCountry,
  listCountries,
  computeBenchmarksForCountry,
  computeAllBenchmarks,
};
