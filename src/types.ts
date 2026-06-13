export interface ActionLog {
  id: string;
  date: string;
  category: 'food' | 'transport' | 'energy' | 'corporate';
  description: string;
  co2Amount: number; // in kg CO2
  pointsEarned: number;
  source: string; // "Food Log", "Chase Mastercard", "PG&E Direct", "Uber Business API", "Manual Log" etc.
  status: 'completed' | 'pending' | 'calculated';
}

export interface ConnectionItem {
  id: string;
  name: string;
  type: 'utility' | 'bank' | 'transport' | 'other';
  connected: boolean;
  lastSync: string;
  monthlySavingsProjected?: number; // kg CO2
  accountNumber?: string;
}

export interface SimulatorState {
  commuteMiles: number; // monthly
  gridIntensity: number; // g CO2/kWh
  dietType: 'omnivore' | 'flexitarian' | 'vegetarian' | 'vegan';
  evState: boolean; // switched to EV
  solarState: boolean; // solar panels active
  heatPumpState: boolean; // smart heating active
}

export interface EcosphereTree {
  id: string;
  species: 'Cypress' | 'Bonsai' | 'Cherry Blossom' | 'Oak' | 'Maple';
  size: number; // 0.6 to 1.5 multiplier
  plantedAt: string;
  x: number; // percentage width (5% - 95%)
  y: number; // percentage height bottom (0% - 20%)
  hues: string[]; // custom colors for rendering
  customName?: string;
}

export type WorkspaceModule = 'COMMAND' | 'ECOSPHERE' | 'GREENFLOW';
export type SubScreenCommand = 'DASHBOARD' | 'ACTIONS' | 'TELEMETRY';
export type SubScreenEcosphere = 'GROVE' | 'METRICS';
export type SubScreenGreenFlow = 'OVERVIEW' | 'CALCULATOR' | 'INGESTION' | 'LEDGER' | 'SIMULATOR' | 'REPORTING';
