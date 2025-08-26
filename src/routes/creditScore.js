const express = require('express');
const { validateApplicant } = require('../validation/applicantSchema');
const { scoreApplicant } = require('../core/scoring');
const { appendRecord } = require('../store/recordsStore');

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const payload = mapLegacyKeys(req.body);
    const applicant = validateApplicant(payload);
    const result = scoreApplicant(applicant);
    const response = {
      score: result.score,
      risk_level: result.risk_level,
      default_probability: result.default_probability,
      recommendation: result.recommendation,
    };

    // Persist anonymized record for future benchmarks and analytics
    try {
      appendRecord({
        ts: Date.now(),
        score: result.score,
        risk_level: result.risk_level,
        default_probability: result.default_probability,
        country: applicant.country || 'unknown',
      });
    } catch (e) {
      console.warn('Unable to persist record:', e.message);
    }

    res.json(response);
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: 'Invalid input', details: err.details });
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

function mapLegacyKeys(body) {
  // Support Spanish input field names by mapping to English schema
  const mapped = { ...body };
  if (body.edad != null) mapped.age = body.edad;
  if (body.ingresos_mensuales != null) mapped.monthly_income = body.ingresos_mensuales;
  if (body.historial_pagos != null) {
    const map = { excelente: 'excellent', bueno: 'good', regular: 'fair', malo: 'poor' };
    mapped.payment_history = map[body.historial_pagos] || body.historial_pagos;
  }
  if (body.deudas_activas != null) mapped.active_debts = body.deudas_activas;
  if (body.tiempo_empleo_actual_meses != null) mapped.current_job_tenure_months = body.tiempo_empleo_actual_meses;
  if (body.pais != null) mapped.country = body.pais;
  if (body.tiene_garantia != null) mapped.has_collateral = body.tiene_garantia;
  return mapped;
}

module.exports = router;
