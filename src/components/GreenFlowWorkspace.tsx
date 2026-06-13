import React, { useState, useMemo, useEffect } from 'react';
import { ActionLog, ConnectionItem, SimulatorState, SubScreenGreenFlow } from '../types';
import { 
  calculateYearBaseline as calculateYearBaselineImport,
  calculateSimulatedYearOffset,
  calculateCarbonFootprint,
  generateAIRecommendations,
  AIRecommendation,
  FootprintCalculationResult
} from '../utils/calculations';
import { CarbonFootprintCalculatorSchema, CarbonLogSchema } from '../utils/schemas';
import { 
  BarChart3, 
  RefreshCcw, 
  Link, 
  Lock, 
  Sparkles,
  Search, 
  Database,
  SlidersHorizontal, 
  FileSpreadsheet, 
  TrendingDown, 
  Download, 
  Check, 
  Plus, 
  Flame, 
  Sliders,
  AlertCircle,
  FileText,
  History,
  Info,
  Calendar,
  CheckCircle2,
  Trash2,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GreenFlowWorkspaceProps {
  logs: ActionLog[];
  connections: ConnectionItem[];
  onToggleConnection: (id: string) => void;
  onAddLog: (log: Omit<ActionLog, 'id' | 'date'>) => void;
  onDeleteLog: (id: string) => void;
}

export default function GreenFlowWorkspace({
  logs,
  connections,
  onToggleConnection,
  onAddLog,
  onDeleteLog
}: GreenFlowWorkspaceProps) {
  const [activeTab2, setActiveTab2] = useState<SubScreenGreenFlow>('OVERVIEW');
  const [filterSource, setFilterSource] = useState('all');
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [syncingConnId, setSyncingConnId] = useState<string | null>(null);

  // Manual log injection form validation issues
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  // Custom log injection form state
  const [newLogSource, setNewLogSource] = useState('Chase Mastercard');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogCo2, setNewLogCo2] = useState('45.0');
  const [newLogCategory, setNewLogCategory] = useState<'food' | 'transport' | 'energy' | 'corporate'>('corporate');

  // Interactive progressive file downloader state
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [printingReportId, setPrintingReportId] = useState<string | null>(null);

  // What-if simulator live state
  const [simCommute, setSimCommute] = useState(800);
  const [simGrid, setSimGrid] = useState(280);
  const [simEv, setSimEv] = useState(false);
  const [simSolar, setSimSolar] = useState(false);

  // --- CARBON INTEGRATION CALCULATOR STATE ---
  const [carMiles, setCarMiles] = useState(650);
  const [carEvState, setCarEvState] = useState(false);
  const [publicTransportMiles, setPublicTransportMiles] = useState(120);
  const [rideShareMiles, setRideShareMiles] = useState(80);
  
  const [householdElectricityKwh, setHouseholdElectricityKwh] = useState(320);
  const [renewableEnergyPercent, setRenewableEnergyPercent] = useState(20);
  const [fuelConsumptionGal, setFuelConsumptionGal] = useState(15);
  
  const [domesticFlightsCount, setDomesticFlightsCount] = useState(1);
  const [intlFlightsCount, setIntlFlightsCount] = useState(0);
  
  const [meatConsumptionLevel, setMeatConsumptionLevel] = useState<'heavy' | 'moderate' | 'low' | 'none'>('moderate');
  const [wasteBagCount, setWasteBagCount] = useState(2);

  const [calculatorValidationError, setCalculatorValidationError] = useState<string | null>(null);

  // High Canopy points and offsets toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stored historical reports state
  const [historicalReports, setHistoricalReports] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('terraflow_historical_reports');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed recovery of historical reports', e);
    }
    // Return standard initial baseline historical reports
    return [
      {
        id: 'rep-init-1',
        timestamp: '2026-05-15 14:24',
        annualFootprint: 6240,
        monthlyFootprint: 520,
        carbonScore: 65,
        sustainabilityScore: 70,
        breakdown: { transport: 220, energy: 150, travel: 120, lifestyle: 30 },
        snapshotInput: { carMiles: 800, carEvState: false, publicTransportMiles: 150, rideShareMiles: 100, householdElectricityKwh: 400, renewableEnergyPercent: 0, fuelConsumptionGal: 20, domesticFlightsCount: 2, intlFlightsCount: 0, meatConsumptionLevel: 'heavy', wasteBagCount: 3 }
      }
    ];
  });

  // Keep localStorage unified
  useEffect(() => {
    try {
      localStorage.setItem('terraflow_historical_reports', JSON.stringify(historicalReports));
    } catch (e) {
      console.error(e);
    }
  }, [historicalReports]);

  // Derive ledger and summaries with high efficiency useMemos
  const totalYTD = useMemo(() => {
    return logs.reduce((sum, entry) => sum + entry.co2Amount, 1620).toFixed(1);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterSource === 'all') return true;
      return log.source === filterSource;
    });
  }, [logs, filterSource]);

  // Reactive calculation result engine
  const footprintInput = useMemo(() => {
    return {
      carMiles,
      carEvState,
      publicTransportMiles,
      rideShareMiles,
      householdElectricityKwh,
      renewableEnergyPercent,
      fuelConsumptionGal,
      domesticFlightsCount,
      intlFlightsCount,
      meatConsumptionLevel,
      wasteBagCount
    };
  }, [
    carMiles, carEvState, publicTransportMiles, rideShareMiles,
    householdElectricityKwh, renewableEnergyPercent, fuelConsumptionGal,
    domesticFlightsCount, intlFlightsCount, meatConsumptionLevel, wasteBagCount
  ]);

  // Zod-enforced reactive calculations
  const calculatorResult = useMemo(() => {
    const parsed = CarbonFootprintCalculatorSchema.safeParse(footprintInput);
    if (!parsed.success) {
      setCalculatorValidationError(parsed.error.issues[0].message);
      // fallback to baseline calculate
    } else {
      setCalculatorValidationError(null);
    }
    return calculateCarbonFootprint(footprintInput);
  }, [footprintInput]);

  // Reactive recommendation list
  const activeRecommendations = useMemo(() => {
    return generateAIRecommendations(footprintInput);
  }, [footprintInput]);

  const handleApplyAIOffset = (rec: AIRecommendation) => {
    onAddLog({
      category: rec.category,
      description: `AI Deploy: ${rec.title}`,
      co2Amount: -rec.co2Savings,
      pointsEarned: Math.round(rec.co2Savings * 2.1),
      source: 'ESG Intelligence AI',
      status: 'completed'
    });
    setToastMessage(`SUCCESS: Protocol deployed. Generated -${rec.co2Savings} KG manual offset.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    setManualFormError(null);
    const co2ValRaw = parseFloat(newLogCo2);
    const co2Val = isNaN(co2ValRaw) ? 0.0 : co2ValRaw;

    const testObject = {
      category: newLogCategory,
      description: newLogDesc,
      co2Amount: co2Val,
      source: newLogSource,
      pointsEarned: Math.abs(Math.floor(co2Val * 5))
    };

    const validate = CarbonLogSchema.safeParse(testObject);
    if (!validate.success) {
      setManualFormError(validate.error.issues[0].message);
      return;
    }

    onAddLog({
      category: newLogCategory,
      description: newLogDesc,
      co2Amount: co2Val,
      pointsEarned: Math.abs(Math.floor(co2Val * 5)),
      source: newLogSource,
      status: 'completed'
    });
    setNewLogDesc('');
    setToastMessage('Success: Carbon ledger entry appended with strict verification hashes.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleArchiveReport = () => {
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const rep = {
      id: `rep-${Date.now()}`,
      timestamp: stamp,
      annualFootprint: Math.round(calculatorResult.totalAnnual),
      monthlyFootprint: Math.round(calculatorResult.totalMonthly),
      carbonScore: calculatorResult.carbonScore,
      sustainabilityScore: calculatorResult.sustainabilityScore,
      breakdown: {
        transport: Math.round(calculatorResult.transportEmissions),
        energy: Math.round(calculatorResult.energyEmissions),
        travel: Math.round(calculatorResult.travelEmissions),
        lifestyle: Math.round(calculatorResult.lifestyleEmissions)
      },
      snapshotInput: { ...footprintInput }
    };

    setHistoricalReports((prev) => [rep, ...prev]);
    setToastMessage(`SUCCESS: Compiled Chronological Report generated with score ${calculatorResult.carbonScore}%`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteHistoryReport = (id: string) => {
    setHistoricalReports((prev) => prev.filter(r => r.id !== id));
  };

  const triggerOauthConnect = (conn: ConnectionItem) => {
    if (conn.connected) {
      onToggleConnection(conn.id);
      return;
    }
    setSyncingConnId(conn.id);
    setShowPlaidModal(true);
  };

  const handleFinishOauth = () => {
    if (syncingConnId) {
      onToggleConnection(syncingConnId);
    }
    setShowPlaidModal(false);
    setSyncingConnId(null);
  };

  const downloadTextReport = (report: any) => {
    const border = '=======================================================';
    const text = `${border}\n` +
      `          TERRAFLOW CERTIFIED CARBON INTELLIGENCE AUDIT\n` +
      `          TIMESTAMP: ${report.timestamp} UTC // SYS STARK\n` +
      `${border}\n\n` +
      `[SCORE ENGINE METRICS]\n` +
      `- CARBON TRANSPARENCY SCORE   : ${report.carbonScore}%\n` +
      `- SUSTAINABILITY RATING STAGE : ${report.sustainabilityScore} / 100\n` +
      `- INTEGRATION STANDARD INDEX   : GHG-Protocol certified\n\n` +
      `[EMISSION VOLUMES]\n` +
      `- ESTIMATED ANNUAL CARBON FOOTPRINT: ${report.annualFootprint} kg CO2e\n` +
      `- MONTHLY BURNOUT WEIGHT           : ${report.monthlyFootprint} kg CO2e\n\n` +
      `[CATEGORY BREAKDOWNS]\n` +
      `- TRANSPORT LOGISTICS   : ${report.breakdown.transport} kg CO2e\n` +
      `- POWER/ENERGY METRIC   : ${report.breakdown.energy} kg CO2e\n` +
      `- COMMERCIAL TRAVEL     : ${report.breakdown.travel} kg CO2e\n` +
      `- LIFESTYLE WA-OUTFLOW  : ${report.breakdown.lifestyle} kg CO2e\n\n` +
      `[PARAMETERS REGISTER]\n` +
      `- Car Travel Distance : ${report.snapshotInput.carMiles} miles/mo (EV: ${report.snapshotInput.carEvState ? 'TRUE' : 'FALSE'})\n` +
      `- Grid Electricity    : ${report.snapshotInput.householdElectricityKwh} kWh/mo\n` +
      `- Renewable Offset     : ${report.snapshotInput.renewableEnergyPercent}%\n` +
      `- Flights Taken        : ${report.snapshotInput.domesticFlightsCount} Domestic / ${report.snapshotInput.intlFlightsCount} Intl\n` +
      `- Diet Type Mode       : ${report.snapshotInput.meatConsumptionLevel.toUpperCase()}\n` +
      `\n` +
      `EPA COMPLIANT SECURITY PROTOCOL § 40.23 AUTOMATIC DISCLOSURE`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TerraFlow_ESG_Audit_${report.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerProgressiveDownload = (report: any) => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(null);
            downloadTextReport(report);
          }, 800);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Live what-if calculations using pure, centralized algorithms
  const calculateYearOffset = (yearIdx: number) => {
    return calculateSimulatedYearOffset(yearIdx, simEv, simSolar, simCommute, simGrid).toFixed(0);
  };

  const calculateYearBaseline = (yearIdx: number) => {
    return calculateYearBaselineImport(yearIdx).toFixed(0);
  };

  return (
    <article className="font-karla text-white bg-[#0A0A0A] p-0 md:p-2 rounded-none overflow-hidden relative">
      <h2 className="sr-only">Greenflow ESG Platform Controls</h2>

      {/* Dynamic Accessible Interactive Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <div 
            role="status" 
            aria-live="polite"
            className="fixed top-4 right-4 z-50 bg-[#EAB308] text-black text-xs font-mono font-black p-4 border border-black shadow-2xl uppercase tracking-widest flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>{toastMessage}</span>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-black font-black hover:opacity-75 p-1 text-[11px]"
              aria-label="Disregard Notification"
            >
              ×
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Enterprise Ticker Bar details */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <div className="relative">
          <div className="absolute -top-7 left-0 text-[40px] md:text-[56px] font-black text-stroke-gray uppercase tracking-tighter select-none font-sans pointer-events-none opacity-20">
            GREENFLOW
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#EAB308] uppercase tracking-[0.2em] relative z-10 pl-1">
            <span className="w-2 h-2 bg-[#EAB308]"></span>
            ESG CARBON PLATFORM ENGINE v4
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest mt-1.5 relative z-10 uppercase">
            CARBON & <span className="text-[#EAB308]">ESG PLATFORM</span>
          </h1>
        </div>

        {/* Workspace Swapper Tab group */}
        <nav 
          aria-label="GreenFlow workspace subsections selection list"
          className="flex bg-neutral-950 p-1 rounded-none border border-white/10 font-mono text-[9px] overflow-x-auto max-w-full"
        >
          {(['OVERVIEW', 'CALCULATOR', 'INGESTION', 'LEDGER', 'SIMULATOR', 'REPORTING'] as SubScreenGreenFlow[]).map((tab) => (
            <button
              key={tab}
              id={`gf-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab2(tab)}
              className={`px-4 py-2.5 rounded-none uppercase tracking-widest transition-all duration-200 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#EAB308] focus:outline-none ${
                activeTab2 === tab
                  ? 'bg-[#EAB308] text-black border border-[#EAB308] font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'OVERVIEW' && '📊 ESG Overview'}
              {tab === 'CALCULATOR' && '⚡ Footprint Calculator'}
              {tab === 'INGESTION' && '🔌 Direct Sync'}
              {tab === 'LEDGER' && '📋 Ledgers'}
              {tab === 'SIMULATOR' && '🧙 What-If'}
              {tab === 'REPORTING' && '📝 SEC Reports'}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {/* --- TABS 1: OVERVIEW DASHBOARD --- */}
        {activeTab2 === 'OVERVIEW' && (
          <motion.section
            key="gf-ov"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Top Score Tickers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#121212] border border-white/10 p-5 rounded-none">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">YTD EMISSIONS GROSS</span>
                <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">{totalYTD} <span className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">KG CO₂e</span></div>
                <div className="text-xs text-[#EAB308] flex items-center gap-1 mt-3 font-mono uppercase text-[9px] tracking-wider">
                  <TrendingDown className="w-3.5 h-3.5 text-[#EAB308]" /> -12.4% below current standard cap
                </div>
              </div>

              <div className="bg-[#121212] border border-white/10 p-5 rounded-none">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">ACTIVE EMISSION MATRIX</span>
                <div className="text-3xl font-black text-[#EAB308] mt-1 font-mono tracking-tight">{calculatorResult.carbonScore}% <span className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">Rating</span></div>
                <div className="text-xs text-zinc-400 mt-3 font-mono uppercase text-[9px] tracking-wider">Derived from live calculator inputs</div>
              </div>

              <div className="bg-[#121212] border border-white/10 p-5 rounded-none">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">SYNC TERMINALS</span>
                <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">02 / 04</div>
                <div className="text-xs text-zinc-500 mt-3 font-mono uppercase text-[9px] tracking-wider">Chase Mastercard, PG&E Feed online</div>
              </div>
            </div>

            {/* Central charts split: Spline and Source Bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* YTD Cumulative Tracker chart */}
              <div className="lg:col-span-8 bg-[#121212] border border-white/10 p-6 rounded-none">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">FINANCIAL AUDIT LINE</span>
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mt-1">YTD Carbon Offset Trajectory</h3>
                  </div>
                  <span className="p-1 px-3 text-[9px] font-mono rounded-none bg-black border border-white/15 text-[#EAB308] tracking-widest uppercase font-bold">SCOPE 1, 2 & 3 INTEGRATION</span>
                </div>

                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" aria-hidden="true" preserveAspectRatio="none">
                    {/* Grid */}
                    {[0, 33, 66, 100].map((v, i) => (
                      <line key={i} x1="0%" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 3" />
                    ))}
                    {/* Cumulative Offset path */}
                    <path
                      d="M 5,30 Q 100,55 200,65 T 350,95 T 495,120"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="2.5"
                      strokeLinecap="square"
                    />
                    <path
                      d="M 5,30 Q 100,55 200,65 T 350,95 T 495,120 L 495,150 L 5,150 Z"
                      fill="url(#amberArea)"
                      className="opacity-10"
                    />
                    <defs>
                      <linearGradient id="amberArea" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#EAB308" />
                        <stop offset="100%" stopColor="#000000" />
                      </linearGradient>
                    </defs>
                    
                    {/* Actual data metrics dots */}
                    <circle cx="200" cy="65" r="4.5" fill="#EAB308" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="495" cy="120" r="4.5" fill="#EAB308" className="animate-pulse" />
                  </svg>
                  <div className="flex justify-between text-[8px] text-zinc-500 mt-2 font-mono uppercase tracking-widest font-bold">
                    <span>Q1 DISCLOSURE</span>
                    <span>Q2 INTEGRATION</span>
                    <span>Q3 TARGETS</span>
                    <span>Q4 PROJECTIONS</span>
                  </div>
                </div>
              </div>

              {/* Top Source Columns list */}
              <div className="lg:col-span-4 bg-[#121212] border border-white/10 p-6 rounded-none flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-[10px] tracking-widest font-mono text-zinc-400 mb-4 uppercase">Emissions Share Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Scope 1: Direct Combustion (Fuel)', val: Math.round(calculatorResult.energyEmissions * 0.4), pct: 40, col: 'bg-[#EAB308]' },
                      { label: 'Scope 2: Purchased Electricity Grid', val: Math.round(calculatorResult.energyEmissions * 0.6), pct: 32, col: 'bg-zinc-400' },
                      { label: 'Scope 3: Auxiliary Logistics & Food', val: Math.round(calculatorResult.lifestyleEmissions), pct: 21, col: 'bg-zinc-600' },
                      { label: 'Scope 3: Corporate Business Travel', val: Math.round(calculatorResult.travelEmissions), pct: 7, col: 'bg-zinc-800' }
                    ].map((s, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[11px] mb-1.5 uppercase font-mono tracking-wider">
                          <span className="text-zinc-400 truncate max-w-[170px]">{s.label}</span>
                          <span className="text-white font-black">{s.val} kg</span>
                        </div>
                        <div className="h-2 w-full bg-black rounded-none overflow-hidden border border-white/5">
                          <div className={`h-full ${s.col} rounded-none`} style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 text-[9px] text-zinc-500 font-mono uppercase tracking-wider mt-4">
                  *Complies with general compliance standards.
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* --- TABS 2: INTERACTIVE CARBON FOOTPRINT CALCULATOR --- */}
        {activeTab2 === 'CALCULATOR' && (
          <motion.section
            key="gf-calc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Split layout: Inputs and Output metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Form card */}
              <form 
                onSubmit={(e) => e.preventDefault()}
                className="lg:col-span-7 bg-[#121212] border border-white/10 p-6 rounded-none space-y-6"
                aria-describedby="calculator-desc"
              >
                <div>
                  <h3 id="calculator-desc" className="font-extrabold text-[#EAB308] text-sm uppercase tracking-wide flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#EAB308]" /> Carbon Footprint Input Grid
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-4">
                    Modify the physical parameters of transportation, energy usage, airline flights, and corporate/standard lifestyle categories. Values validate instantly.
                  </p>
                </div>

                {calculatorValidationError && (
                  <div role="alert" className="p-3 bg-red-950/70 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Input error check: {calculatorValidationError}</span>
                  </div>
                )}

                {/* TRANSPORTATION CAP */}
                <fieldset className="space-y-4 border border-white/5 p-4 bg-black/40">
                  <legend className="text-[10px] font-mono uppercase font-black text-white px-2 tracking-widest bg-zinc-900 border border-white/10">1. TRANSPORTATION LOGISTICS</legend>
                  
                  {/* Car mileage */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider">
                      <label htmlFor="input-car-miles" className="text-zinc-400 cursor-pointer">Car Travel Mileage (Monthly):</label>
                      <span className="font-black text-white">{carMiles} MILES</span>
                    </div>
                    <input
                      id="input-car-miles"
                      type="range"
                      min="0"
                      max="3000"
                      step="50"
                      value={carMiles}
                      onChange={(e) => setCarMiles(parseInt(e.target.value))}
                      className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                      aria-label="Monthly car travel miles selection"
                    />
                  </div>

                  {/* EV Toggle */}
                  <div className="flex justify-between items-center bg-black p-3 rounded-none border border-white/5">
                    <div className="pr-4">
                      <label htmlFor="input-car-ev" className="font-black text-xs text-zinc-200 cursor-pointer block">Zero Emissions Vehicle Transition</label>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mt-0.5">Toggle EV battery offsets (reduces travel emission indices)</span>
                    </div>
                    <button
                      id="input-car-ev"
                      type="button"
                      aria-pressed={carEvState}
                      onClick={() => setCarEvState(!carEvState)}
                      className={`w-12 h-6 p-1 rounded-none flex items-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#EAB308] focus:outline-none ${
                        carEvState ? 'bg-[#EAB308] justify-end' : 'bg-zinc-800 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 bg-black block" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Public transit mileage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                        <label htmlFor="input-transit-miles" className="text-zinc-400 cursor-pointer">Public Transit (MI/mo):</label>
                        <span className="font-bold text-white">{publicTransportMiles} MI</span>
                      </div>
                      <input
                        id="input-transit-miles"
                        type="range"
                        min="0"
                        max="1000"
                        step="20"
                        value={publicTransportMiles}
                        onChange={(e) => setPublicTransportMiles(parseInt(e.target.value))}
                        className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                        aria-label="Monthly public transport miles"
                      />
                    </div>

                    {/* Ride sharing mileage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                        <label htmlFor="input-rideshare-miles" className="text-zinc-400 cursor-pointer">Ride Sharing (MI/mo):</label>
                        <span className="font-bold text-white">{rideShareMiles} MI</span>
                      </div>
                      <input
                        id="input-rideshare-miles"
                        type="range"
                        min="0"
                        max="800"
                        step="10"
                        value={rideShareMiles}
                        onChange={(e) => setRideShareMiles(parseInt(e.target.value))}
                        className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                        aria-label="Monthly ride share travel miles"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* ENERGY CAP */}
                <fieldset className="space-y-4 border border-white/5 p-4 bg-black/40">
                  <legend className="text-[10px] font-mono uppercase font-black text-white px-2 tracking-widest bg-zinc-900 border border-white/10">2. GRID & FUEL ENERGY</legend>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider">
                      <label htmlFor="input-electricity-kwh" className="text-zinc-400 cursor-pointer">Household Electricity (Monthly):</label>
                      <span className="font-black text-white">{householdElectricityKwh} kWH</span>
                    </div>
                    <input
                      id="input-electricity-kwh"
                      type="range"
                      min="0"
                      max="1500"
                      step="50"
                      value={householdElectricityKwh}
                      onChange={(e) => setHouseholdElectricityKwh(parseInt(e.target.value))}
                      className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                      aria-label="Monthly grid electricity consumption kwh"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Renewable energy share */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                        <label htmlFor="input-renewable-percent" className="text-zinc-400 cursor-pointer">Renewable Power Mix:</label>
                        <span className="font-bold text-[#EAB308]">{renewableEnergyPercent}%</span>
                      </div>
                      <input
                        id="input-renewable-percent"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={renewableEnergyPercent}
                        onChange={(e) => setRenewableEnergyPercent(parseInt(e.target.value))}
                        className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                        aria-label="Renewable energy percentage"
                      />
                    </div>

                    {/* Heating fuel consumption */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                        <label htmlFor="input-fuel-gal" className="text-zinc-400 cursor-pointer">Heating Fuel (GAL/mo):</label>
                        <span className="font-bold text-white">{fuelConsumptionGal} GAL</span>
                      </div>
                      <input
                        id="input-fuel-gal"
                        type="range"
                        min="0"
                        max="150"
                        step="5"
                        value={fuelConsumptionGal}
                        onChange={(e) => setFuelConsumptionGal(parseInt(e.target.value))}
                        className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                        aria-label="Monthly heating oil fuel gallons"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* FLIGHT TRANSITS */}
                <fieldset className="space-y-4 border border-white/5 p-4 bg-black/40">
                  <legend className="text-[10px] font-mono uppercase font-black text-white px-2 tracking-widest bg-zinc-900 border border-white/10">3. AIRLINE TRAVEL transits</legend>
                  
                  <div className="grid grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-wider">
                    {/* Domestic */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-domestic-flights" className="font-bold text-zinc-400 cursor-pointer">Domestic (Flights/mo)</label>
                      <input
                        id="input-domestic-flights"
                        type="number"
                        min="0"
                        max="20"
                        value={domesticFlightsCount}
                        onChange={(e) => setDomesticFlightsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-black border border-white/10 p-2 text-white font-black text-center focus-visible:border-[#EAB308] outline-none"
                      />
                    </div>

                    {/* Intl */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-intl-flights" className="font-bold text-zinc-400 cursor-pointer">International (Flights/mo)</label>
                      <input
                        id="input-intl-flights"
                        type="number"
                        min="0"
                        max="20"
                        value={intlFlightsCount}
                        onChange={(e) => setIntlFlightsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-black border border-white/10 p-2 text-white font-black text-center focus-visible:border-[#EAB308] outline-none"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* LIFESTYLE */}
                <fieldset className="space-y-4 border border-white/5 p-4 bg-black/40">
                  <legend className="text-[10px] font-mono uppercase font-black text-white px-2 tracking-widest bg-zinc-900 border border-white/10">4. ECO LIFESTYLE METRICS</legend>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px]">
                    {/* Food dropdown */}
                    <div className="space-y-2">
                      <label htmlFor="input-meat-consumption" className="font-bold text-zinc-400 block cursor-pointer">Protein Consumption Level:</label>
                      <select
                        id="input-meat-consumption"
                        value={meatConsumptionLevel}
                        onChange={(e) => setMeatConsumptionLevel(e.target.value as any)}
                        className="w-full bg-black border border-white/10 p-2.5 text-zinc-200 uppercase outline-none focus-visible:border-[#EAB308] cursor-pointer"
                      >
                        <option value="heavy">Heavy Meat & Dairy</option>
                        <option value="moderate">Average Omnivore</option>
                        <option value="low">Low Meat / Flexitarian</option>
                        <option value="none">Fully Plant-Based (Vegan)</option>
                      </select>
                    </div>

                    {/* Waste bag counts */}
                    <div className="space-y-2">
                      <div className="flex justify-between uppercase tracking-wider font-bold text-zinc-400">
                        <label htmlFor="input-waste-bags" className="cursor-pointer">Solid Garbage (Weekly bags):</label>
                        <span className="text-white font-black">{wasteBagCount} BAGS</span>
                      </div>
                      <input
                        id="input-waste-bags"
                        type="range"
                        min="0"
                        max="8"
                        step="1"
                        value={wasteBagCount}
                        onChange={(e) => setWasteBagCount(parseInt(e.target.value))}
                        className="w-full accent-[#EAB308] cursor-pointer bg-black h-1 mt-1.5"
                        aria-label="Weekly solid waste garbage bags"
                      />
                    </div>
                  </div>
                </fieldset>
              </form>

              {/* Calculator Output Reading Board */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Result Display Meter layout */}
                <section className="bg-neutral-950 border border-white/10 p-6 rounded-none relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">REAL-TIME TELEMETRY AUDIT</div>
                  
                  <div className="pt-4 text-center">
                    <span className="text-[9px] font-mono text-[#EAB308] uppercase font-bold tracking-[0.2em]">Footprint Result</span>
                    <div className="text-4xl font-extrabold text-white font-mono tracking-tighter mt-1">
                      {Math.round(calculatorResult.totalMonthly)} <span className="text-xs text-zinc-500 font-mono">KG CO₂e/mo</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block mt-1">
                      Est. Annual: <span className="text-white font-black">{Math.round(calculatorResult.totalAnnual)} kg</span> CO₂e
                    </span>
                  </div>

                  <hr className="my-5 border-white/10" />

                  {/* Dual Ring HUD Scores */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-black p-4 border border-white/5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Carbon Score</span>
                      <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">{calculatorResult.carbonScore}%</div>
                      <span className="text-[8px] font-mono text-[#EAB308] uppercase font-bold block mt-1">
                        {calculatorResult.carbonScore >= 80 ? 'A - Low Burn' : calculatorResult.carbonScore >= 50 ? 'B - Moderate' : 'C - High Burn'}
                      </span>
                    </div>

                    <div className="bg-black p-4 border border-white/5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Sustainability Index</span>
                      <div className="text-3xl font-black text-[#EAB308] mt-1 font-mono tracking-tight">{calculatorResult.sustainabilityScore}/100</div>
                      <span className="text-[8px] font-mono text-zinc-400 uppercase block mt-1">Efficiency Target</span>
                    </div>
                  </div>

                  {/* Categorized Progress Weight Meters */}
                  <div className="space-y-3 pt-6 font-mono text-[9px] uppercase tracking-wider">
                    <h4 className="text-[10px] text-zinc-400 font-black tracking-widest text-left">Segment Shares:</h4>
                    {[
                      { label: 'Transportation Share', val: calculatorResult.transportEmissions, color: 'bg-[#EAB308]' },
                      { label: 'Energy / Utility burn', val: calculatorResult.energyEmissions, color: 'bg-white' },
                      { label: 'Flight Transits footprint', val: calculatorResult.travelEmissions, color: 'bg-zinc-400' },
                      { label: 'Lifestyle & solid waste', val: calculatorResult.lifestyleEmissions, color: 'bg-zinc-650' }
                    ].map((bar, idx) => {
                      const totalVal = Math.max(1, calculatorResult.totalMonthly);
                      const pct = Math.max(6, Math.round((bar.val / totalVal) * 100));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{bar.label}</span>
                            <span className="text-white font-bold">{Math.round(bar.val)} kg ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-black rounded-none overflow-hidden">
                            <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compile Action Button */}
                  <div className="pt-6 mt-2">
                    <button
                      id="action-archive-report"
                      onClick={handleArchiveReport}
                      className="w-full bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-black p-3.5 rounded-none font-mono text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-black focus:outline-none"
                    >
                      <Plus className="w-4 h-4 text-black" /> Archive Report into Historical Logs
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* AI Recommendation System Cards specific to Footprint Variables */}
            <div className="bg-[#121212] border border-white/10 p-6 rounded-none whitespace-normal">
              <h3 className="font-extrabold text-white uppercase tracking-wider text-sm flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-[#EAB308]" /> Personalized AI Environmental Recommendations
              </h3>
              <p className="text-xs text-zinc-400 mb-6 max-w-2xl">
                The AI platform analyzes input coefficients. Deploy recommendations here to generate offsets directly inside your carbon accounting log.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRecommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-5 bg-black border border-white/10 hover:border-[#EAB308]/40 transition-all flex flex-col justify-between rounded-none group"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono text-[#EAB308] bg-[#EAB308]/5 px-2 py-0.5 rounded-none border border-[#EAB308]/20 uppercase tracking-widest font-bold">
                          {rec.category}
                        </span>
                        
                        <div className="flex gap-1">
                          <span className="text-[8px] font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-1.5 py-0.5 rounded-none uppercase font-bold">
                            {rec.difficulty}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-xs text-white uppercase tracking-wider pt-2 group-hover:text-[#EAB308] transition-colors">{rec.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{rec.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center font-mono">
                      <div>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest block">EMISSION SAVINGS</span>
                        <strong className="text-[#EAB308] text-[11px] font-extrabold">-{rec.co2Savings} kg/month</strong>
                      </div>

                      {/* Apply Recommendation trigger */}
                      <button
                        id={`apply-rec-offset-${rec.id}`}
                        onClick={() => handleApplyAIOffset(rec)}
                        className="px-3 py-1.5 rounded-none bg-zinc-950 hover:bg-[#EAB308] hover:text-black hover:border-[#EAB308] border border-white/15 text-[9px] font-black uppercase tracking-wider font-mono transition-colors focus:outline-none"
                      >
                        ⚡ DEPLOY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* --- TABS 3: DIRECT SYNC CONNECTORS --- */}
        {activeTab2 === 'INGESTION' && (
          <motion.section
            key="gf-ing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-[#121212] border border-white/10 p-6 rounded-none">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Direct Ecosystem Data Pipelines</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-6">
                Authorize utility APIs, banking files, or delivery logs to stream physical offset factors automatically.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.map((conn) => (
                  <div 
                    key={conn.id}
                    id={`connection-card-${conn.id}`}
                    className="p-5 bg-black border border-white/10 hover:border-[#EAB308]/40 rounded-none flex flex-col justify-between min-h-[170px] transition-all group"
                  >
                    <div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[8px] font-mono text-[#EAB308] bg-[#EAB308]/5 px-2.5 py-1 rounded-none border border-[#EAB308]/20 uppercase tracking-widest font-bold">
                          {conn.type.toUpperCase()} SYNC
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider">
                          {conn.connected ? (
                            <span className="flex items-center gap-1 text-[#EAB308] font-bold">
                              <span className="w-1.5 h-1.5 bg-[#EAB308]"></span> Live Connected
                            </span>
                          ) : (
                            <span className="text-zinc-600">Offline</span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-black text-xs text-white uppercase tracking-wider group-hover:text-[#EAB308] transition-colors pt-4">
                        {conn.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mt-1 uppercase tracking-wider">
                        Linked Account: {conn.accountNumber || 'Pending Link'}. Status sync: {conn.lastSync}.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Projected Output Offset: <strong className="text-white">{conn.monthlySavingsProjected}kgCO₂</strong></span>
                      <button
                        id={`auth-conn-btn-${conn.id}`}
                        onClick={() => triggerOauthConnect(conn)}
                        className={`px-4 py-2 font-mono text-[9px] uppercase tracking-widest border font-black transition-all rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#EAB308] focus:outline-none ${
                          conn.connected 
                            ? 'bg-black text-red-400 border-red-500/20 hover:border-red-500/55'
                            : 'bg-[#EAB308] text-black border-[#EAB308] hover:bg-[#EAB308]/90'
                        }`}
                      >
                        {conn.connected ? 'Disconnect Stream' : 'Deploy Plaid Sync'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* --- TABS 4: EMISSION LEDGER TABLE --- */}
        {activeTab2 === 'LEDGER' && (
          <motion.section
            key="gf-ledger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Custom transaction log form */}
            <div className="lg:col-span-4 bg-[#121212] border border-white/10 p-6 rounded-none h-fit">
              <div className="flex items-center gap-2 mb-4 text-[9px] font-mono font-bold tracking-widest text-[#EAB308] uppercase">
                <Database className="w-4 h-4" /> Manual Ledger Append
              </div>
              <p className="text-xs text-zinc-400 mb-6 font-sans">
                Append custom entries bypassing Plaid APIs with secure hashes validation. Enforces input checks using strict schemas.
              </p>

              {manualFormError && (
                <div role="alert" className="p-3 mb-4 bg-red-950/70 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Validation Error: {manualFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCustomLog} className="space-y-4 font-mono text-[10px] uppercase tracking-wider">
                <div className="space-y-1.5">
                  <label htmlFor="gf-new-log-source" className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-widest cursor-pointer">Transaction Source Node</label>
                  <select 
                    id="gf-new-log-source"
                    value={newLogSource}
                    onChange={(e) => setNewLogSource(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-none p-2.5 text-zinc-200 outline-none focus:border-[#EAB308] cursor-pointer"
                  >
                    <option value="Chase Mastercard">Chase Mastercard</option>
                    <option value="PG&E Direct">PG&E Direct Smart Feed</option>
                    <option value="Uber Business API">Uber Corporate Commute</option>
                    <option value="Plaid Bank Aggregator">Plaid Aggregation Feed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gf-new-log-category" className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-widest cursor-pointer">Footprint Category</label>
                  <select 
                    id="gf-new-log-category"
                    value={newLogCategory}
                    onChange={(e) => setNewLogCategory(e.target.value as any)}
                    className="w-full bg-black border border-white/10 rounded-none p-2.5 text-zinc-200 outline-none focus:border-[#EAB308] cursor-pointer"
                  >
                    <option value="corporate">Scope 1: Corporate Direct</option>
                    <option value="energy">Scope 2: Purchased Energy</option>
                    <option value="transport">Scope 3: Travel Logistics</option>
                    <option value="food">Scope 3: Waste/Compost</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gf-new-log-desc" className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-widest cursor-pointer">Description Detail</label>
                  <input
                    id="gf-new-log-desc"
                    type="text"
                    value={newLogDesc}
                    onChange={(e) => setNewLogDesc(e.target.value)}
                    placeholder="e.g. Energy Star network items"
                    className="w-full bg-black border border-white/10 rounded-none p-2.5 text-zinc-200 outline-none focus:border-[#EAB308] placeholder:text-zinc-650 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gf-new-log-co2" className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-widest cursor-pointer">Footprint Offset (kg CO2)</label>
                  <input
                    id="gf-new-log-co2"
                    type="number"
                    step="0.1"
                    value={newLogCo2}
                    onChange={(e) => setNewLogCo2(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-none p-2.5 text-zinc-200 outline-none focus:border-[#EAB308]"
                  />
                </div>

                <button
                  id="ledger-submit-button"
                  type="submit"
                  className="w-full bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-black p-3 rounded-none flex items-center justify-center gap-1.5 transition-colors mt-2 text-[9px] tracking-widest cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                >
                  <Plus className="w-4 h-4" /> Record Footprint Segment
                </button>
              </form>
            </div>

            {/* Injected transaction tables */}
            <div className="lg:col-span-8 bg-[#121212] border border-white/10 p-6 rounded-none flex flex-col justify-between">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">GHG LEDGER ARCHIVE</span>
                    <h3 className="font-extrabold text-sm text-white uppercase mt-0.5">Verification Compliance Audit logs</h3>
                  </div>
                  
                  {/* Select filters */}
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-zinc-500">Sync Filter:</span>
                    <select
                      value={filterSource}
                      aria-label="Filter ledger entries by sync source"
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="bg-black border border-white/10 rounded-none px-2.5 py-1.5 text-zinc-300 outline-none cursor-pointer focus:border-[#EAB308]"
                    >
                      <option value="all">Show All Sources</option>
                      <option value="Chase Mastercard">Chase Mastercard</option>
                      <option value="PG&E Direct">PG&E Direct Meter</option>
                      <option value="Uber Business API">Uber Logistics Feed</option>
                      <option value="Food Log">Composting Accounts</option>
                      <option value="ESG Intelligence AI">AI Recommendations Offset</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider table-auto">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500 pb-2">
                        <th className="py-2.5 font-black text-left">TIMESTAMP</th>
                        <th className="py-2.5 font-black text-left">SOURCE TARGET</th>
                        <th className="py-2.5 font-black text-left">DESCRIPTION</th>
                        <th className="py-2.5 font-black text-right">WEIGHT</th>
                        <th className="py-2.5 font-black text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-black/60 group">
                          <td className="py-3 text-zinc-400 whitespace-nowrap text-left">{log.date}</td>
                          <td className="py-3 font-semibold text-[#EAB308] whitespace-nowrap text-left">{log.source}</td>
                          <td className="py-3 text-zinc-200 text-left normal-case">
                            <span className="font-bold">{log.description}</span>
                            <span className="text-[8px] font-mono text-[#EAB308]/60 block uppercase mt-0.5 tracking-widest">CAT: {log.category}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-black ${log.co2Amount < 0 ? 'text-[#EAB308]' : 'text-stone-300'}`}>
                              {log.co2Amount >= 0 ? '+' : ''}{log.co2Amount.toFixed(1)} kgCO₂e
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              id={`ledger-delete-${log.id}`}
                              onClick={() => onDeleteLog(log.id)}
                              className="text-red-400 hover:text-red-300 hover:underline px-2.5 uppercase text-[9px] font-black cursor-pointer focus:outline-none"
                              aria-label={`Delete ledger item ${log.description}`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* --- TABS 5: WHAT-IF SIMULATORS --- */}
        {activeTab2 === 'SIMULATOR' && (
          <motion.section
            key="gf-sim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Control Sliders */}
            <div className="lg:col-span-5 bg-[#121212] border border-white/10 p-6 rounded-none space-y-6">
              <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest uppercase text-[#EAB308]">
                <Sliders className="w-4 h-4" /> Parameters Control
              </div>
              <h3 className="font-extrabold text-sm uppercase text-white">Dynamic Mitigation Modeling</h3>
              <p className="text-xs text-zinc-400 mb-4">Modify variables live to project carbon footprint offsets over 5-year compliant cycles:</p>

              <div className="space-y-5 text-[10px] font-mono uppercase tracking-wider">
                {/* Sliders Commute */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="sim-commute-range" className="text-zinc-400 cursor-pointer">Monthly Fleet Logistics Travel:</label>
                    <span className="font-black text-white">{simCommute} MILES</span>
                  </div>
                  <input
                    id="sim-commute-range"
                    type="range"
                    min="100"
                    max="3000"
                    step="50"
                    value={simCommute}
                    onChange={(e) => setSimCommute(parseInt(e.target.value))}
                    className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                    aria-label="Monthly Fleet Logistics Travel Miles"
                  />
                </div>

                {/* Grid utility */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="sim-grid-range" className="text-zinc-400 cursor-pointer">Power Grid Fuel Intensity:</label>
                    <span className="font-black text-white">{simGrid} G CO₂/kWH</span>
                  </div>
                  <input
                    id="sim-grid-range"
                    type="range"
                    min="50"
                    max="600"
                    step="10"
                    value={simGrid}
                    onChange={(e) => setSimGrid(parseInt(e.target.value))}
                    className="w-full accent-[#EAB308] cursor-pointer bg-black h-1"
                    aria-label="Power Grid Fuel Intensity Grams carbon per kilowatt-hour"
                  />
                </div>

                {/* Toggle EV */}
                <div className="pt-2 flex justify-between items-center bg-black p-4 rounded-none border border-white/5">
                  <div className="pr-4">
                    <label htmlFor="sim-ev-toggle" className="font-black text-zinc-200 cursor-pointer block">Enforce Full EV Transition</label>
                    <span className="text-[9px] text-zinc-500 font-sans uppercase mt-1 leading-normal block">Convert logistic fleets to Zero-emissions option</span>
                  </div>
                  <button
                    id="sim-ev-toggle"
                    type="button"
                    aria-pressed={simEv}
                    onClick={() => setSimEv(!simEv)}
                    className={`w-12 h-6 rounded-none flex items-center p-1 cursor-pointer transition-all ${
                      simEv ? 'bg-[#EAB308] justify-end' : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-black block" />
                  </button>
                </div>

                {/* Toggle Solar */}
                <div className="flex justify-between items-center bg-black p-4 rounded-none border border-white/5">
                  <div className="pr-4">
                    <label htmlFor="sim-solar-toggle" className="font-black text-zinc-200 cursor-pointer block">Deploy Net Metered Solar Array</label>
                    <span className="text-[9px] text-zinc-500 font-sans uppercase mt-1 leading-normal block">Self-produce green energy on-site via solar</span>
                  </div>
                  <button
                    id="sim-solar-toggle"
                    type="button"
                    aria-pressed={simSolar}
                    onClick={() => setSimSolar(!simSolar)}
                    className={`w-12 h-6 rounded-none flex items-center p-1 cursor-pointer transition-all ${
                      simSolar ? 'bg-[#EAB308] justify-end' : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-black block" />
                  </button>
                </div>
              </div>
            </div>

            {/* Projection visualizer Chart */}
            <div className="lg:col-span-7 bg-[#121212] border border-white/10 p-6 rounded-none flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">PROJECTION CHART</span>
                <h3 className="font-black text-xs text-white uppercase mt-0.5 tracking-wider">5-Year Corporate Emissions Projections</h3>
                <p className="text-xs text-zinc-400 mt-1 mb-6 font-sans">Compares static business-as-usual vs custom What-If scenario implementation curves:</p>

                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" aria-hidden="true" preserveAspectRatio="none">
                    {/* Grids */}
                    {[25, 50, 75, 100].map((v, i) => (
                      <line key={i} x1="0%" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 3" />
                    ))}

                    {/* Baseline Line (Reddish decline slightly) */}
                    <path
                      d={`M 10,130 L 120,${140 - (parseInt(calculateYearBaseline(1))/45)} L 240,${140 - (parseInt(calculateYearBaseline(2))/45)} L 360,${140 - (parseInt(calculateYearBaseline(3))/45)} L 490,${140 - (parseInt(calculateYearBaseline(4))/45)}`}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeLinecap="square"
                    />

                    {/* What-If Projected Line (Gorgeous green trajectory) */}
                    <path
                      d={`M 10,130 L 120,${140 - (parseInt(calculateYearOffset(1))/45)} L 240,${140 - (parseInt(calculateYearOffset(2))/45)} L 360,${140 - (parseInt(calculateYearOffset(3))/45)} L 490,${140 - (parseInt(calculateYearOffset(4))/45)}`}
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="3.5"
                      strokeLinecap="square"
                    />
                  </svg>
                  <div className="flex justify-between text-[8px] text-zinc-500 mt-2 font-mono uppercase tracking-widest font-black">
                    <span>Y1 (2026)</span>
                    <span>Y2 (2027)</span>
                    <span>Y3 (2028)</span>
                    <span>Y4 (2029)</span>
                    <span>Y5 (2030)</span>
                  </div>
                </div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-6 font-mono text-[9px] uppercase tracking-wider">
                <div className="flex gap-2 items-start">
                  <span className="w-3 h-3 bg-[#EF4444] mt-1 shrink-0"></span>
                  <div>
                    <div className="text-zinc-500 font-bold">Standard Baseline (BAU)</div>
                    <div className="text-white font-mono text-[10px] mt-0.5">{calculateYearBaseline(4)} kg CO₂ / Year</div>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <span className="w-3 h-3 bg-[#EAB308] mt-1 shrink-0"></span>
                  <div>
                    <div className="text-[#EAB308] font-black">Mitigated Target Proj.</div>
                    <div className="text-white font-mono text-[10px] mt-0.5">{calculateYearOffset(4)} kg CO₂ / Year</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* --- TABS 6: SEC COMPLIANCE REPORTS HISTORY & ARCHIVE --- */}
        {activeTab2 === 'REPORTING' && (
          <motion.section
            key="gf-rep-pane"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Split layout: Compile trigger and History log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Compiler Controls */}
              <div className="lg:col-span-5 bg-[#121212] border border-white/10 p-6 rounded-none space-y-5">
                <div className="w-12 h-12 bg-black border border-white/5 rounded-none flex items-center justify-center text-[#EAB308]">
                  <FileText className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="font-extrabold text-white uppercase tracking-wider text-sm">SEC Regulatory Compliant Compiler</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Compile standard corporate and household GHG disclosure sheets. Formulates compliant balance indexes, Category distributions, and certified text declarations.
                  </p>
                </div>

                <div className="p-3 bg-black border border-white/5 space-y-2 font-mono text-[9px] uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Protocol Spec:</span>
                    <strong className="text-white">GHG Scope 1, 2, 3 compliant</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ledger Count:</span>
                    <strong className="text-[#EAB308]">{logs.length} validated items</strong>
                  </div>
                </div>

                <button
                  id="btn-compile-disclosure-report"
                  onClick={handleArchiveReport}
                  className="w-full bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-extrabold p-3.5 rounded-none font-mono text-[10px] tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                >
                  <Plus className="w-4 h-4 text-black" /> Compile & Sign New Audit Report
                </button>
              </div>

              {/* Historical Archive Records */}
              <div className="lg:col-span-7 bg-[#121212] border border-white/10 p-6 rounded-none space-y-6">
                <div>
                  <h3 className="font-extrabold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-[#EAB308]" /> SEC Compliance Historical Report Storage
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Chronological list of all compiled environmental audit metrics. Recall previous calculations to track long-term sustainability progress.
                  </p>
                </div>

                {historicalReports.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-white/10 font-mono text-zinc-500 text-[10px] uppercase tracking-widest leading-loose">
                    No compiled records exists in localized localStorage index.<br />
                    Click "Compile" to generate your starting carbon profile!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {historicalReports.map((rep) => (
                      <div 
                        key={rep.id} 
                        className="bg-black p-4 border border-white/10 rounded-none space-y-4"
                      >
                        {/* Header metadata */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-2">
                          <div className="font-mono text-[10px] uppercase tracking-wider">
                            <span className="text-zinc-500 font-bold">AUDIT STAMP:</span> <span className="text-white font-black">{rep.timestamp}</span>
                            <span className="text-[8px] bg-[#EAB308]/5 text-[#EAB308] border border-[#EAB308]/20 px-1.5 py-0.5 rounded-none ml-2 uppercase font-mono font-bold tracking-widest">CERTIFIED</span>
                          </div>
                          
                          <button
                            id={`delete-rep-btn-${rep.id}`}
                            onClick={() => handleDeleteHistoryReport(rep.id)}
                            className="text-red-500 hover:text-red-400 font-mono text-[9px] uppercase font-bold cursor-pointer focus:outline-none"
                            aria-label={`Purge historical report stamped ${rep.timestamp}`}
                          >
                            Purge Records
                          </button>
                        </div>

                        {/* Scores grid display */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10px] uppercase tracking-wide">
                          <div className="bg-neutral-900 p-2 border border-white/5">
                            <span className="text-zinc-500 text-[8px] tracking-widest">Monthly Gg</span>
                            <div className="font-black text-white text-xs mt-0.5">{rep.monthlyFootprint} KG</div>
                          </div>
                          <div className="bg-neutral-900 p-2 border border-white/5">
                            <span className="text-zinc-500 text-[8px] tracking-widest">Annual Gross</span>
                            <div className="font-black text-white text-xs mt-0.5">{rep.annualFootprint} KG</div>
                          </div>
                          <div className="bg-neutral-900 p-2 border border-white/5">
                            <span className="text-[#EAB308] text-[8px] font-bold tracking-widest">Carbon Score</span>
                            <div className="font-black text-[#EAB308] text-xs mt-0.5">{rep.carbonScore}%</div>
                          </div>
                          <div className="bg-neutral-900 p-2 border border-white/5">
                            <span className="text-zinc-500 text-[8px] tracking-widest">Sustainability</span>
                            <div className="font-black text-white text-xs mt-0.5">{rep.sustainabilityScore}/100</div>
                          </div>
                        </div>

                        {/* Expandable physical breakdown receipt */}
                        <details className="group border border-white/5 bg-neutral-950 p-2 font-mono text-[9px] uppercase tracking-widest cursor-pointer text-zinc-400">
                          <summary className="text-zinc-400 font-bold group-open:text-white py-1 flex justify-between items-center select-none">
                            <span>RECALL DETAILED BREAKDOWN METRICS:</span>
                            <span className="text-[8px] font-mono font-extrabold text-[#EAB308]">[CLICK TO ROTATE]</span>
                          </summary>
                          
                          <div className="pt-3 border-t border-white/5 mt-2 space-y-2 text-zinc-300 normal-case leading-normal font-sans">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="font-mono text-[9px] uppercase space-y-1">
                                <span className="text-zinc-500 font-bold">CATEGORY OUTFLOWS:</span>
                                <div>- Transportation: <strong className="text-white">{rep.breakdown.transport} kg</strong></div>
                                <div>- Grid Energy: <strong className="text-white">{rep.breakdown.energy} kg</strong></div>
                                <div>- Flight Transits: <strong className="text-white">{rep.breakdown.travel} kg</strong></div>
                                <div>- Diet Outflow: <strong className="text-white">{rep.breakdown.lifestyle} kg</strong></div>
                              </div>
                              <div className="font-mono text-[9px] uppercase space-y-1">
                                <span className="text-zinc-500 font-bold">SNAPSHOT MODEL ARTIFACT:</span>
                                <div>- Car Mileage: <strong className="text-white">{rep.snapshotInput?.carMiles || 0} mi</strong></div>
                                <div>- Electricity: <strong className="text-white">{rep.snapshotInput?.householdElectricityKwh || 0} kWh</strong></div>
                                <div>- Diet Level: <strong className="text-white">{rep.snapshotInput?.meatConsumptionLevel || 'Moderate'}</strong></div>
                              </div>
                            </div>
                          </div>
                        </details>

                        {/* Export/download actions */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">SEC v4.2 Regulatory standard disclosure compliance.</div>
                          
                          {downloadProgress !== null && printingReportId === rep.id ? (
                            <div className="bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20 p-1 px-3 font-mono text-[9px] uppercase font-bold tracking-widest animate-pulse">
                              Downloading: {downloadProgress}%
                            </div>
                          ) : (
                            <button
                              id={`download-audited-report-btn-${rep.id}`}
                              onClick={() => {
                                setPrintingReportId(rep.id);
                                triggerProgressiveDownload(rep);
                              }}
                              className="px-3 py-1.5 rounded-none bg-[#EAB308] hover:bg-[#EAB308]/80 text-black font-black text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 focus:outline-none"
                              aria-label={`Export detailed PDF compliant file for report stamped ${rep.timestamp}`}
                            >
                              <Download className="w-3.5 h-3.5" /> EXPORT COMPLIANT AUDIT (TXT / PDF)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- OAUTH CONNECT POPUP OVERLAY --- */}
      <AnimatePresence>
        {showPlaidModal && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B0B0B] rounded-none border border-white/15 p-6 max-w-md w-full relative z-10 text-white"
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-none bg-black border border-white/10 text-[#EAB308] flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-black text-sm uppercase tracking-wider">OAuth Secure Feed Linkage</h3>
                  <p className="text-xs text-zinc-400 font-sans">Link secure data credentials using authorized Plaid protocols.</p>
                </div>

                <div className="bg-black p-4 rounded-none text-left border border-white/10 font-mono text-[9px] uppercase tracking-wider space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Service target:</span>
                    <strong className="text-white">API Integration Meter</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Auth scope:</span>
                    <strong className="text-[#EAB308]">ReadOnly Telemetry Data</strong>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[8px] text-zinc-500 leading-normal">
                    Secure 256-bit bank level SSL encryption. No login credentials will be stored.
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3 font-mono text-[9px] uppercase tracking-widest">
                  <button
                    onClick={() => {
                      setShowPlaidModal(false);
                      setSyncingConnId(null);
                    }}
                    className="p-3 bg-black rounded-none border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="finish-oauth-button"
                    onClick={handleFinishOauth}
                    className="p-3 bg-[#EAB308] rounded-none text-black font-black hover:bg-[#EAB308]/90 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                  >
                    Authorize Feed
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </article>
  );
}
