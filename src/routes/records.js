const express = require('express');
const { readAllRecords, getRecordsByCountry } = require('../store/recordsStore');

const router = express.Router();

function parsePagination(query) {
  const maxLimit = 200;
  let limit = Number(query.limit ?? 50);
  let offset = Number(query.offset ?? 0);
  if (!Number.isFinite(limit) || limit <= 0) limit = 50;
  if (!Number.isFinite(offset) || offset < 0) offset = 0;
  if (limit > maxLimit) limit = maxLimit;
  return { limit, offset };
}

router.get('/', (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const all = readAllRecords();
  const slice = all.slice(offset, offset + limit);
  res.json({ total: all.length, limit, offset, records: slice });
});

router.get('/:country', (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const country = req.params.country;
  const all = getRecordsByCountry(country);
  if (!all.length) return res.status(404).json({ error: 'No records for country' });
  const slice = all.slice(offset, offset + limit);
  res.json({ country, total: all.length, limit, offset, records: slice });
});

module.exports = router;
