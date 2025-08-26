# Credit Score Lite API

A lightweight, ready-to-use API for credit risk scoring, designed for fintech companies, cooperatives, and lending applications. Developed with Node.js and Express.

## What it does

- Calculates an approximate credit score and risk level from basic applicant data.
- Explains which factors influence the score.
- Provides population benchmarks per country aggregated from real usage data.
- Exposes endpoints to list recent anonymized scoring records.

## Quick start

1. Install dependencies

```
npm install
```

2. Run the server (default port 3000)

```
npm run start
# or for auto-reload during development
npm run dev
```

3. Health check

- GET /health

4. Root info

- GET /

## API Endpoints

All responses are in English. Spanish field names in requests are supported and mapped to English automatically.

### POST /credit-score

Body (English):

```
{
  "age": 28,
  "monthly_income": 1200,
  "payment_history": "good",
  "active_debts": 2,
  "current_job_tenure_months": 24,
  "has_collateral": true,
  "country": "mx"
}
```

Body (Spanish):

```
{
  "edad": 28,
  "ingresos_mensuales": 1200,
  "historial_pagos": "bueno",
  "deudas_activas": 2,
  "tiempo_empleo_actual_meses": 24,
  "tiene_garantia": true,
  "pais": "mx"
}
```

Response example:

```
{
  "score": 685,
  "risk_level": "medium",
  "default_probability": 0.18,
  "recommendation": "Approve with additional guarantee"
}
```

### POST /risk-factors

Body: same as `/credit-score`.

Response example:

```
{
  "factors": [
    { "factor": "Age", "impact": "positive" },
    { "factor": "Monthly income", "impact": "positive" },
    { "factor": "Active debts", "impact": "negative" }
  ]
}
```

### GET /benchmarks

Returns aggregated benchmark statistics (e.g., count, average score, percentiles) computed from stored scoring records.

### GET /benchmarks/{country}

Returns benchmark statistics for the specified country code (e.g., `mx`, `pe`, `co`, `cl`, `ar`, `us`).

### GET /records

Lists recent anonymized scoring records (derived from POST `/credit-score`).

Query parameters:

- `limit`: number (default 50, max 200)
- `offset`: number (default 0)

### GET /records/{country}

Same as `/records` but filtered by country code.

Query parameters:

- `limit`: number (default 50, max 200)
- `offset`: number (default 0)

## Data storage

Benchmarks are calculated from user-submitted scoring records stored in a newline-delimited JSON file.

- Default path: `data/records.jsonl`

## Environment variables

- `PORT`: server port (default 3000)

## Validation

- Input is validated with Zod.
- Required fields: `age`, `monthly_income`, `payment_history`, `active_debts`, `current_job_tenure_months`.
- `payment_history` accepted values: `excellent`, `good`, `fair`, `poor`.

## Scoring model (transparent)

- Base score 650 with adjustments for age, income, payment history, active debts, job tenure, and collateral.
- Final score is clamped to 300–850.
- Default probability is a smooth function of the score.
- Risk levels: `very_low`, `low`, `medium`, `elevated`, `high`.
