import { ActionLog, ConnectionItem, EcosphereTree, SimulatorState } from './types';

export const INITIAL_ACTION_LOGS: ActionLog[] = [
  {
    id: 'log-1',
    date: '2026-06-12',
    category: 'transport',
    description: 'Switch commute to Electric Vehicle (EV Smart Charge)',
    co2Amount: -12.4, // savings of 12.4kg CO2
    pointsEarned: 120,
    source: 'Uber Business API',
    status: 'completed'
  },
  {
    id: 'log-2',
    date: '2026-06-12',
    category: 'food',
    description: 'Logged 3 consecutive fully plant-based meals (Vegan Menu)',
    co2Amount: -4.5,
    pointsEarned: 75,
    source: 'Food Log',
    status: 'completed'
  },
  {
    id: 'log-3',
    date: '2026-06-11',
    category: 'energy',
    description: 'Smart Thermostat setpoint setback (Eco mode 68°F to 65°F)',
    co2Amount: -8.1,
    pointsEarned: 90,
    source: 'PG&E Direct',
    status: 'completed'
  },
  {
    id: 'log-4',
    date: '2026-06-10',
    category: 'corporate',
    description: 'Chase Corporate Card: Purchased 4 pieces of Energy Star network equipment',
    co2Amount: -28.0,
    pointsEarned: 250,
    source: 'Chase Mastercard',
    status: 'calculated'
  },
  {
    id: 'log-5',
    date: '2026-06-08',
    category: 'transport',
    description: 'Office staff regional high-occupancy rail transport instead of flight',
    co2Amount: -145.0,
    pointsEarned: 600,
    source: 'Uber Business API',
    status: 'completed'
  },
  {
    id: 'log-6',
    date: '2026-06-07',
    category: 'energy',
    description: 'Office building floor 2 smart lighting system shutdown trigger',
    co2Amount: -32.8,
    pointsEarned: 300,
    source: 'PG&E Direct',
    status: 'completed'
  },
  {
    id: 'log-7',
    date: '2026-06-05',
    category: 'food',
    description: 'Disposed of 14 lbs organic kitchen scraps via biodigestion pile',
    co2Amount: -3.2,
    pointsEarned: 50,
    source: 'Food Log',
    status: 'completed'
  }
];

export const INITIAL_CONNECTIONS: ConnectionItem[] = [
  {
    id: 'conn-pge',
    name: 'PG&E Smart Meter API',
    type: 'utility',
    connected: true,
    lastSync: '10 Mins Ago',
    monthlySavingsProjected: 180,
    accountNumber: '•••• •••• 9410'
  },
  {
    id: 'conn-chase',
    name: 'Chase Mastercard Corporate',
    type: 'bank',
    connected: true,
    lastSync: '1 Hour Ago',
    monthlySavingsProjected: 240,
    accountNumber: '•••• •••• 3088'
  },
  {
    id: 'conn-uber',
    name: 'Uber Business & Logistics API',
    type: 'transport',
    connected: false,
    lastSync: 'Never',
    monthlySavingsProjected: 95,
    accountNumber: 'UB-BIZ-401'
  },
  {
    id: 'conn-plaid',
    name: 'Plaid Bank Aggregation',
    type: 'bank',
    connected: false,
    lastSync: 'Never',
    monthlySavingsProjected: 150,
    accountNumber: 'PL-LINK-219'
  }
];

export const DEFAULT_SIMULATOR: SimulatorState = {
  commuteMiles: 800,
  gridIntensity: 280, // g CO2 / kWh
  dietType: 'flexitarian',
  evState: false,
  solarState: false,
  heatPumpState: false
};

export const INITIAL_TREES: EcosphereTree[] = [
  {
    id: 'tree-1',
    species: 'Cypress',
    size: 1.1,
    plantedAt: '2026-06-01',
    x: 20,
    y: 8,
    hues: ['#047857', '#065f46', '#059669']
  },
  {
    id: 'tree-2',
    species: 'Oak',
    size: 1.3,
    plantedAt: '2026-06-03',
    x: 45,
    y: 12,
    hues: ['#0f766e', '#115e59', '#14b8a6']
  },
  {
    id: 'tree-3',
    species: 'Cherry Blossom',
    size: 0.95,
    plantedAt: '2026-06-08',
    x: 75,
    y: 10,
    hues: ['#db2777', '#be185d', '#f472b6']
  },
  {
    id: 'tree-4',
    species: 'Maple',
    size: 0.8,
    plantedAt: '2026-06-12',
    x: 90,
    y: 5,
    hues: ['#b91c1c', '#991b1b', '#f87171']
  }
];

export interface LibraryActionItem {
  id: string;
  name: string;
  co2Save: string;
  points: number;
  intensity: 'HIGH' | 'MED' | 'LOW';
  category: 'transport' | 'food' | 'energy' | 'corporate';
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGE';
  desc: string;
}

export const COMMMAND_LIBRARY_ACTIONS: LibraryActionItem[] = [
  {
    id: 'act-ev',
    name: 'EV Transition Protocol',
    co2Save: '380kg/mo',
    points: 400,
    intensity: 'HIGH',
    category: 'transport',
    difficulty: 'CHALLENGE',
    desc: 'Commit to full daily transport mileage via battery electric vehicles.'
  },
  {
    id: 'act-thermo',
    name: 'Smart HVAC Override',
    co2Save: '42kg/mo',
    points: 80,
    intensity: 'MED',
    category: 'energy',
    difficulty: 'EASY',
    desc: 'Integrate dynamic smart thermostat setbacks during peak demand cycles.'
  },
  {
    id: 'act-diet',
    name: 'Plant-Based Paradigm',
    co2Save: '120kg/mo',
    points: 150,
    intensity: 'HIGH',
    category: 'food',
    difficulty: 'MODERATE',
    desc: 'Adopt a vegan diet targeting no livestock agricultural methane footprints.'
  },
  {
    id: 'act-solar',
    name: 'Solar Array Deployment',
    co2Save: '290kg/mo',
    points: 500,
    intensity: 'HIGH',
    category: 'energy',
    difficulty: 'CHALLENGE',
    desc: 'Deploy net-metered rooftop solar photovoltaic microgeneration arrays.'
  },
  {
    id: 'act-cold',
    name: 'Cold-Water Wash Mode',
    co2Save: '18kg/mo',
    points: 40,
    intensity: 'LOW',
    category: 'energy',
    difficulty: 'EASY',
    desc: 'Lock washing machines to 15°C cycles bypassing electrical heating element fires.'
  }
];
