import { z } from 'zod';

/**
 * Zod validation schema for a manual carbon ledger entry.
 */
export const CarbonLogSchema = z.object({
  category: z.enum(['food', 'transport', 'energy', 'corporate']),
  description: z.string().min(3, { message: 'Description must be at least 3 characters long' }).max(100),
  co2Amount: z.number().min(-10000).max(10000),
  source: z.string().min(2, { message: 'Source node is required' }).max(100),
  pointsEarned: z.number().int().nonnegative(),
});

/**
 * Zod validation schema for the multi-faceted Carbon Footprint Calculator.
 */
export const CarbonFootprintCalculatorSchema = z.object({
  // Transportation
  carMiles: z.number().nonnegative({ message: 'Car travel mileage must be 0 or positive' }),
  carEvState: z.boolean(),
  publicTransportMiles: z.number().nonnegative(),
  rideShareMiles: z.number().nonnegative(),
  
  // Energy
  householdElectricityKwh: z.number().nonnegative(),
  renewableEnergyPercent: z.number().min(0).max(100),
  fuelConsumptionGal: z.number().nonnegative(),
  
  // Travel
  domesticFlightsCount: z.number().int().nonnegative(),
  intlFlightsCount: z.number().int().nonnegative(),
  
  // Lifestyle
  meatConsumptionLevel: z.enum(['heavy', 'moderate', 'low', 'none']), // heavy meat, average, rare, vegan
  wasteBagCount: z.number().nonnegative(), // weekly garbage bags
});

export type CarbonFootprintInput = z.infer<typeof CarbonFootprintCalculatorSchema>;
export type CarbonLogInput = z.infer<typeof CarbonLogSchema>;
