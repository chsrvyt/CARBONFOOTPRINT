/**
 * Core carbon ESG auditing and trajectory calculations for TerraFlow.
 * These are modularized for clean architecture, optimized rendering, and high-quality unit testing.
 */

import { CarbonFootprintInput } from './schemas';

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

export interface FootprintCalculationResult {
  transportEmissions: number;
  energyEmissions: number;
  travelEmissions: number;
  lifestyleEmissions: number;
  totalMonthly: number;
  totalAnnual: number;
  carbonScore: number;
  sustainabilityScore: number;
}

/**
 * Calculates detailed carbon footprint metrics based on the transportation,
 * energy, travel, and lifestyle metrics provided by the user.
 */
export function calculateCarbonFootprint(input: CarbonFootprintInput): FootprintCalculationResult {
  // Transportation
  const carEmissions = input.carMiles * (input.carEvState ? 0.08 : 0.404);
  const transitEmissions = input.publicTransportMiles * 0.14;
  const rideShareEmissions = input.rideShareMiles * 0.35;
  const transportEmissions = carEmissions + transitEmissions + rideShareEmissions;

  // Energy
  const electricityEmissions = input.householdElectricityKwh * 0.39 * (1.0 - input.renewableEnergyPercent / 100);
  const fuelEmissions = input.fuelConsumptionGal * 8.88;
  const energyEmissions = electricityEmissions + fuelEmissions;

  // Travel (Frequencies are monthly averages)
  const domesticFlightsEmissions = input.domesticFlightsCount * 220;
  const intlFlightsEmissions = input.intlFlightsCount * 850;
  const travelEmissions = domesticFlightsEmissions + intlFlightsEmissions;

  // Lifestyle
  let foodEmissions = 180; // default Moderate
  if (input.meatConsumptionLevel === 'heavy') foodEmissions = 280;
  else if (input.meatConsumptionLevel === 'low') foodEmissions = 110;
  else if (input.meatConsumptionLevel === 'none') foodEmissions = 55;

  const wasteEmissions = input.wasteBagCount * 4.2 * 4.3; // weekly bags to monthly emissions
  const lifestyleEmissions = foodEmissions + wasteEmissions;

  const totalMonthly = transportEmissions + energyEmissions + travelEmissions + lifestyleEmissions;
  const totalAnnual = totalMonthly * 12;

  // Carbon Score scale: higher emissions = lower score (1 to 100)
  // Standard benchmark: ~1000 kg a month is standard high emissions, 300 kg is very sustainable.
  const carbonScore = Math.max(1, Math.min(100, Math.round(100 - (totalMonthly / 15))));

  // Sustainability score rewards low emissions and deliberate mitigations
  let bonus = 0;
  if (input.carEvState) bonus += 10;
  if (input.renewableEnergyPercent >= 50) bonus += 15;
  if (input.meatConsumptionLevel === 'none' || input.meatConsumptionLevel === 'low') bonus += 10;
  const sustainabilityScore = Math.max(1, Math.min(100, carbonScore + bonus));

  return {
    transportEmissions,
    energyEmissions,
    travelEmissions,
    lifestyleEmissions,
    totalMonthly,
    totalAnnual,
    carbonScore,
    sustainabilityScore,
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  category: 'transport' | 'energy' | 'food' | 'corporate';
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGE';
  impact: 'LOW' | 'MED' | 'HIGH';
  co2Savings: number; // monthly kg saved
  description: string;
}

/**
 * Expert rules recommendation engine generating personalized offset tips.
 */
export function generateAIRecommendations(input: CarbonFootprintInput): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // EV Recommend
  if (input.carMiles > 100 && !input.carEvState) {
    recommendations.push({
      id: 'rec-ev',
      title: 'Initiate EV Transition Protocol',
      category: 'transport',
      difficulty: 'CHALLENGE',
      impact: 'HIGH',
      co2Savings: Math.round(input.carMiles * (0.404 - 0.08)),
      description: 'Convert daily car travel logs to battery electric options. Overcomes internal combustion thermal inefficiencies.'
    });
  }

  // Transit Recommend
  if (input.carMiles > 500) {
    recommendations.push({
      id: 'rec-transit',
      title: 'Integrate High Occupancy Rail',
      category: 'transport',
      difficulty: 'MODERATE',
      impact: 'HIGH',
      co2Savings: Math.round(input.carMiles * 0.20),
      description: 'Shift 20% of private car commutes to public subway or high-speed lines to optimize urban corridor density.'
    });
  }

  // Renewable Panel Recommend
  if (input.householdElectricityKwh > 150 && input.renewableEnergyPercent < 50) {
    recommendations.push({
      id: 'rec-solar',
      title: 'Deploy Grid-Tied Solar System',
      category: 'energy',
      difficulty: 'CHALLENGE',
      impact: 'HIGH',
      co2Savings: Math.round(input.householdElectricityKwh * 0.39 * 0.6),
      description: 'Install residential or facility solar arrays. Increases self-production ratios and caps utility bill reliance.'
    });
  }

  // Smart Thermostat setbacks
  if (input.householdElectricityKwh > 50) {
    recommendations.push({
      id: 'rec-thermostat',
      title: 'Smart Thermostat Vampire Setbacks',
      category: 'energy',
      difficulty: 'EASY',
      impact: 'LOW',
      co2Savings: 35,
      description: 'Schedule temperature drift ranges of 3°F during non-occupancy hours. Cuts active heat cycle spikes.'
    });
  }

  // Meat consume recommend
  if (input.meatConsumptionLevel === 'heavy' || input.meatConsumptionLevel === 'moderate') {
    recommendations.push({
      id: 'rec-diet',
      title: 'Shift to Plant-Based Routines',
      category: 'food',
      difficulty: 'MODERATE',
      impact: 'HIGH',
      co2Savings: 110,
      description: 'Replace heavy animal proteins with direct energy crop options, mitigating high agricultural methane emissions.'
    });
  }

  // Composting
  if (input.wasteBagCount > 1) {
    recommendations.push({
      id: 'rec-compost',
      title: 'Biogas Organic Composting',
      category: 'food',
      difficulty: 'EASY',
      impact: 'MED',
      co2Savings: Math.round(input.wasteBagCount * 4 * 1.8),
      description: 'Redirect organic compostables away from oxygen-depleted landfill sites into active aerobic composting loops.'
    });
  }

  // Flight cuts
  if (input.domesticFlightsCount > 0 || input.intlFlightsCount > 0) {
    const savings = Math.round((input.domesticFlightsCount * 220 + input.intlFlightsCount * 850) / 3);
    recommendations.push({
      id: 'rec-flights',
      title: 'Virtual Cooperation Protocols',
      category: 'corporate',
      difficulty: 'MODERATE',
      impact: 'HIGH',
      co2Savings: savings,
      description: 'Replace 1 out of 3 regional air meetings with unified virtual collaboration models, saving immediate jet fuel overhead.'
    });
  }

  // Fill in general backup if empty
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-backup',
      title: 'Fine-tune Equipment Power Factor',
      category: 'corporate',
      difficulty: 'EASY',
      impact: 'LOW',
      co2Savings: 15,
      description: 'Ensure all connected monitors, chargers, and servers operate under high efficiency and eco-certified settings.'
    });
  }

  return recommendations;
}
