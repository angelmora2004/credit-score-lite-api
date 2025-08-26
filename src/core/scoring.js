/**
 * Simple, interpretable scoring engine.
 * Base score 650, adjusted by weighted features.
 */

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function scoreApplicant(a) {
  // Base score
  let score = 650;

  // Age buckets
  if (a.age < 21) score -= 40;
  else if (a.age < 25) score -= 20;
  else if (a.age <= 35) score += 10;
  else if (a.age <= 60) score += 5;
  else score -= 10;

  // Income: diminishing returns, cap impact
  const incomeK = a.monthly_income / 1000; // thousands
  score += clamp(Math.floor(incomeK * 8), 0, 60); // 0..60

  // Payment history
  const histWeights = { excellent: 80, good: 40, fair: -20, poor: -80 };
  score += histWeights[a.payment_history] ?? 0;

  // Active debts
  if (a.active_debts === 0) score += 20;
  else if (a.active_debts <= 2) score -= 5;
  else if (a.active_debts <= 5) score -= 25;
  else score -= 50;

  // Job tenure
  if (a.current_job_tenure_months >= 60) score += 30;
  else if (a.current_job_tenure_months >= 24) score += 15;
  else if (a.current_job_tenure_months >= 12) score += 5;
  else if (a.current_job_tenure_months >= 6) score -= 5;
  else score -= 20;

  // Collateral presence slightly de-risks
  if (a.has_collateral === true) score += 10;

  // Normalize to 300..850
  score = clamp(Math.round(score), 300, 850);

  const pd = probabilityOfDefault(score);
  const riskLevel = riskFromScore(score);
  const recommendation = recommendationFromRisk(riskLevel, a);

  return { score, risk_level: riskLevel, default_probability: pd, recommendation };
}

function probabilityOfDefault(score) {
  // Map score to PD via simple logistic curve approximation
  // Higher score => lower PD (3% to 60% range)
  const x = (850 - score) / 100; // more risk when score small
  const pd = 1 / (1 + Math.exp(-(x - 1.5))) * 0.57 + 0.03; // ~3%..60%
  return Number(pd.toFixed(3));
}

function riskFromScore(score) {
  if (score >= 760) return 'very_low';
  if (score >= 700) return 'low';
  if (score >= 650) return 'medium';
  if (score >= 600) return 'elevated';
  return 'high';
}

function recommendationFromRisk(risk, a) {
  switch (risk) {
    case 'very_low':
      return 'Approve standard terms';
    case 'low':
      return 'Approve; consider better rate';
    case 'medium':
      return a.has_collateral ? 'Approve with collateral' : 'Approve with additional guarantee';
    case 'elevated':
      return 'Conditional approval; reduce amount and require collateral';
    case 'high':
    default:
      return 'Reject or require strong collateral';
  }
}

function explainRiskFactors(a) {
  const factors = [];

  // Age
  if (a.age < 25) factors.push({ factor: 'Age', impact: 'negative' });
  else if (a.age <= 60) factors.push({ factor: 'Age', impact: 'positive' });
  else factors.push({ factor: 'Age', impact: 'slightly_negative' });

  // Income
  if (a.monthly_income >= 1500) factors.push({ factor: 'Monthly income', impact: 'positive' });
  else if (a.monthly_income >= 700) factors.push({ factor: 'Monthly income', impact: 'neutral' });
  else factors.push({ factor: 'Monthly income', impact: 'negative' });

  // Payment history
  const map = { excellent: 'strong_positive', good: 'positive', fair: 'negative', poor: 'strong_negative' };
  factors.push({ factor: 'Payment history', impact: map[a.payment_history] });

  // Active debts
  if (a.active_debts === 0) factors.push({ factor: 'Active debts', impact: 'positive' });
  else if (a.active_debts <= 2) factors.push({ factor: 'Active debts', impact: 'slightly_negative' });
  else if (a.active_debts <= 5) factors.push({ factor: 'Active debts', impact: 'negative' });
  else factors.push({ factor: 'Active debts', impact: 'strong_negative' });

  // Job tenure
  if (a.current_job_tenure_months >= 24) factors.push({ factor: 'Job tenure', impact: 'positive' });
  else if (a.current_job_tenure_months >= 12) factors.push({ factor: 'Job tenure', impact: 'slightly_positive' });
  else if (a.current_job_tenure_months >= 6) factors.push({ factor: 'Job tenure', impact: 'neutral' });
  else factors.push({ factor: 'Job tenure', impact: 'negative' });

  // Collateral
  if (a.has_collateral === true) factors.push({ factor: 'Collateral', impact: 'positive' });

  return { factors };
}

module.exports = {
  scoreApplicant,
  explainRiskFactors,
  probabilityOfDefault,
  riskFromScore,
};
