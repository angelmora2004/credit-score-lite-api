const express = require('express');
const { computeAllBenchmarks, computeBenchmarksForCountry } = require('../store/recordsStore');

const router = express.Router();

// List all available benchmarks
router.get('/', (_req, res) => {
  const all = computeAllBenchmarks();
  res.json({ countries: Object.values(all) });
});

// Get benchmark by country code
router.get('/:country', (req, res) => {
  const code = req.params.country;
  const data = computeBenchmarksForCountry(code);
  if (!data) return res.status(404).json({ error: 'No data for country' });
  return res.json(data);
});

module.exports = router;
