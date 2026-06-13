/**
 * Core carbon ESG auditing and trajectory calculations for TerraFlow.
 * These are modularized for clean architecture, optimized rendering, and high-quality unit testing.
 */

interface Co2Log {
  co2Amount: number;
}

/**
 * Calculates current average daily savings from logs.
 * Sums only negative co2Amount values (which represent savings/off-sets).
 * Returns positive kg value of saving rate.
 */
export function calculateDailySavingsAvg(logs: Co2Log[]): number {
  if (!logs || logs.length === 0) return 0;
  const savingsSum = logs.reduce((sum, log) => sum + (log.co2Amount < 0 ? Math.abs(log.co2Amount) : 0), 0);
  return savingsSum / 7;
}

/**
 * Calculates current net output of carbon per day.
 * Starts with baseline of 34.2 kg/day, reduced progressively by daily savings index.
 * Minimum bound is 2.1 kg/day.
 */
export function calculateNetDailyCO2(logs: Co2Log[]): number {
  const baseLineCO2 = 34.2;
  const rawSavingsSum = logs.reduce((sum, log) => sum + (log.co2Amount < 0 ? Math.abs(log.co2Amount) : 0), 0);
  const currentSavings = rawSavingsSum / 10;
  return Math.max(2.1, baseLineCO2 - currentSavings);
}

/**
 * Calculates budget trajectory remaining days index.
 * Uses budget threshold formula scaled by net carbon daily run-rate.
 * Returns integer capped between 1 and 99.
 */
export function calculateBudgetTrajectoryDays(netCO2Val: number): number {
  if (netCO2Val <= 0) return 99;
  const days = Math.floor(1200 / (netCO2Val * 3));
  return Math.max(1, Math.min(99, days));
}

/**
 * Projects emissions baseline (Business-as-Usual scenario) for year coordinates.
 * Progressively decays base values by target factor.
 */
export function calculateYearBaseline(yearIdx: number): number {
  return Math.max(1200, 5400 - (yearIdx * 250));
}

/**
 * Projects mitigated scenario emissions based on interactive parameters.
 * Accounts for electric vehicle conversions, solar array setups, fleet travel mileage, and grid fuel intensity.
 */
export function calculateSimulatedYearOffset(
  yearIdx: number,
  simEv: boolean,
  simSolar: boolean,
  simCommute: number,
  simGrid: number
): number {
  const baseValue = 5400 - (yearIdx * 400);
  let savingMultiplier = 1;
  if (simEv) savingMultiplier -= 0.15;
  if (simSolar) savingMultiplier -= 0.20;
  
  const commuteOffset = (simCommute - 800) * 1.2;
  const gridOffset = (simGrid - 280) * 4.5;
  
  return Math.max(800, (baseValue * savingMultiplier) + commuteOffset + gridOffset);
}
