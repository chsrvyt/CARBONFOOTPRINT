import React, { useState, useMemo } from 'react';
import { ActionLog, ConnectionItem, SimulatorState, SubScreenGreenFlow } from '../types';
import { 
  calculateYearBaseline as calculateYearBaselineImport,
  calculateSimulatedYearOffset
} from '../utils/calculations';
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
  Sliders 
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

  // Custom log injection form state
  const [newLogSource, setNewLogSource] = useState('Chase Mastercard');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogCo2, setNewLogCo2] = useState('45.0');
  const [newLogCategory, setNewLogCategory] = useState<'food' | 'transport' | 'energy' | 'corporate'>('corporate');

  // Interactive progressive file downloader state
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // What-if simulator live state
  const [simCommute, setSimCommute] = useState(800);
  const [simGrid, setSimGrid] = useState(280);
  const [simEv, setSimEv] = useState(false);
  const [simSolar, setSimSolar] = useState(false);

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

  const handleCreateCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc) return;
    const co2ValRaw = parseFloat(newLogCo2);
    const co2Val = isNaN(co2ValRaw) ? 0.0 : co2ValRaw;
    onAddLog({
      category: newLogCategory,
      description: newLogDesc,
      co2Amount: co2Val,
      pointsEarned: Math.abs(Math.floor(co2Val * 5)),
      source: newLogSource,
      status: 'completed'
    });
    setNewLogDesc('');
  };

  const triggerOauthConnect = (conn: ConnectionItem) => {
    if (conn.connected) {
      // Disconnect directly
      onToggleConnection(conn.id);
      return;
    }
    // Simulate Plaid Direct Bank Link OAuth
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

  const triggerProgressiveDownload = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 1500);
          return 100;
        }
        return prev + 20;
      });
    }, 280);
  };

  // Live what-if calculations using pure, centralized algorithms
  const calculateYearOffset = (yearIdx: number) => {
    return calculateSimulatedYearOffset(yearIdx, simEv, simSolar, simCommute, simGrid).toFixed(0);
  };

  const calculateYearBaseline = (yearIdx: number) => {
    return calculateYearBaselineImport(yearIdx).toFixed(0);
  };

  return (
    <div className="font-karla text-white bg-[#0A0A0A] p-0 md:p-2 rounded-none overflow-hidden relative">
      {/* Enterprise Ticker Bar details */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <div className="relative">
          <div className="absolute -top-7 left-0 text-[40px] md:text-[56px] font-black text-stroke-gray uppercase tracking-tighter select-none font-sans pointer-events-none opacity-20">
            GREENFLOW
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#EAB308] uppercase tracking-[0.2em] relative z-10 pl-1">
            <span className="w-2 h-2 bg-[#EAB308]"></span>
            ESG REGULATORY CORE // AUDIT ENGINE STARK
          </div>
          <h2 className="text-3xl font-black text-white tracking-widest mt-1.5 relative z-10 uppercase">
            GREENFLOW <span className="text-[#EAB308]">ACCOUNTING SYSTEM</span>
          </h2>
        </div>

        {/* Workspace Swapper Tab group */}
        <div className="flex bg-neutral-950 p-1 rounded-none border border-white/10 font-mono text-[9px] overflow-x-auto max-w-full">
          {(['OVERVIEW', 'INGESTION', 'LEDGER', 'SIMULATOR', 'REPORTING'] as SubScreenGreenFlow[]).map((tab) => (
            <button
              key={tab}
              id={`gf-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab2(tab)}
              className={`px-4 py-2.5 rounded-none uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
                activeTab2 === tab
                  ? 'bg-[#EAB308] text-black border border-[#EAB308] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'OVERVIEW' && '📊 ESG Overview'}
              {tab === 'INGESTION' && '🔌 Direct Sync'}
              {tab === 'LEDGER' && '📋 Ledgers'}
              {tab === 'SIMULATOR' && '🧙 What-If'}
              {tab === 'REPORTING' && '📝 Reports'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- TABS 1: OVERVIEW DASHBOARD --- */}
        {activeTab2 === 'OVERVIEW' && (
          <motion.div
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
                  <TrendingDown className="w-3.5 h-3.5 text-[#EAB308]" /> -12.4% below target cap
                </div>
              </div>

              <div className="bg-[#121212] border border-white/10 p-5 rounded-none">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">MoM RATE DELTA</span>
                <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">-8.3% <span className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">Offset Vel.</span></div>
                <div className="text-xs text-zinc-500 mt-3 font-mono uppercase text-[9px] tracking-wider">Verified smart integrations</div>
              </div>

              <div className="bg-[#121212] border border-white/10 p-5 rounded-none">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">SYNC TERMINALS</span>
                <div className="text-3xl font-black text-[#EAB308] mt-1 font-mono tracking-tight">02 / 04</div>
                <div className="text-xs text-zinc-500 mt-3 font-mono uppercase text-[9px] tracking-wider">Chase, PG&E Direct active</div>
              </div>
            </div>

            {/* Central charts split: Spline and Source Bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* YTD Cumulative Tracker chart */}
              <div className="lg:col-span-8 bg-[#121212] border border-white/10 p-6 rounded-none">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">FINANCIAL AUDIT LINE</span>
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mt-1">YTD Fleet-Wide Carbon Trajectory</h3>
                  </div>
                  <span className="p-1 px-3 text-[9px] font-mono rounded-none bg-black border border-white/15 text-[#EAB308] tracking-widest uppercase font-bold">SCOPE 1, 2 & 3 ALL</span>
                </div>

                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
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
                    <span>Q1 BEGIN</span>
                    <span>Q2 CROSS</span>
                    <span>Q3 PRE</span>
                    <span>Q4 EST</span>
                  </div>
                </div>
              </div>

              {/* Top Source Columns list */}
              <div className="lg:col-span-4 bg-[#121212] border border-white/10 p-6 rounded-none flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-[10px] tracking-widest font-mono text-zinc-400 mb-4 uppercase">Emissions Source Shares</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Scope 1: Direct Combustion', val: 345, pct: 40, col: 'bg-[#EAB308]' },
                      { label: 'Scope 2: Purchased Utility Grid', val: 280, pct: 32, col: 'bg-zinc-400' },
                      { label: 'Scope 3: Corporate Business Travel', val: 180, pct: 21, col: 'bg-zinc-650' },
                      { label: 'Scope 3: Auxiliary Kitchen/Waste', val: 60, pct: 7, col: 'bg-zinc-800' }
                    ].map((s) => (
                      <div key={s.label}>
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
                  *Figures comply with GHG Protocol audit models.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TABS 2: DIRECT SYNC CONNECTORS --- */}
        {activeTab2 === 'INGESTION' && (
          <motion.div
            key="gf-ing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-[#121212] border border-white/10 p-6 rounded-none">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Direct Ecosystem Data Pipelines</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-6">
                Authorize bank, shipping, or energy API feeds to stream enterprise carbon activity. We do not store financial passwords, prioritizing compliance safety.
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
                        Linked: {conn.accountNumber || 'Pending Configuration'}. Automated sync: {conn.lastSync}.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Savings: <strong className="text-white">{conn.monthlySavingsProjected}kgCO₂/m</strong></span>
                      <button
                        id={`auth-conn-btn-${conn.id}`}
                        onClick={() => triggerOauthConnect(conn)}
                        className={`px-4 py-2 font-mono text-[9px] uppercase tracking-widest rounded-none border font-bold transition-all ${
                          conn.connected 
                            ? 'bg-black text-red-400 border-red-500/20 hover:border-red-500/55'
                            : 'bg-[#EAB308] text-black border-[#EAB308] hover:bg-[#EAB308]/90'
                        }`}
                      >
                        {conn.connected ? 'Disconnect Feed' : 'Sync Meter via Plaid'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TABS 3: EMISSION LEDGER TABLE --- */}
        {activeTab2 === 'LEDGER' && (
          <motion.div
            key="gf-ledger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Custom transaction log form */}
            <div className="lg:col-span-4 bg-[#121212] border border-white/10 p-6 rounded-none h-fit">
              <div className="flex items-center gap-2 mb-4 text-[9px] font-mono font-bold tracking-widest text-[#EAB308] uppercase">
                <Database className="w-4 h-4" /> Add Manual Ledger Entry
              </div>
              <p className="text-xs text-zinc-400 mb-6">Create compliant manual footprints for items bypassing digital telemetry connectors:</p>

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
                  <label htmlFor="gf-new-log-desc" className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-widest cursor-pointer">Description / Invoice Detail</label>
                  <input
                    id="gf-new-log-desc"
                    type="text"
                    required
                    value={newLogDesc}
                    onChange={(e) => setNewLogDesc(e.target.value)}
                    placeholder="e.g. Server rack HVAC offset"
                    className="w-full bg-black border border-white/10 rounded-none p-2.5 text-zinc-200 outline-none focus:border-[#EAB308] placeholder:text-zinc-650"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gf-new-log-co2" className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-widest cursor-pointer">Measured Footprint kg CO₂e</label>
                  <input
                    id="gf-new-log-co2"
                    type="number"
                    step="0.1"
                    required
                    value={newLogCo2}
                    onChange={(e) => setNewLogCo2(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-none p-2.5 text-zinc-200 outline-none focus:border-[#EAB308]"
                  />
                </div>

                <button
                  id="ledger-submit-button"
                  type="submit"
                  className="w-full bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-black p-3 rounded-none flex items-center justify-center gap-1.5 transition-colors mt-2 text-[9px] tracking-widest"
                >
                  <Plus className="w-4 h-4" /> Inject Footprint record
                </button>
              </form>
            </div>

            {/* Injected transaction tables */}
            <div className="lg:col-span-8 bg-[#121212] border border-white/10 p-6 rounded-none flex flex-col justify-between">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">GHG LEDGER</span>
                    <h3 className="font-extrabold text-sm text-white uppercase mt-0.5">Compliance Audit Ledger</h3>
                  </div>
                  
                  {/* Select filters */}
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-zinc-500">Sync Filter:</span>
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="bg-black border border-white/10 rounded-none px-2.5 py-1.5 text-zinc-300 outline-none cursor-pointer focus:border-[#EAB308]"
                    >
                      <option value="all">Show All Sources</option>
                      <option value="Chase Mastercard">Chase Mastercard</option>
                      <option value="PG&E Direct">PG&E Direct Meter</option>
                      <option value="Uber Business API">Uber Logistics Feed</option>
                      <option value="Food Log">Composting Accounts</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500 pb-2">
                        <th className="py-2.5 font-black text-left">TIMESTAMP</th>
                        <th className="py-2.5 font-black text-left">TRANSACTION SOURCE</th>
                        <th className="py-2.5 font-black text-left">DESCRIPTION DETAIL</th>
                        <th className="py-2.5 font-black text-right">FOOTPRINT WEIGHT</th>
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
                            <span className="text-[8px] font-mono text-zinc-505 block uppercase mt-0.5 tracking-widest">CAT: {log.category}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-black ${log.co2Amount < 0 ? 'text-[#EAB308]' : 'text-stone-300'}`}>
                              {log.co2Amount.toFixed(1)} kgCO₂e
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              id={`ledger-delete-${log.id}`}
                              onClick={() => onDeleteLog(log.id)}
                              className="text-red-400 hover:text-red-300 hover:underline px-2.5 uppercase text-[9px] font-black"
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
          </motion.div>
        )}

        {/* --- TABS 4: WHAT-IF SIMULATORS --- */}
        {activeTab2 === 'SIMULATOR' && (
          <motion.div
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
              <p className="text-xs text-zinc-400 mb-4">Modify variables live to project fleet-wide carbon footprint offsets over 5-year compliant cycles:</p>

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
                    <div className="font-black text-zinc-200">Enforce Full EV Transition</div>
                    <div className="text-[9px] text-zinc-500 font-sans uppercase mt-1 leading-normal">Convert logistic fleets to Zero-emissions</div>
                  </div>
                  <button
                    id="sim-ev-toggle"
                    type="button"
                    onClick={() => setSimEv(!simEv)}
                    className={`w-12 h-6 rounded-none flex items-center p-1 cursor-pointer transition-all ${
                      simEv ? 'bg-[#EAB308] justify-end' : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-black" />
                  </button>
                </div>

                {/* Toggle Solar */}
                <div className="flex justify-between items-center bg-black p-4 rounded-none border border-white/5">
                  <div className="pr-4">
                    <div className="font-black text-zinc-200">Deploy Net Metered Solar</div>
                    <div className="text-[9px] text-zinc-500 font-sans uppercase mt-1 leading-normal">Self-produce energy on-site via solar</div>
                  </div>
                  <button
                    id="sim-solar-toggle"
                    type="button"
                    onClick={() => setSimSolar(!simSolar)}
                    className={`w-12 h-6 rounded-none flex items-center p-1 cursor-pointer transition-all ${
                      simSolar ? 'bg-[#EAB308] justify-end' : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-black" />
                  </button>
                </div>
              </div>
            </div>

            {/* Projection visualizer Chart */}
            <div className="lg:col-span-7 bg-[#121212] border border-white/10 p-6 rounded-none flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">PROJECTION CHART</span>
                <h3 className="font-black text-xs text-white uppercase mt-0.5 tracking-wider">5-Year Corporate Emissions Projections</h3>
                <p className="text-xs text-zinc-400 mt-1 mb-6">Compares static business-as-usual vs custom What-If scenario implementation curves:</p>

                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
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
                    <div className="text-white font-mono text-[10px] mt-0.5">{calculateYearBaseline(4)} kg CO₂e / Year</div>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <span className="w-3 h-3 bg-[#EAB308] mt-1 shrink-0"></span>
                  <div>
                    <div className="text-[#EAB308] font-black">Mitigated Scenario Proj.</div>
                    <div className="text-white font-mono text-[10px] mt-0.5">{calculateYearOffset(4)} kg CO₂e / Year</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TABS 5: COMPLIANCE EXPORTS --- */}
        {activeTab2 === 'REPORTING' && (
          <motion.div
            key="gf-rep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-[#121212] border border-white/10 p-8 rounded-none max-w-3xl mx-auto text-center space-y-6 relative overflow-hidden">
              <div className="w-16 h-16 bg-black border border-white/10 rounded-none flex items-center justify-center mx-auto text-[#EAB308]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-sans">GHG Regulatory Protocol Suite</h3>
                <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                  Export fully standard, audit-certified, localized carbon summaries ready for EPA corporate accounting, investor review reports, or global CSR disclosures.
                </p>
              </div>

              {/* Range indicators layout */}
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-left py-3 border-t border-b border-white/10 font-mono text-[9px] uppercase tracking-widest leading-loose">
                <div className="p-2 border-r border-white/10">
                  <span className="text-zinc-500 font-mono block">Export Span</span>
                  <strong className="text-white">FY 2026 YTD COMPLIANT</strong>
                </div>
                <div className="p-2 pl-4">
                  <span className="text-zinc-500 font-mono block">Direct Entries</span>
                  <strong className="text-[#EAB308]">{logs.length} LEDGER RECORDS</strong>
                </div>
              </div>

              {/* Progressive loading downloader */}
              <div className="max-w-md mx-auto space-y-3">
                {downloadProgress !== null ? (
                  <div className="space-y-2 bg-black p-4 rounded-none border border-white/10 font-mono text-[9px] uppercase tracking-widest text-[#EAB308]">
                    <div className="flex justify-between text-[#EAB308] font-bold">
                      <span>Generating secure PDF archive...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-none overflow-hidden border border-white/5">
                      <div className="bg-[#EAB308] h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    id="export-pdf-button"
                    onClick={triggerProgressiveDownload}
                    className="w-full bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-black p-4 rounded-none flex items-center justify-center gap-2 shadow-lg transition-colors font-mono uppercase text-[10px] tracking-widest"
                  >
                    <Download className="w-4.5 h-4.5" /> COMPILE SECURE REGULATORY REPORT (PDF)
                  </button>
                )}

                <div className="text-[8px] text-zinc-500 font-mono leading-normal uppercase tracking-wider pt-2">
                  Requires certified digital signature tokens. By compiling, you declare compliance with SEC Climate Risk Disclosures under EPA Protocol Scope standards.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- OAUTH CONNECT POPUP OVERLAY --- */}
      <AnimatePresence>
        {showPlaidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
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
                    className="p-3 bg-black rounded-none border border-white/10 text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="finish-oauth-button"
                    onClick={handleFinishOauth}
                    className="p-3 bg-[#EAB308] rounded-none text-black font-black hover:bg-[#EAB308]/90 transition-colors"
                  >
                    Authorize Feed
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
