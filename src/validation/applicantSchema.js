const { z } = require('zod');

const applicantSchema = z.object({
  age: z.number().int().min(18).max(100),
  monthly_income: z.number().nonnegative(),
  payment_history: z.enum(['excellent', 'good', 'fair', 'poor']).default('fair'),
  active_debts: z.number().int().min(0).max(50),
  current_job_tenure_months: z.number().int().min(0).max(600),
  // Optional enrichments
  country: z.string().min(2).max(56).optional(),
  has_collateral: z.boolean().optional(),
});

function validateApplicant(input) {
  const parsed = applicantSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
    const error = new Error('ValidationError');
    error.status = 400;
    error.details = issues;
    throw error;
  }
  return parsed.data;
}

module.exports = { applicantSchema, validateApplicant };
