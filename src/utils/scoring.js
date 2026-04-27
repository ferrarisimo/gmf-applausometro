const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Converte la loudness normalizzata in punteggio 0-100.
 */
const toScore = (value) => Math.round(clamp(value * 100, 0, 100));

/**
 * Calcola lo score finale dell'Indice Applausometro GMF.
 * Nota: non sono decibel reali, ma valori relativi alla calibrazione locale.
 */
export function calculateApplauseScore({
  normalizedFrames,
  threshold,
  sessionSeconds,
}) {
  if (!normalizedFrames.length) {
    return {
      score: 0,
      avgIntensity: 0,
      peakIntensity: 0,
      usefulDuration: 0,
      stability: 0,
    };
  }

  const avgIntensity =
    normalizedFrames.reduce((sum, value) => sum + value, 0) / normalizedFrames.length;
  const peakIntensity = Math.max(...normalizedFrames);

  const activeFrames = normalizedFrames.filter((value) => value > threshold);
  const usefulDuration = (activeFrames.length / normalizedFrames.length) * sessionSeconds;

  const mean = avgIntensity;
  const variance =
    normalizedFrames.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    normalizedFrames.length;
  const stdDev = Math.sqrt(variance);
  const stabilityRaw = clamp(1 - stdDev / Math.max(mean, 0.15), 0, 1);

  const avgIntensityScore = toScore(avgIntensity);
  const peakIntensityScore = toScore(peakIntensity);
  const durationScore = toScore(usefulDuration / sessionSeconds);
  const stabilityScore = toScore(stabilityRaw);

  const weightedScore =
    avgIntensityScore * 0.45 +
    peakIntensityScore * 0.2 +
    durationScore * 0.25 +
    stabilityScore * 0.1;

  return {
    score: clamp(Math.round(weightedScore), 0, 100),
    avgIntensity: avgIntensityScore,
    peakIntensity: peakIntensityScore,
    usefulDuration: Number(usefulDuration.toFixed(2)),
    stability: stabilityScore,
  };
}

export { clamp };
