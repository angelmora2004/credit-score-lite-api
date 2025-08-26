require('dotenv').config();
const express = require('express');
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
