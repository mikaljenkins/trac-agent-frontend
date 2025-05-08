import { DriftScoreReport } from './symbolicDriftScorer';

export interface ChartDataPoint {
  timestamp: string;
  entropy: number;
  convergence: number;
  divergence: number;
  decayRate: number;
  dominantSymbols: string[];
}

export interface TrendLine {
  entropy: { x: string; y: number }[];
  convergence: { x: string; y: number }[];
  divergence: { x: string; y: number }[];
  decayRate: { x: string; y: number }[];
  dominantSymbols: { [key: string]: { x: string; y: number }[] };
}

/**
 * Transforms a drift report into chart-ready data points.
 * Formats timestamps and normalizes values for visualization.
 */
export function generateDriftChartData(report: DriftScoreReport): ChartDataPoint {
  return {
    timestamp: report.timestamp,
    entropy: calculateEntropy(report),
    convergence: report.convergence,
    divergence: report.divergence,
    decayRate: report.decayRate,
    dominantSymbols: report.dominantSymbols
  };
}

/**
 * Calculates symbolic entropy from drift metrics.
 * Higher entropy indicates more diverse/chaotic memory state.
 */
function calculateEntropy(report: DriftScoreReport): number {
  // Entropy increases with divergence and decreases with convergence
  const baseEntropy = (report.divergence - report.convergence + 1) / 2;
  
  // Adjust for decay rate (higher decay = higher entropy)
  return Math.min(1, Math.max(0, baseEntropy * (1 + report.decayRate) / 2));
}

/**
 * Formats a series of drift reports into trend lines for visualization.
 * Supports multi-week comparisons and symbol tracking.
 */
export function formatTrendLine(history: DriftScoreReport[]): TrendLine {
  const trendLine: TrendLine = {
    entropy: [],
    convergence: [],
    divergence: [],
    decayRate: [],
    dominantSymbols: {}
  };

  // Track all unique dominant symbols across history
  const allSymbols = new Set<string>();
  history.forEach(report => {
    report.dominantSymbols.forEach(symbol => allSymbols.add(symbol));
  });

  // Initialize symbol trend lines
  allSymbols.forEach(symbol => {
    trendLine.dominantSymbols[symbol] = [];
  });

  // Build trend lines from history
  history.forEach(report => {
    const dataPoint = generateDriftChartData(report);
    
    // Add main metrics
    trendLine.entropy.push({ x: dataPoint.timestamp, y: dataPoint.entropy });
    trendLine.convergence.push({ x: dataPoint.timestamp, y: dataPoint.convergence });
    trendLine.divergence.push({ x: dataPoint.timestamp, y: dataPoint.divergence });
    trendLine.decayRate.push({ x: dataPoint.timestamp, y: dataPoint.decayRate });

    // Track symbol dominance over time
    allSymbols.forEach(symbol => {
      const isDominant = dataPoint.dominantSymbols.includes(symbol);
      trendLine.dominantSymbols[symbol].push({
        x: dataPoint.timestamp,
        y: isDominant ? 1 : 0
      });
    });
  });

  return trendLine;
}

/**
 * Detects significant changes in drift patterns.
 * Returns alerts for convergence collapse or entropy surges.
 */
export function detectDriftAnomalies(history: DriftScoreReport[]): {
  convergenceCollapse: boolean;
  entropySurge: boolean;
  decaySpike: boolean;
} {
  if (history.length < 2) return {
    convergenceCollapse: false,
    entropySurge: false,
    decaySpike: false
  };

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  // Check for convergence collapse (sudden drop in convergence)
  const convergenceCollapse = 
    latest.convergence < 0.3 && 
    previous.convergence > 0.6;

  // Check for entropy surge (sudden increase in divergence)
  const entropySurge = 
    latest.divergence > 0.8 && 
    previous.divergence < 0.4;

  // Check for decay spike (sudden increase in decay rate)
  const decaySpike = 
    latest.decayRate > 0.8 && 
    previous.decayRate < 0.5;

  return {
    convergenceCollapse,
    entropySurge,
    decaySpike
  };
} 