import React, { useState } from 'react';
import { WorkspaceModule, ActionLog, ConnectionItem, EcosphereTree } from './types';
import { 
  INITIAL_ACTION_LOGS, 
  INITIAL_CONNECTIONS, 
  INITIAL_TREES 
} from './data';
import CommandWorkspace from './components/CommandWorkspace';
import EcosphereWorkspace from './components/EcosphereWorkspace';
import GreenFlowWorkspace from './components/GreenFlowWorkspace';
import { 
  Compass, 
  TreePine, 
  BarChart3, 
  User, 
  Building2, 
  RotateCcw, 
  Sparkles, 
  Leaf, 
  Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Shared global state
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceModule>('COMMAND');
  const [logs, setLogs] = useState<ActionLog[]>(INITIAL_ACTION_LOGS);
  const [connections, setConnections] = useState<ConnectionItem[]>(INITIAL_CONNECTIONS);
  const [trees, setTrees] = useState<EcosphereTree[]>(INITIAL_TREES);
  
  // Dynamic Point engine
  const [totalPoints, setTotalPoints] = useState<number>(1250);

  // Profile selection
  const [profileMode, setProfileMode] = useState<'PERSONAL' | 'CORPORATE'>('PERSONAL');

  // Shared state mutation handlers
  const handleAddLog = (newLog: Omit<ActionLog, 'id' | 'date'>) => {
    const freshLog: ActionLog = {
      ...newLog,
      id: `log-added-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setLogs((prev) => [freshLog, ...prev]);
    // Accumulate points if log has positive earned PTS
    setTotalPoints((prev) => prev + freshLog.pointsEarned);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleToggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: !c.connected, lastSync: 'Just Now' } : c))
    );
  };

  const handlePlantTree = (species: 'Cypress' | 'Bonsai' | 'Cherry Blossom' | 'Oak' | 'Maple', cost: number, customName?: string) => {
    const nextTree: EcosphereTree = {
      id: `tree-planted-${Date.now()}`,
      species,
      size: parseFloat((0.85 + Math.random() * 0.5).toFixed(2)),
      plantedAt: new Date().toISOString().split('T')[0],
      x: Math.floor(10 + Math.random() * 80), // random x between 10% and 90%
      y: Math.floor(4 + Math.random() * 14), // random height y clearance for base
      hues: species === 'Cherry Blossom' ? ['#db1a7d', '#b0105d', '#e970cb'] :
            species === 'Maple' ? ['#bd111c', '#8d0e19', '#f36561'] :
            species === 'Oak' ? ['#057857', '#065f46', '#14b8a6'] :
            ['#047857', '#035d46', '#059669'],
      customName: customName || undefined
    };
    setTrees((prev) => [...prev, nextTree]);
    setTotalPoints((prev) => prev - cost);
  };

  const handleResetState = () => {
    if (confirm('Verify: Reset state metrics to default blueprints?')) {
      setLogs(INITIAL_ACTION_LOGS);
      setConnections(INITIAL_CONNECTIONS);
      setTrees(INITIAL_TREES);
      setTotalPoints(1250);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0A0A0A] text-[#FFFFFF] overflow-x-hidden antialiased font-sans">
      {/* Keyboard Bypass Skip Link - WCAG AA Spec */}
      <a 
        href="#main-content-stage" 
        className="sr-only focus:not-sr-only absolute top-4 left-4 bg-[#EAB308] text-black text-[10px] font-mono font-black p-3.5 border border-black z-[999] uppercase tracking-widest outline-none focus:ring-2 focus:ring-white"
      >
        Skip to Main Content
      </a>

      {/* LEFT SIDEBAR CONTROLS & RUNTIME PROFILE CONTROLLERS */}
      <aside className="w-full lg:w-80 bg-[#0A0A0A] border-b lg:border-b-0 lg:border-r border-white/10 p-4 md:p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6 lg:space-y-8">
          {/* Main Logo & Platform branding - Row layout on mobile, column on desktop */}
          <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 border-b lg:border-b-0 border-white/5 pb-4 lg:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EAB308] flex items-center justify-center text-black font-black text-xl tracking-tighter transition-transform duration-200 hover:scale-105">
                TF
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-black text-white tracking-widest uppercase leading-none">TerraFlow</h1>
                <span className="text-[9px] uppercase font-mono text-[#EAB308] font-bold tracking-[0.18em] block mt-1">Carbon ESG Command</span>
              </div>
            </div>

            {/* Micro identity indicator on mobile/tablet */}
            <div className="flex lg:hidden items-center gap-2 bg-[#121212] p-1.5 px-3 border border-white/10 text-[9px] font-mono">
              <span className="text-zinc-500 uppercase">Profile:</span>
              <span className="text-[#EAB308] font-bold">{profileMode === 'PERSONAL' ? 'Alex' : 'Apex Corp'}</span>
            </div>
          </div>

          {/* Interactive Profile & Persona Switcher */}
          <div className="bg-[#121212] p-4 rounded-none border border-white/10 text-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active Workspace Identity</span>
              <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></span>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-black border border-white/10 rounded-none text-[#EAB308]">
                {profileMode === 'PERSONAL' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5 text-[#EAB308]" />}
              </div>
              <div>
                <strong className="block text-white uppercase font-bold tracking-wider text-xs md:text-sm">
                  {profileMode === 'PERSONAL' ? 'Alex Mercer' : 'Apex Global Corp'}
                </strong>
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tight block mt-0.5">
                  {profileMode === 'PERSONAL' ? 'Eco-Steward // Tier III' : 'ESG Lead Compliance Auditor'}
                </span>
              </div>
            </div>

            {/* Profile Persona switcher triggers */}
            <div className="flex gap-1.5 pt-2 border-t border-white/10">
              <button
                id="persona-personal"
                onClick={() => {
                  setProfileMode('PERSONAL');
                  setActiveWorkspace('ECOSPHERE');
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-none text-[9px] font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  profileMode === 'PERSONAL'
                    ? 'bg-[#EAB308] text-black border-[#EAB308] scale-100 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-black text-zinc-400 border-white/10 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Steward
              </button>
              <button
                id="persona-corporate"
                onClick={() => {
                  setProfileMode('CORPORATE');
                  setActiveWorkspace('GREENFLOW');
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-none text-[9px] font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  profileMode === 'CORPORATE'
                    ? 'bg-[#EAB308] text-black border-[#EAB308] scale-100 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-black text-zinc-400 border-white/10 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Corporate
              </button>
            </div>
          </div>

          {/* Interactive Workspace modules switcher */}
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:space-y-2 pb-2 lg:pb-0 scrollbar-none">
            <span className="hidden lg:block text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em] pl-2 mb-3">SYSTEM SECTIONS</span>
            
            <button
              id="ws-nav-command"
              onClick={() => setActiveWorkspace('COMMAND')}
              className={`flex-1 lg:w-full flex items-center justify-between p-2.5 lg:p-3.5 rounded-none border text-left transition-all duration-250 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 whitespace-nowrap lg:whitespace-normal ${
                activeWorkspace === 'COMMAND'
                  ? 'bg-[#EAB308] text-black border-[#EAB308] font-bold'
                  : 'bg-transparent text-zinc-400 border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <Compass className={`w-4 h-4 lg:w-5 h-5 ${activeWorkspace === 'COMMAND' ? 'text-black' : 'text-[#EAB308]'}`} />
                <span className="text-[10px] lg:text-xs uppercase tracking-wider font-bold">HUD</span>
                <span className="hidden sm:inline-block text-[10px] lg:text-xs uppercase tracking-wider font-bold"> Command</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-mono px-1.5 py-0.5 border ${
                activeWorkspace === 'COMMAND' ? 'bg-black text-[#EAB308] border-[#EAB308]' : 'bg-black text-zinc-400 border-white/10'
              }`}>CORE</span>
            </button>

            <button
              id="ws-nav-ecosphere"
              onClick={() => setActiveWorkspace('ECOSPHERE')}
              className={`flex-1 lg:w-full flex items-center justify-between p-2.5 lg:p-3.5 rounded-none border text-left transition-all duration-250 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 whitespace-nowrap lg:whitespace-normal ${
                activeWorkspace === 'ECOSPHERE'
                  ? 'bg-[#EAB308] text-black border-[#EAB308] font-bold'
                  : 'bg-transparent text-zinc-400 border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <TreePine className={`w-4 h-4 lg:w-5 h-5 ${activeWorkspace === 'ECOSPHERE' ? 'text-black' : 'text-[#EAB308]'}`} />
                <span className="text-[10px] lg:text-xs uppercase tracking-wider font-bold">Grove</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-mono px-1.5 py-0.5 border ${
                activeWorkspace === 'ECOSPHERE' ? 'bg-black text-[#EAB308] border-[#EAB308]' : 'bg-black text-zinc-400 border-white/10'
              }`}>GROW</span>
            </button>

            <button
              id="ws-nav-greenflow"
              onClick={() => setActiveWorkspace('GREENFLOW')}
              className={`flex-1 lg:w-full flex items-center justify-between p-2.5 lg:p-3.5 rounded-none border text-left transition-all duration-250 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 whitespace-nowrap lg:whitespace-normal ${
                activeWorkspace === 'GREENFLOW'
                  ? 'bg-[#EAB308] text-black border-[#EAB308] font-bold'
                  : 'bg-transparent text-zinc-400 border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <BarChart3 className={`w-4 h-4 lg:w-5 h-5 ${activeWorkspace === 'GREENFLOW' ? 'text-black' : 'text-[#EAB308]'}`} />
                <span className="text-[10px] lg:text-xs uppercase tracking-wider font-bold">ESG</span>
                <span className="hidden sm:inline-block text-[10px] lg:text-xs uppercase tracking-wider font-bold"> Accounting</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-mono px-1.5 py-0.5 border ${
                activeWorkspace === 'GREENFLOW' ? 'bg-black text-[#EAB308] border-[#EAB308]' : 'bg-black text-zinc-400 border-white/10'
              }`}>SEC</span>
            </button>
          </nav>
        </div>

        {/* Workspace global utilities/reset metrics triggers */}
        <div className="pt-4 lg:pt-6 border-t border-white/10 mt-4 lg:mt-8 space-y-4 font-mono text-[10px] text-zinc-500">
          <div className="flex justify-between items-center bg-[#121212] p-2.5 border border-white/10">
            <span>NET OFFSET:</span>
            <strong className="text-[#EAB308] font-sans font-extrabold text-sm">
              -{Math.abs(logs.reduce((sum, l) => sum + (l.co2Amount < 0 ? l.co2Amount : 0), 0)).toFixed(1)} KG
            </strong>
          </div>
          
          <button
            id="global-reset-state"
            onClick={handleResetState}
            className="w-full py-2.5 rounded-none bg-neutral-900 hover:bg-neutral-850 hover:text-white text-zinc-400 border border-white/15 transition-all duration-200 flex items-center justify-center gap-2 font-mono uppercase font-bold text-[9px] tracking-widest cursor-pointer hover:scale-[1.01]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> REBOOT BLUEPRINT SYSTEM
          </button>
          
          <div className="text-center text-[9px] leading-relaxed hidden lg:block text-zinc-600 uppercase tracking-wider">
            EPA secure ESG compliant environment. All models validated under compliance cycle § 40.23.
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE GRAPHICAL CONTENT FIELD - WCAG AA Landmark */}
      <main id="main-content-stage" className="flex-1 bg-transparent p-4 md:p-8 flex flex-col justify-between max-w-7xl mx-auto w-full">
        {/* Workspace stage dynamic headers & notification log tickers */}
        <div className="bg-[#121212] mb-6 p-4 rounded-none border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1 px-2.5 rounded-none bg-[#EAB308] text-black text-[9px] font-mono font-bold tracking-widest">HUD.V2</span>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
              ACTIVE TELEMETRY: <strong className="text-white font-bold">{activeWorkspace === 'COMMAND' ? 'COMMAND COMPLIANCE MONITOR' : activeWorkspace === 'ECOSPHERE' ? 'HABIT RESILIENCY DEPLOYMENT' : 'CORPORATE SEC JOURNAL AUDITING'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>TOTAL BALANCE: <strong className="text-white font-bold">{totalPoints.toLocaleString()}</strong> PTS</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]"></span> LEDGER: <strong className="text-white font-bold">{logs.length} ENTRIES</strong>
            </div>
          </div>
        </div>

        {/* Core dynamic workspace mounting panels */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeWorkspace === 'COMMAND' && (
              <motion.div
                key="command-screen"
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.2 }}
              >
                <CommandWorkspace 
                  logs={logs}
                  onAddLog={handleAddLog}
                  onDeleteLog={handleDeleteLog}
                  totalPoints={totalPoints}
                />
              </motion.div>
            )}

            {activeWorkspace === 'ECOSPHERE' && (
              <motion.div
                key="ecosphere-screen"
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.2 }}
              >
                <EcosphereWorkspace 
                  logs={logs}
                  onAddLog={handleAddLog}
                  trees={trees}
                  onPlantTree={handlePlantTree}
                  totalPoints={totalPoints}
                />
              </motion.div>
            )}

            {activeWorkspace === 'GREENFLOW' && (
              <motion.div
                key="greenflow-screen"
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.2 }}
              >
                <GreenFlowWorkspace 
                  logs={logs}
                  connections={connections}
                  onToggleConnection={handleToggleConnection}
                  onAddLog={handleAddLog}
                  onDeleteLog={handleDeleteLog}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global bottom bar status detailers */}
        <footer className="mt-8 border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center text-[9px] text-zinc-500 font-mono tracking-widest uppercase gap-2 text-center md:text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-ping"></span>
            SYS STATUS: SECURE HTTPS STREAM // DISCLOSURE REPORT COMPILED LOCK
          </div>
          <div>
            © 2026 TerraFlow Carbon ESG. Standardized under EPA Section § 40.23 GHG protocols.
          </div>
        </footer>
      </main>
    </div>
  );
}
