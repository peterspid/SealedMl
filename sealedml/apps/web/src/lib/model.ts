export const MODEL_WEIGHTS = [-2, -3, 6, -2, -2, -1] as const;
export const MODEL_BIAS = 70;
export const MODEL_DECIMALS = 1;
export const RISK_THRESHOLDS = {
  lowRiskMax: 40,
  mediumRiskMax: 70,
  highRiskMax: 100,
} as const;

export function calculateScore(values: number[]) {
  const scale = 10 ** MODEL_DECIMALS;
  const positive = MODEL_BIAS * scale + values.reduce((sum, value, index) => {
    const weight = MODEL_WEIGHTS[index] ?? 0;
    return weight > 0 ? sum + Math.round(value) * weight : sum;
  }, 0);

  const negative = values.reduce((sum, value, index) => {
    const weight = MODEL_WEIGHTS[index] ?? 0;
    return weight < 0 ? sum + Math.round(value) * Math.abs(weight) : sum;
  }, 0);

  const raw = Math.floor(Math.max(0, positive - negative) / scale);
  return Math.min(RISK_THRESHOLDS.highRiskMax, raw);
}

export function classifyRisk(score: number): 0 | 1 | 2 {
  if (score <= RISK_THRESHOLDS.lowRiskMax) return 0;
  if (score <= RISK_THRESHOLDS.mediumRiskMax) return 1;
  return 2;
}

export function getModelExplanation(values: number[]) {
  const score = calculateScore(values);
  const riskClass = classifyRisk(score);
  const liabilities = values[2] ?? 0;
  const repayment = values[1] ?? 0;
  const consistency = values[4] ?? 0;

  const signals = [
    repayment >= 70 ? 'Strong repayment history lowers the risk score.' : 'Repayment history is the largest improvement area.',
    liabilities <= 35 ? 'Debt load is low relative to the model range.' : 'Current liabilities add risk pressure.',
    consistency >= 65 ? 'Transaction consistency lowers uncertainty.' : 'Transaction consistency is moderate.',
  ];

  return { score, riskClass, signals };
}
