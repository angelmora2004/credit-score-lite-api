const fs = require('fs');
const path = require('path');

function loadBenchmarks() {
  
  const inline = process.env.BENCHMARKS_JSON;
  const filePath = process.env.BENCHMARKS_FILE;

  if (inline) {
    try {
      const data = JSON.parse(inline);
      return normalizeKeys(data);
    } catch (e) {
      console.warn('Invalid BENCHMARKS_JSON, falling back to file:', e.message);
    }
  }

  let jsonPath = path.resolve(__dirname, '..', 'data', 'benchmarks.json');
  if (filePath) jsonPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    return normalizeKeys(data);
  } catch (e) {
    console.error('Failed to load benchmarks data:', e.message);
    return {};
  }
}

function normalizeKeys(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) out[k.toLowerCase()] = v;
  return out;
}

const CACHE_TTL_MS = Number(process.env.BENCHMARKS_CACHE_TTL_MS || 5 * 60 * 1000);
let cache = { data: null, ts: 0 };

function getAllBenchmarks() {
  const now = Date.now();
  if (!cache.data || now - cache.ts > CACHE_TTL_MS) {
    cache = { data: loadBenchmarks(), ts: now };
  }
  return cache.data;
}

function getBenchmarkByCountry(code) {
  if (!code) return null;
  const all = getAllBenchmarks();
  return all[code.toLowerCase()] || null;
}

module.exports = { getAllBenchmarks, getBenchmarkByCountry };
