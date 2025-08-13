export interface SampleSizeParams {
  testType: string;
  effectSize: number;
  power: number;
  alpha: number;
  groups?: number;
}

export interface SampleSizeResult {
  sampleSize: number;
  totalSampleSize: number;
  adjustedSampleSize: number;
  formula: string;
  assumptions: string[];
}

export function calculateSampleSize(params: SampleSizeParams): SampleSizeResult {
  const { testType, effectSize, power, alpha, groups = 2 } = params;
  
  // Z-scores for common values
  const getZScore = (p: number): number => {
    if (p === 0.05) return 1.96;
    if (p === 0.01) return 2.576;
    if (p === 0.001) return 3.291;
    // Approximation for other values
    return Math.abs(inverseNormalCDF(p / 2));
  };

  const getPowerZScore = (power: number): number => {
    if (power === 0.8) return 0.842;
    if (power === 0.9) return 1.282;
    if (power === 0.95) return 1.645;
    // Approximation for other values
    return Math.abs(inverseNormalCDF(1 - power));
  };

  let sampleSize: number;
  let formula: string;
  let assumptions: string[];

  switch (testType.toLowerCase()) {
    case 'two-sample t-test':
    case 'independent t-test':
      const zAlpha = getZScore(alpha);
      const zBeta = getPowerZScore(power);
      sampleSize = Math.ceil(2 * Math.pow(zAlpha + zBeta, 2) / Math.pow(effectSize, 2));
      formula = "n = 2 × (z_α/2 + z_β)² / δ²";
      assumptions = [
        "Normal distribution",
        "Equal variances",
        "Independent observations",
        "Continuous outcome variable"
      ];
      break;

    case 'paired t-test':
    case 'dependent t-test':
      const zAlphaPaired = getZScore(alpha);
      const zBetaPaired = getPowerZScore(power);
      sampleSize = Math.ceil(Math.pow(zAlphaPaired + zBetaPaired, 2) / Math.pow(effectSize, 2));
      formula = "n = (z_α/2 + z_β)² / δ²";
      assumptions = [
        "Normal distribution of differences",
        "Paired observations",
        "Continuous outcome variable"
      ];
      break;

    case 'one-way anova':
      const fEffect = effectSize; // Assuming Cohen's f
      sampleSize = Math.ceil(calculateANOVASampleSize(fEffect, power, alpha, groups));
      const dfError = groups * (sampleSize - 1);
      const fCritical = getFCritical(alpha, groups - 1, dfError);
      formula = "n = λ / (k × f²) where λ is noncentrality parameter";
      assumptions = [
        "Normal distribution within groups",
        "Equal variances (homoscedasticity)",
        "Independent observations",
        "Continuous outcome variable"
      ];
      break;

    case 'proportion test':
    case 'chi-square test':
      const p1 = 0.5; // Assumed baseline proportion
      const p2 = p1 + effectSize; // Effect as difference in proportions
      const pooledP = (p1 + p2) / 2;
      const zAlphaProp = getZScore(alpha);
      const zBetaProp = getPowerZScore(power);
      
      sampleSize = Math.ceil(
        2 * pooledP * (1 - pooledP) * Math.pow(zAlphaProp + zBetaProp, 2) / Math.pow(p2 - p1, 2)
      );
      formula = "n = 2 × p̄(1-p̄) × (z_α/2 + z_β)² / (p₂-p₁)²";
      assumptions = [
        "Binary outcome variable",
        "Independent observations",
        "Adequate expected frequencies (≥5 per cell)"
      ];
      break;

    case 'correlation test':
      const r = effectSize; // Correlation coefficient
      const zR = 0.5 * Math.log((1 + r) / (1 - r)); // Fisher's z-transformation
      const zAlphaCorr = getZScore(alpha);
      const zBetaCorr = getPowerZScore(power);
      
      sampleSize = Math.ceil(Math.pow(zAlphaCorr + zBetaCorr, 2) / Math.pow(zR, 2) + 3);
      formula = "n = (z_α/2 + z_β)² / z_r² + 3";
      assumptions = [
        "Bivariate normal distribution",
        "Linear relationship",
        "Independent observations",
        "Continuous variables"
      ];
      break;

    default:
      // Default to two-sample t-test
      const zAlphaDef = getZScore(alpha);
      const zBetaDef = getPowerZScore(power);
      sampleSize = Math.ceil(2 * Math.pow(zAlphaDef + zBetaDef, 2) / Math.pow(effectSize, 2));
      formula = "n = 2 × (z_α/2 + z_β)² / δ²";
      assumptions = [
        "Normal distribution",
        "Equal variances",
        "Independent observations"
      ];
  }

  const totalSampleSize = testType.toLowerCase().includes('paired') ? sampleSize : sampleSize * groups;
  const adjustedSampleSize = Math.ceil(totalSampleSize * 1.2); // 20% dropout adjustment

  return {
    sampleSize,
    totalSampleSize,
    adjustedSampleSize,
    formula,
    assumptions
  };
}

// Helper functions for statistical calculations
function inverseNormalCDF(p: number): number {
  // Approximation of the inverse normal cumulative distribution function
  // Using Beasley-Springer-Moro algorithm (simplified)
  const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, 
            -2.759285104469687e+02, 1.383577518672690e+02, 
            -3.066479806614716e+01, 2.506628277459239e+00];
  
  const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, 
            -1.556989798598866e+02, 6.680131188771972e+01, 
            -1.328068155288572e+01];
  
  const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, 
            -2.400758277161838e+00, -2.549732539343734e+00, 
            4.374664141464968e+00, 2.938163982698783e+00];
  
  const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 
            2.445134137142996e+00, 3.754408661907416e+00];

  let x = p - 0.5;
  
  if (Math.abs(x) < 0.42) {
    let r = x * x;
    return x * (((a[4] * r + a[3]) * r + a[2]) * r + a[1]) * r + a[0] /
           ((((b[4] * r + b[3]) * r + b[2]) * r + b[1]) * r + 1);
  }
  
  let r = p;
  if (x > 0) r = 1 - p;
  r = Math.log(-Math.log(r));
  
  let ret = (((c[4] * r + c[3]) * r + c[2]) * r + c[1]) * r + c[0] /
           ((d[4] * r + d[3]) * r + d[2]) * r + d[1] * r + 1;
  
  if (x < 0) ret = -ret;
  return ret;
}

function getFCritical(alpha: number, df1: number, df2: number): number {
  // Simplified F-critical value calculation
  // In practice, you'd use a proper F-distribution table or library
  if (alpha === 0.05 && df1 === 1) return 3.84;
  if (alpha === 0.01 && df1 === 1) return 6.63;
  return 3.84; // Default approximation
}

function calculateANOVASampleSize(effectSize: number, power: number, alpha: number, groups: number): number {
  // Simplified ANOVA sample size calculation
  // This is a basic approximation - in practice you'd use more sophisticated methods
  const zAlpha = 1.96; // For α = 0.05
  const zBeta = 0.842; // For power = 0.8
  
  return 2 * Math.pow(zAlpha + zBeta, 2) / (groups * Math.pow(effectSize, 2));
}
