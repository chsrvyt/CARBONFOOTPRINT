import { describe, test, expect } from 'vitest';
import {
  calculateDailySavingsAvg,
  calculateNetDailyCO2,
  calculateBudgetTrajectoryDays,
  calculateYearBaseline,
  calculateSimulatedYearOffset
} from './calculations';

describe('Carbon ESG Calculations & Mathematical Models', () => {
  
  test('calculateDailySavingsAvg returns positive averaged savings rate', () => {
    const mockLogs = [
      { co2Amount: -10 }, // savings
      { co2Amount: -4 },  // savings
      { co2Amount: 5 },   // addition (should be ignored by savings)
      { co2Amount: -14 }  // savings
    ];
    // Sum of negative values absolute to 28. Averaged over 7 days = 4.
    expect(calculateDailySavingsAvg(mockLogs)).toBe(4);
  });

  test('calculateDailySavingsAvg returns 0 with empty logs list', () => {
    expect(calculateDailySavingsAvg([])).toBe(0);
  });

  test('calculateNetDailyCO2 reduces daily carbon gross according to savings threshold', () => {
    const mockLogs = [
      { co2Amount: -20 },
      { co2Amount: -30 }
    ];
    // savings sum is 50. divide by 10 = 5.
    // baseline is 34.2. 34.2 - 5 = 29.2.
    expect(calculateNetDailyCO2(mockLogs)).toBeCloseTo(29.2);
  });

  test('calculateNetDailyCO2 enforces minimum lower-bound safety rate', () => {
    const mockLogsList = [
      { co2Amount: -1000 } // massive saving
    ];
    // 34.2 - 100 = negative. Should be clamped to 2.1 minimum.
    expect(calculateNetDailyCO2(mockLogsList)).toBe(2.1);
  });

  test('calculateBudgetTrajectoryDays calculates days and clamps inside [1, 99]', () => {
    // 1200 / (10 * 3) = 1200 / 30 = 40 days
    expect(calculateBudgetTrajectoryDays(10)).toBe(40);

    // Very high net carbon output causes small days, clamped to 1
    expect(calculateBudgetTrajectoryDays(500)).toBe(1);

    // Zero or negative net carbon outputs clamp to max trajectory 99
    expect(calculateBudgetTrajectoryDays(0)).toBe(99);
    expect(calculateBudgetTrajectoryDays(-5)).toBe(99);
  });

  test('calculateYearBaseline decay factors are correct', () => {
    // Y0 = 5400
    expect(calculateYearBaseline(0)).toBe(5400);
    // Y4 = 5400 - 1000 = 4400
    expect(calculateYearBaseline(4)).toBe(4400);
    // Clamp at 1200
    expect(calculateYearBaseline(100)).toBe(1200);
  });

  test('calculateSimulatedYearOffset models solar, EV offsets and custom parameters', () => {
    // baseline for Y1: 5400 - 400 = 5000.
    // without EV or solar (multiplier = 1), default commute (800) and grid (280) -> offsets are both 0.
    // out: 5000
    expect(calculateSimulatedYearOffset(1, false, false, 800, 280)).toBe(5000);

    // With EV enabled (multiplier reduces by 15% -> 0.85)
    // 5000 * 0.85 = 4250
    expect(calculateSimulatedYearOffset(1, true, false, 800, 280)).toBe(4250);

    // With higher travel mileage (commuteOffset = (1000 - 800) * 1.2 = 240)
    // 5000 + 240 = 5240
    expect(calculateSimulatedYearOffset(1, false, false, 1000, 280)).toBe(5240);
  });
});
