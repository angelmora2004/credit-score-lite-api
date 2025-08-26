require('dotenv').config();
const express = require('express');
const pkg = require('../package.json');
const morgan = require('morgan');
const cors = require('cors');

const creditScoreRouter = require('./routes/creditScore');
const riskFactorsRouter = require('./routes/riskFactors');
const benchmarksRouter = require('./routes/benchmarks');
const recordsRouter = require('./routes/records');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'credit-score-lite-api', timestamp: new Date().toISOString() });
});

// Root info
app.get('/', (req, res) => {
  res.json({
    service: 'credit-score-lite-api',
    version: pkg.version,
    description: 'Lightweight API to estimate credit risk, explain factors, and expose aggregate benchmarks.',
    endpoints: [
      { method: 'GET', path: '/', description: 'Service info and endpoints list' },
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'POST', path: '/credit-score', description: 'Calculate credit score and risk' },
      { method: 'POST', path: '/risk-factors', description: 'Explain risk factors for a given applicant' },
      { method: 'GET', path: '/benchmarks', description: 'Aggregated benchmarks from stored records' },
      { method: 'GET', path: '/benchmarks/{country}', description: 'Benchmarks filtered by country code' },
      { method: 'GET', path: '/records', description: 'List recent anonymized scoring records' },
      { method: 'GET', path: '/records/{country}', description: 'List records filtered by country' }
    ],
    docs: 'See README.md in the repository',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/credit-score', creditScoreRouter);
app.use('/risk-factors', riskFactorsRouter);
app.use('/benchmarks', benchmarksRouter);
app.use('/records', recordsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Credit Score Lite API running on port ${PORT}`);
});
