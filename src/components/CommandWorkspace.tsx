import React, { useState } from 'react';
import { ActionLog, SubScreenCommand } from '../types';
import { COMMMAND_LIBRARY_ACTIONS, LibraryActionItem } from '../data';
import { 
  Zap, 
  Flame, 
  Trash2, 
  Calendar, 
  TrendingDown, 
  Plus, 
  CheckCircle, 
  ListFilter, 
  Activity, 
  Wifi, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandWorkspaceProps {
  logs: ActionLog[];
  onAddLog: (log: Omit<ActionLog, 'id' | 'date'>) => void;
  onDeleteLog: (id: string) => void;
  totalPoints: number;
}

export default function CommandWorkspace({
  logs,
  onAddLog,
  onDeleteLog,
  totalPoints
}: CommandWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<SubScreenCommand>('DASHBOARD');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activatedActionId, setActivatedActionId] = useState<string | null>(null);

  // Derive stats for Terra Command
  const currentDailyAvg = Math.abs(
    logs.reduce((sum, log) => sum + (log.co2Amount < 0 ? log.co2Amount : 0), 0) / 7
  ).toFixed(1);

  // We have a daily "CO2 budget" of 30kg. Current average savings reduce our net output.
  const baseLineCO2 = 34.2; // kg/day
  const currentSavings = Math.abs(logs.reduce((sum, l) => sum + (l.co2Amount < 0 ? l.co2Amount : 0), 0)) / 10;
  const netCO2 = Math.max(2.1, baseLineCO2 - currentSavings).toFixed(1);
  const remainingDays = Math.max(1, Math.min(99, Math.floor((1200 / (parseFloat(netCO2) * 3)))));

  // Group emissions by category for Top Emitters chart
  const categories = {
    transport: 124.5,
    food: 43.2,
    energy: 98.1,
    corporate: 210.3
  };

  const handleApplyProtocol = (action: LibraryActionItem) => {
    onAddLog({
      category: action.category,
      description: `Protocol Activated: ${action.name}`,
      co2Amount: -parseFloat(action.co2Save), // e.g. -380 split to a single daily chunk
      pointsEarned: action.points,
      source: 'Terra Core Command',
      status: 'completed'
    });
    setActivatedActionId(action.id);
    setTimeout(() => setActivatedActionId(null), 1600);
  };

  return (
    <div className="font-space-grotesk text-white bg-[#0A0A0A] p-0 md:p-2 rounded-none overflow-hidden relative">
      {/* HUD Launcher Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <div className="relative">
          <div className="absolute -top-7 left-0 text-[48px] md:text-[56px] font-black text-stroke-gray uppercase tracking-tighter select-none font-sans pointer-events-none opacity-20">
            COMMAND
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#EAB308] uppercase tracking-[0.2em] relative z-10 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse"></span>
            SYS CODESTAGE // WORKSPACE ALPHA-7
          </div>
          <h2 className="text-3xl font-black text-white tracking-widest mt-1.5 relative z-10 uppercase">
            TERRA COMMAND <span className="text-[#EAB308]">TERMINAL</span>
          </h2>
        </div>

        {/* Outer System Workspace Links */}
        <div className="flex bg-neutral-950 p-1 rounded-none border border-white/10 font-mono text-[10px]">
          {(['DASHBOARD', 'ACTIONS', 'TELEMETRY'] as SubScreenCommand[]).map((tab) => (
            <button
              key={tab}
              id={`cmd-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-none uppercase tracking-widest transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#EAB308] text-black border border-[#EAB308] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'DASHBOARD' && '❖ Command HUD'}
              {tab === 'ACTIONS' && '⚡ Protocols'}
              {tab === 'TELEMETRY' && '📂 Telemetry'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- SCREEN 1: COMMAND HUD DASHBOARD --- */}
        {activeTab === 'DASHBOARD' && (
          <motion.div
            key="cmd-dash"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Col: Trajectory Telemetry Dial (Circular HUD) */}
            <div className="lg:col-span-4 bg-[#121212] rounded-none border border-white/10 p-6 flex flex-col items-center justify-between min-h-[380px] relative overflow-hidden">
              <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">SYS.DIAG.ROTATION</div>
              <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[9px] font-mono text-[#EAB308] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse"></span> ONLINE
              </div>

              <div className="w-full text-center mb-2 mt-4">
                <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-[0.2em]">Carbon Burn Rate</span>
                <h3 className="text-xl font-bold text-white tracking-widest uppercase mt-0.5 font-sans">Ecosystem Trajectory</h3>
              </div>

              {/* Glowing SVG Dial */}
              <div className="relative w-48 h-48 flex items-center justify-center my-4">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#222222"
                    strokeWidth="8"
                  />
                  {/* Track Glow Outline (thin minimalist) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#EAB308"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (remainingDays / 100))}
                    strokeLinecap="square"
                    className="opacity-15"
                  />
                  {/* Main Active Dial */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="url(#goldGrad)"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (remainingDays / 100))}
                    strokeLinecap="square"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Dial Metadata Display */}
                <div className="text-center z-10 flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white font-mono tracking-tighter">
                    {remainingDays}D
                  </span>
                  <span className="text-[9px] font-mono text-[#EAB308] font-bold tracking-[0.15em] uppercase mt-1">
                    REMAINING
                  </span>
                  <span className="text-[10px] font-sans text-zinc-500 mt-1 max-w-[120px] leading-tight uppercase font-bold tracking-wider">
                    BUDGET TRAJECTORY
                  </span>
                </div>
              </div>

              {/* Dial bottom stats panel */}
              <div className="w-full grid grid-cols-2 gap-2 text-center pt-4 border-t border-white/10 font-mono text-xs">
                <div className="border-r border-white/10">
                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider">Net Run-Rate</div>
                  <div className="text-sm font-extrabold text-[#EAB308] mt-0.5">{netCO2} kg/d</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider">Bio-Bonus</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">+{totalPoints} PTS</div>
                </div>
              </div>
            </div>

            {/* Middle Col: Top Emitters Panel & Status Alerts */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Status Alert Indicator */}
              <div className="bg-[#121212] rounded-none border border-white/10 p-5 relative overflow-hidden">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-neutral-900 border border-white/10 rounded-none text-[#EAB308] flex-shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-[0.18em] text-[#EAB308]">Tactical Intercept Matrix</h4>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Core monitors report localized emission peaks & enterprise shipping as primary anomalies. Deploy <strong className="text-white">protocols</strong> to expand grid stability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Column Graph: Top Emitters */}
              <div className="bg-[#121212] rounded-none border border-white/10 p-5 flex flex-col justify-between flex-1 min-h-[220px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-1">DIAGNOSTIC L4 // EMISSIONS</span>
                  <Flame className="w-4 h-4 text-[#EAB308]" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3 font-sans">Principal Emitters Base</h3>
                
                {/* Bars */}
                <div className="space-y-4 font-mono text-xs">
                  {[
                    { label: 'Corporate Tech Purchases', val: categories.corporate, color: 'bg-[#EAB308]' },
                    { label: 'Logistics Commutes', val: categories.transport, color: 'bg-white' },
                    { label: 'Utility Thermal Peaks', val: categories.energy, color: 'bg-zinc-400' },
                    { label: 'Staff Meal Procurement', val: categories.food, color: 'bg-zinc-600' }
                  ].map((bar, idx) => {
                    const percentage = Math.min(100, Math.max(15, (bar.val / 230) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase tracking-wider">
                          <span className="text-zinc-400 truncate max-w-[200px]">{bar.label}</span>
                          <span className="text-[#EAB308] font-black">{bar.val.toFixed(1)} kg</span>
                        </div>
                        <div className="h-2 w-full bg-black rounded-none overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className={`h-full ${bar.color} rounded-none`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Active Intercept Toggles */}
            <div className="lg:col-span-4 bg-[#121212] rounded-none border border-white/10 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-[9px] font-mono text-[#EAB308] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#EAB308] rounded-full animate-pulse"></span>
                ACTIVE PROTOCOLS STATUS
              </div>
              <h3 className="font-extrabold text-base text-white uppercase tracking-wider font-sans">Recommended Intercepts</h3>
              <p className="text-xs text-zinc-400 mt-2 mb-4 leading-relaxed">
                Trigger carbon mitigation directives live to secure system trajectory indices instantly.
              </p>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1">
                {COMMMAND_LIBRARY_ACTIONS.slice(0, 3).map((act) => (
                  <div 
                    key={act.id} 
                    className="p-3 bg-black border border-white/10 rounded-none flex justify-between items-center transition-all group hover:border-[#EAB308]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{act.name}</span>
                        <span className="text-[8px] font-mono bg-neutral-900 text-[#EAB308] px-1.5 py-0.5 border border-white/10 uppercase font-bold">
                          {act.difficulty}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono uppercase tracking-widest">Est: {act.co2Save} Carbon Net</div>
                    </div>
                    
                    <button
                      id={`hud-apply-${act.id}`}
                      onClick={() => handleApplyProtocol(act)}
                      disabled={activatedActionId === act.id}
                      className={`font-mono text-[9px] px-2.5 py-1.5 rounded-none border uppercase tracking-wider font-bold transition-all ${
                        activatedActionId === act.id
                          ? 'bg-[#EAB308] text-black border-[#EAB308]'
                          : 'bg-black text-[#EAB308] border-white/10 hover:border-[#EAB308] hover:bg-white/5'
                      }`}
                    >
                      {activatedActionId === act.id ? '✓ OK' : '⚡ DEPLOY'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 2: ALL PROTOCOLS LIBRARY --- */}
        {activeTab === 'ACTIONS' && (
          <motion.div
            key="cmd-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#121212] p-4 rounded-none border border-white/10">
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">Protocol Configuration Registry</h3>
                <p className="text-xs text-zinc-400 mt-1">Filter and deploy active ESG mitigation workflows relative to target nodes.</p>
              </div>

              {/* Combined Filters and Text Search Box */}
              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
                {/* Search Text Input Box */}
                <div className="flex items-center bg-black border border-white/10 hover:border-[#EAB308]/40 transition-colors px-3 py-1 text-[10px] uppercase font-mono w-full sm:w-64">
                  <span className="text-zinc-500 mr-2 font-bold font-mono">SEARCH:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. HVAC, logistics, cloud..."
                    className="bg-transparent border-0 outline-none text-white text-xs w-full py-1 normal-case placeholder:text-zinc-700"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="text-zinc-500 hover:text-white font-black text-xs px-1 pl-2"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Custom Selector Button Group */}
                <div className="flex bg-black p-1 rounded-none border border-white/15 font-mono text-[10px] shrink-0">
                  {['all', 'transport', 'energy', 'food'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActionCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-none transition-all uppercase font-bold tracking-widest cursor-pointer ${
                        actionCategoryFilter === cat
                          ? 'bg-[#EAB308] text-black font-black'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMMMAND_LIBRARY_ACTIONS
                .filter(a => actionCategoryFilter === 'all' || a.category === actionCategoryFilter)
                .filter(a => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return a.name.toLowerCase().includes(query) || 
                         a.desc.toLowerCase().includes(query) || 
                         a.category.toLowerCase().includes(query);
                })
                .map((act) => (
                  <div 
                    key={act.id}
                    id={`protocol-card-${act.id}`}
                    className="p-5 bg-[#121212] border border-white/10 hover:border-[#EAB308]/40 rounded-none flex flex-col justify-between min-h-[220px] transition-all group relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono text-[#EAB308] uppercase tracking-widest bg-neutral-900 px-2 py-0.5 rounded-none border border-white/10 font-bold">
                          {act.category}
                        </span>
                        <div className="flex gap-1.5">
                          <span className="text-[9px] font-mono text-white bg-zinc-800 px-1.5 py-0.5 rounded-none border border-white/10 uppercase font-bold">
                            {act.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-[#EAB308] transition-colors pt-1">
                        {act.name}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        {act.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center font-mono text-xs">
                      <div>
                        <div className="text-[8px] text-zinc-500 uppercase tracking-widest">Save Index</div>
                        <div className="font-extrabold text-white text-[11px]">{act.co2Save} CO₂</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-zinc-500 uppercase tracking-widest">Bonus Points</div>
                        <div className="font-extrabold text-[#EAB308] text-[11px]">+{act.points} PTS</div>
                      </div>
                      
                      <button
                        id={`btn-deploy-act-${act.id}`}
                        onClick={() => handleApplyProtocol(act)}
                        disabled={activatedActionId === act.id}
                        className={`px-3 py-1.5 rounded-none text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
                          activatedActionId === act.id
                            ? 'bg-zinc-800 text-zinc-400 border border-white/10'
                            : 'bg-black text-[#EAB308] border border-[#EAB308]/30 hover:bg-[#EAB308] hover:text-black hover:border-[#EAB308]'
                        }`}
                      >
                        {activatedActionId === act.id ? '✓ OK' : '⚡ DEPLOY'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 3: TELEMETRY DATA LOGS --- */}
        {activeTab === 'TELEMETRY' && (
          <motion.div
            key="cmd-telemetry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Custom Neoglow Trail Chart (SVG Spline) */}
            <div className="bg-[#121212] rounded-none border border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em]">DIAGNOSTIC SYSTEM SENSORS</div>
                  <h3 className="font-bold text-base text-white uppercase tracking-wider">Temporal Mitigation Telemetry</h3>
                </div>
                <div className="flex gap-4 font-mono text-[9px] text-zinc-400 bg-neutral-950 p-2 border border-white/10 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#EAB308] inline-block"></span> Carbon Offset Baseline
                  </div>
                </div>
              </div>

              {/* Glowing SVG Trail Map */}
              <div className="w-full h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((percent, idx) => (
                    <line
                      key={idx}
                      x1="0%"
                      y1={`${percent}%`}
                      x2="100%"
                      y2={`${percent}%`}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Glowing chart spline representing accumulated negative CO2 bounds */}
                  <path
                    d="M 10,135 Q 80,110 150,115 T 300,55 T 450,40"
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth="3.5"
                    strokeLinecap="square"
                  />
                  {/* Fill Area gradient under spline */}
                  <path
                    d="M 10,135 Q 80,110 150,115 T 300,55 T 450,40 L 450,150 L 10,150 Z"
                    fill="url(#goldAreaGrad)"
                    className="opacity-10"
                  />
                  <defs>
                    <linearGradient id="goldAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>

                  {/* Nodes */}
                  <circle cx="10" cy="135" r="4" fill="#000000" stroke="#EAB308" strokeWidth="2" />
                  <circle cx="120" cy="113" r="4" fill="#000000" stroke="#EAB308" strokeWidth="2" />
                  <circle cx="230" cy="95" r="4" fill="#000000" stroke="#EAB308" strokeWidth="2" />
                  <circle cx="340" cy="50" r="4" fill="#000000" stroke="#EAB308" strokeWidth="2" />
                  <circle cx="450" cy="40" r="4" fill="#EAB308" stroke="#FFFFFF" strokeWidth="2" className="animate-pulse" />
                </svg>

                {/* Legend badges */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 bg-black border border-white/10 p-2.5 rounded-none font-mono text-[8px] tracking-wider pointer-events-none">
                  <div className="text-[#EAB308] font-bold uppercase">STABLE REDUCTION ACTIVE</div>
                  <div className="text-zinc-500 uppercase mt-0.5">GRID INTEGRATION: 280G/KWH LOCK</div>
                </div>
              </div>
            </div>

            {/* Telemetry Database Logs */}
            <div className="bg-[#121212] rounded-none border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-white uppercase tracking-wider">Mitigation Timeline Database</h3>
                <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#EAB308] bg-black p-1 px-2 border border-white/10">{logs.length} RECORDS COMPLIANT</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-500 pb-3">
                      <th className="py-2.5 uppercase tracking-wider text-[10px]">Timestamp</th>
                      <th className="py-2.5 uppercase tracking-wider text-[10px]">Category</th>
                      <th className="py-2.5 uppercase tracking-wider text-[10px]">Description / Intercept Sequence</th>
                      <th className="py-2.5 text-right uppercase tracking-wider text-[10px]">Mitigation Weight</th>
                      <th className="py-2.5 text-right uppercase tracking-wider text-[10px]">Points</th>
                      <th className="py-3 text-center uppercase tracking-wider text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {logs.map((log) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-white/5 group"
                        >
                          <td className="py-3 text-zinc-400 flex items-center gap-2 font-mono whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            {log.date}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-none text-[8px] uppercase tracking-widest font-extrabold border ${
                              log.category === 'transport' ? 'bg-black text-[#EAB308] border-[#EAB308]/30' :
                              log.category === 'energy' ? 'bg-black text-white border-white/35' :
                              log.category === 'food' ? 'bg-black text-zinc-400 border-zinc-500/35' :
                              'bg-black text-amber-500 border-amber-500/35'
                            }`}>
                              {log.category}
                            </span>
                          </td>
                          <td className="py-3 font-sans text-zinc-200 group-hover:text-[#EAB308] transition-colors">
                            {log.description}
                            <span className="block text-[9px] font-mono text-zinc-500 uppercase mt-1">SOURCE NODE: {log.source}</span>
                          </td>
                          <td className="py-3 text-right font-extrabold text-[#EAB308] font-mono">
                            {log.co2Amount < 0 ? `${log.co2Amount.toFixed(1)} kg` : `+${log.co2Amount.toFixed(1)} kg`}
                          </td>
                          <td className="py-3 text-right text-white font-extrabold font-mono">
                            +{log.pointsEarned}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              id={`purge-btn-${log.id}`}
                              onClick={() => onDeleteLog(log.id)}
                              title="Purge Telemetry Node"
                              className="p-1 px-2.5 rounded-none bg-black border border-white/10 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all font-mono text-[9px] uppercase"
                            >
                              Purge
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
