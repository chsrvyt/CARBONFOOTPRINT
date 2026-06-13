import { describe, test, expect } from 'vitest';
import {
  calculateDailySavingsAvg,
  calculateNetDailyCO2,
  calculateBudgetTrajectoryDays,
  calculateYearBaseline,
  calculateSimulatedYearOffset,
  calculateCarbonFootprint,
  generateAIRecommendations
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

  // --- NEW FOOTPRINT CALCULATOR AND AI RECOMMENDATION TESTS ---
  test('calculateCarbonFootprint calculates detailed scores and categories accurately', () => {
    const input = {
      carMiles: 1000,
      carEvState: false,
      publicTransportMiles: 200,
      rideShareMiles: 100,
      householdElectricityKwh: 500,
      renewableEnergyPercent: 40,
      fuelConsumptionGal: 10,
      domesticFlightsCount: 2,
      intlFlightsCount: 1,
      meatConsumptionLevel: 'heavy' as const,
      wasteBagCount: 3
    };

    const res = calculateCarbonFootprint(input);

    // Transmissions breakdown:
    // Car mileage = 1000 * 0.404 = 404
    // Transit mileage = 200 * 0.14 = 28
    // Rideshare mileage = 100 * 0.35 = 35
    // transport = 467
    expect(res.transportEmissions).toBeCloseTo(467);

    // Energy:
    // Electricity = 500 * 0.39 * (1.0 - 0.40) = 195 * 0.60 = 117
    // Fuel = 10 * 8.88 = 88.8
    // energy = 205.8
    expect(res.energyEmissions).toBeCloseTo(205.8);

    // Travel:
    // Domestic = 2 * 220 = 440
    // Intl = 1 * 850 = 850
    // travel = 1290
    expect(res.travelEmissions).toBe(1290);

    // Lifestyle:
    // heavy meat = 280
    // waste = 3 * 4.2 * 4.3 = 54.18
    // lifestyle = 334.18
    expect(res.lifestyleEmissions).toBeCloseTo(334.18);

    // Total Monthly = 467 + 205.8 + 1290 + 334.18 = 2296.98
    expect(res.totalMonthly).toBeCloseTo(2296.98);

    // Carbon Score calculations: max(1, min(100, Math.round(100 - (totalMonthly / 15))))
    // 100 - (2296.98 / 15) = 100 - 153.13 = -53.13 -> Clamped to 1
    expect(res.carbonScore).toBe(1);
  });

  test('calculateCarbonFootprint awards behavior bonuses for EV and renewable shares', () => {
    const sampleInput = {
      carMiles: 0,
      carEvState: true, // +10 Bonus points
      publicTransportMiles: 0,
      rideShareMiles: 0,
      householdElectricityKwh: 100,
      renewableEnergyPercent: 80, // >= 50% yields +15 Bonus points
      fuelConsumptionGal: 0,
      domesticFlightsCount: 0,
      intlFlightsCount: 0,
      meatConsumptionLevel: 'none' as const, // Vegan yields +10 Bonus points
      wasteBagCount: 0
    };

    const result = calculateCarbonFootprint(sampleInput);
    // base emissions:
    // transport = 0
    // electricity = 100 * 0.39 * (1 - 0.8) = 100 * 0.39 * 0.2 = 7.8
    // fuel = 0 -> energy = 7.8
    // travel = 0
    // food = vegan = 55, waste = 0 -> lifestyle = 55
    // totalMonthly = 62.8
    // base carbonScore = 100 - 62.8/15 = 100 - 4 = 96
    // bonus = +10 (EV) + 15 (Solar) + 10 (Vegan) = +35
    // sustainabilityScore = min(100, 96 + 35) = 100
    expect(result.carbonScore).toBe(96);
    expect(result.sustainabilityScore).toBe(100);
  });

  test('generateAIRecommendations correctly reacts to resource vulnerabilities', () => {
    const input = {
      carMiles: 1200,
      carEvState: false, // high IC mileage triggers EV transition advice
      publicTransportMiles: 0,
      rideShareMiles: 0,
      householdElectricityKwh: 400,
      renewableEnergyPercent: 10, // low renewable triggers solar advice
      fuelConsumptionGal: 0,
      domesticFlightsCount: 0,
      intlFlightsCount: 1, // flight trigger virtual corporate advice
      meatConsumptionLevel: 'heavy' as const, // heavy meat triggers diet advisory
      wasteBagCount: 3 // solid waste trigger composting advice
    };

    const list = generateAIRecommendations(input);

    // Checks that high-impact topics are highlighted
    const evRec = list.find(r => r.id === 'rec-ev');
    const solarRec = list.find(r => r.id === 'rec-solar');
    const dietRec = list.find(r => r.id === 'rec-diet');

    expect(evRec).toBeDefined();
    expect(solarRec).toBeDefined();
    expect(dietRec).toBeDefined();

    expect(evRec?.category).toBe('transport');
    expect(evRec?.impact).toBe('HIGH');
    expect(solarRec?.category).toBe('energy');
  });
});
