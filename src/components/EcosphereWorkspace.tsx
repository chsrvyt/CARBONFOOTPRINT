import React, { useState } from 'react';
import { ActionLog, EcosphereTree, SubScreenEcosphere } from '../types';
import { 
  Sprout, 
  Leaf, 
  Trash2, 
  Award, 
  Sparkles, 
  PlusCircle, 
  Calendar, 
  ArrowUpRight, 
  Check, 
  Info, 
  X, 
  TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EcosphereWorkspaceProps {
  logs: ActionLog[];
  onAddLog: (log: Omit<ActionLog, 'id' | 'date'>) => void;
  trees: EcosphereTree[];
  onPlantTree: (species: 'Cypress' | 'Bonsai' | 'Cherry Blossom' | 'Oak' | 'Maple', cost: number, customName?: string) => void;
  totalPoints: number;
}

// Quick activity habit log templates defined at module-level to optimize memory of execution loops
const QUICK_ACTIVITIES = [
  { name: 'Fully Plant-Based Meal Log', pts: 30, co2: -2.1, cat: 'food' },
  { name: 'Walked or Commuted via Bicycle', pts: 50, co2: -4.5, cat: 'transport' },
  { name: 'Eliminated Grid Phantom Idle Power', pts: 25, co2: -1.2, cat: 'energy' },
  { name: 'Recycled Organic Kitchen Compost', pts: 15, co2: -1.0, cat: 'food' },
  { name: 'Hang-Dried Laundry Sequence', pts: 40, co2: -2.3, cat: 'energy' },
];

// Greenhouse sapling shop catalog index
const TREE_CATALOG = [
  { species: 'Cypress', cost: 300, desc: 'Tall, evergreen conifer', hues: ['#047857', '#065f46', '#059669'] },
  { species: 'Oak', cost: 500, desc: 'Majestic hardwood dome', hues: ['#0f766e', '#115e59', '#14b8a6'] },
  { species: 'Cherry Blossom', cost: 400, desc: 'Delicate pink spring leaves', hues: ['#db2777', '#be185d', '#f472b6'] },
  { species: 'Maple', cost: 350, desc: 'Rich autumnal red glow', hues: ['#b91c1c', '#991b1b', '#f87171'] },
];

export default function EcosphereWorkspace({
  logs,
  onAddLog,
  trees,
  onPlantTree,
  totalPoints
}: EcosphereWorkspaceProps) {
  const [activeTab, setActiveTab3] = useState<SubScreenEcosphere>('GROVE');
  const [showLogModal, setShowLogModal] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null);
  const [saplingNickname, setSaplingNickname] = useState('');

  const handleQuickLog = (act: typeof QUICK_ACTIVITIES[0]) => {
    onAddLog({
      category: act.cat as any,
      description: `Ecosphere habit logged: ${act.name}`,
      co2Amount: act.co2,
      pointsEarned: act.pts,
      source: 'Food Log',
      status: 'completed'
    });
    setSuccessAnimation(`Habit logged successfully! +${act.pts} PTS Balance.`);
    setTimeout(() => setSuccessAnimation(null), 2500);
    setShowLogModal(false);
  };

  const handleBuyTree = (item: typeof TREE_CATALOG[0]) => {
    if (totalPoints < item.cost) {
      alert(`Insufficient points! You need ${item.cost} PTS, but currently have ${totalPoints} PTS.`);
      return;
    }
    // Plants tree visually
    onPlantTree(item.species as any, item.cost, saplingNickname || undefined);
    const msg = saplingNickname 
      ? `Planted "${saplingNickname}" (${item.species})! Watch it blossom in your Grove canvas.`
      : `Planted a young ${item.species}! Watch it blossom in your Grove canvas.`;
    setSuccessAnimation(msg);
    setSaplingNickname('');
    setTimeout(() => setSuccessAnimation(null), 3000);
  };

  return (
    <div className="font-karla text-white bg-[#0A0A0A] p-0 md:p-2 rounded-none overflow-hidden relative">
      {/* Absolute success notifications banner */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-50 bg-[#EAB308] text-black font-mono font-bold text-xs p-4 rounded-none shadow-lg flex items-center justify-between uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-black" />
              <span>{successAnimation}</span>
            </div>
            <button onClick={() => setSuccessAnimation(null)} className="text-black hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with high organic styling */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-6 mb-8 border-b border-white/10 gap-4">
        <div className="relative">
          <div className="absolute -top-7 left-0 text-[40px] md:text-[56px] font-black text-stroke-gray uppercase tracking-tighter select-none font-sans pointer-events-none opacity-20">
            ECOSPHERE
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#EAB308] uppercase tracking-[0.2em] relative z-10 pl-1">
            <Sprout className="w-3.5 h-3.5 text-[#EAB308]" />
            BIOSPHERE MODEL // DEPLOYMENT TARGETS
          </div>
          <h2 className="text-3xl font-black text-white tracking-widest mt-1.5 relative z-10 uppercase">
            THE LIVING <span className="text-[#EAB308]">GROVE</span>
          </h2>
        </div>

        {/* Workspace Swapper Tab group */}
        <div className="flex bg-neutral-950 p-1 rounded-none border border-white/10 font-mono text-[10px]">
          {(['GROVE', 'METRICS'] as SubScreenEcosphere[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab3(tab)}
              className={`px-5 py-2.5 rounded-none uppercase tracking-widest transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#EAB308] text-black border border-[#EAB308] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'GROVE' && '🌲 Virtual Grove'}
              {tab === 'METRICS' && '📈 Habits & Streak'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- PART 1: THE LIVING CANVASES --- */}
        {activeTab === 'GROVE' && (
          <motion.div
            key="grove-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Main Interactive Canvas Area */}
            <div className="bg-neutral-950 rounded-none border border-white/10 p-6 relative h-[340px] md:h-[400px] flex flex-col justify-between overflow-hidden shadow-sm">
              
              {/* Point telemetry tags */}
              <div className="flex justify-between items-start z-10">
                <div className="bg-black/80 border border-white/10 px-4 py-2.5 rounded-none">
                  <span className="text-[8px] uppercase font-bold text-zinc-500 block tracking-widest font-mono">ECO-BALANCE</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-[#EAB308] font-mono tracking-tighter">
                      {totalPoints.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 font-mono">PTS</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id="ecosphere-log-button"
                    onClick={() => setShowLogModal(true)}
                    className="bg-black text-[#EAB308] border border-white/15 hover:border-[#EAB308] font-bold text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-none transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Log Habitat Habit
                  </button>
                </div>
              </div>

              {/* Central canvas SVG trees renderer */}
              <div className="absolute inset-0 bottom-0 top-0 pointer-events-none flex items-end">
                <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid system backgrounds */}
                  <defs>
                    <pattern id="canvas-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="80%" fill="url(#canvas-grid)" />

                  {/* Wireframe ground outline curves */}
                  <path d="M-50,380 Q100,320 300,360 T800,340 T1200,350 L1200,500 L-50,500 Z" fill="rgba(255,255,255,0.02)" />
                  <path d="M-50,370 Q200,350 500,330 T900,350 T1300,320 L1300,500 L-50,500 Z" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                  
                  {/* Solid dark soil base */}
                  <rect x="0" y="340" width="100%" height="60" fill="#0A0A0A" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                  {/* Render dynamic list of interactive trees */}
                  {trees.map((tree) => {
                    const treeHeight = 70 * tree.size;
                    const xPos = tree.x; // percentage width
                    const yPos = 350 - tree.y; // custom position height
                    
                    return (
                      <g key={tree.id}>
                        {/* Tree placement outline effect */}
                        <ellipse cx={`${xPos}%`} cy={yPos} rx={22 * tree.size} ry={6 * tree.size} fill="#ffffff" opacity="0.08" />
                        
                        {/* Interactive dynamic tree model trunk */}
                        <rect x={`calc(${xPos}% - ${4 * tree.size}px)`} y={yPos - treeHeight} width={8 * tree.size} height={treeHeight} fill="#52525B" rx="1.5" />
                        
                        {/* Leaves foliage based on species */}
                        {tree.species === 'Cypress' ? (
                          <polygon 
                            points={`
                              calc(${xPos}%),${yPos - treeHeight - 15} 
                              calc(${xPos}% - ${18 * tree.size}px),${yPos - 20} 
                              calc(${xPos}% + ${18 * tree.size}px),${yPos - 20}
                            `}
                            fill={tree.hues ? tree.hues[0] : '#EAB308'}
                          />
                        ) : tree.species === 'Oak' ? (
                          <>
                            <circle cx={`calc(${xPos}% - ${12 * tree.size}px)`} cy={yPos - treeHeight} r={22 * tree.size} fill={tree.hues ? tree.hues[0] : '#EAB308'} />
                            <circle cx={`calc(${xPos}% + ${12 * tree.size}px)`} cy={yPos - treeHeight} r={22 * tree.size} fill={tree.hues ? tree.hues[1] : '#FFFFFF'} />
                            <circle cx={`calc(${xPos}%)`} cy={yPos - treeHeight - (10 * tree.size)} r={24 * tree.size} fill={tree.hues ? tree.hues[2] : '#CCCCCC'} />
                          </>
                        ) : tree.species === 'Cherry Blossom' ? (
                          <>
                            <circle cx={`calc(${xPos}% - ${10 * tree.size}px)`} cy={yPos - treeHeight} r={18 * tree.size} fill={tree.hues ? tree.hues[0] : '#EAB308'} />
                            <circle cx={`calc(${xPos}% + ${10 * tree.size}px)`} cy={yPos - treeHeight} r={18 * tree.size} fill={tree.hues ? tree.hues[1] : '#FFFFFF'} />
                            <circle cx={`calc(${xPos}%)`} cy={yPos - treeHeight - (8 * tree.size)} r={20 * tree.size} fill={tree.hues ? tree.hues[2] : '#222222'} />
                          </>
                        ) : (
                          // Maple (rich red pointy maple crowns)
                          <>
                            <polygon points={`calc(${xPos}%),${yPos - treeHeight - 20} calc(${xPos}% - ${15 * tree.size}px),${yPos - treeHeight + 10} calc(${xPos}% + ${15 * tree.size}px),${yPos - treeHeight + 10}`} fill={tree.hues ? tree.hues[0] : '#EAB308'} />
                            <polygon points={`calc(${xPos}% - ${8 * tree.size}px),${yPos - treeHeight - 5} calc(${xPos}% - ${22 * tree.size}px),${yPos - 15} calc(${xPos}% + ${5 * tree.size}px),${yPos - 15}`} fill={tree.hues ? tree.hues[1] : '#FFFFFF'} />
                            <polygon points={`calc(${xPos}% + ${8 * tree.size}px),${yPos - treeHeight - 5} calc(${xPos}% - ${5 * tree.size}px),${yPos - 15} calc(${xPos}% + ${22 * tree.size}px),${yPos - 15}`} fill={tree.hues ? tree.hues[2] : '#555555'} />
                          </>
                        )}
                        
                        {/* Text marker of tree species on hover */}
                        <text x={`${xPos}%`} y={yPos + 18} textAnchor="middle" fill="#EAB308" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                          {tree.customName ? `"${tree.customName.toUpperCase()}"` : tree.species.toUpperCase()}
                        </text>
                        {tree.customName && (
                          <text x={`${xPos}%`} y={yPos + 28} textAnchor="middle" fill="#71717A" fontSize="8" fontWeight="bold" fontFamily="monospace">
                            {tree.species.toUpperCase()}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Canvas Overlay Labels */}
              <div className="mt-auto z-10 flex w-full justify-between items-center text-[10px] font-mono text-zinc-500 pt-2 uppercase tracking-wider">
                <span>Active Habitat Canopy: <strong className="text-white">{trees.length} Trees</strong></span>
                <span className="flex items-center gap-1.5 text-[#EAB308] font-bold bg-black px-3 py-1.5 border border-white/10">
                  <Award className="w-3.5 h-3.5" /> High Canopy Density
                </span>
              </div>
            </div>

            {/* Tree Catalog - Market Selector */}
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white mb-1 font-sans">Greenhouse Sapling Market</h3>
              <p className="text-xs text-zinc-500 mb-4">Invest your habit points here to propagate real trees inside the simulated environment:</p>
              
              {/* Micro interactive text input field for tree customization */}
              <div className="bg-neutral-950 border border-white/5 p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-[#EAB308] uppercase tracking-wider block">Custom Commemorative Planting Tag</span>
                  <p className="text-xs text-zinc-400">Dedicate or label your next planted tree node (adds a custom sign in the virtual grove):</p>
                </div>
                <div className="w-full md:w-auto flex items-center bg-black border border-white/10 hover:border-[#EAB308]/40 transition-colors">
                  <label htmlFor="sapling-nickname-input" className="text-[10px] font-mono text-zinc-500 pl-3 uppercase cursor-pointer shrink-0">LABEL:</label>
                  <input
                    id="sapling-nickname-input"
                    type="text"
                    value={saplingNickname}
                    onChange={(e) => setSaplingNickname(e.target.value)}
                    placeholder="e.g. Hope Cypress"
                    className="bg-transparent border-0 outline-none text-xs text-white p-2.5 font-sans font-medium w-full md:w-60 placeholder:text-zinc-700"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TREE_CATALOG.map((item) => {
                  const canAfford = totalPoints >= item.cost;
                  return (
                    <div 
                      key={item.species}
                      className="bg-[#121212] border border-white/10 p-4 rounded-none flex flex-col justify-between hover:border-[#EAB308]/40 transition-all group"
                    >
                      <div>
                        {/* Mini visual tree preview icon mapping colors */}
                        <div className="w-10 h-10 rounded-none flex items-center justify-center mb-3 bg-neutral-900 border border-white/5">
                          <Leaf className="w-5 h-5 text-[#EAB308]" />
                        </div>
                        <h4 className="font-black text-xs text-white uppercase tracking-wider">{item.species} Sapling</h4>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-tight font-sans">{item.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-white/15 mt-4 flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-[#EAB308]">{item.cost} PTS</span>
                        <button
                          id={`plant-tree-${item.species.toLowerCase()}`}
                          onClick={() => handleBuyTree(item)}
                          className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1.5 rounded-none border transition-all ${
                            canAfford 
                              ? 'bg-black text-[#EAB308] border-[#EAB308]/40 hover:bg-[#EAB308] hover:text-black hover:border-[#EAB308]'
                              : 'bg-zinc-900 text-zinc-600 border-white/5 cursor-not-allowed'
                          }`}
                        >
                          PLANT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PART 2: STREAKS & HABITS METRICS --- */}
        {activeTab === 'METRICS' && (
          <motion.div
            key="metrics-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Habits tracker streak card */}
            <div className="lg:col-span-4 bg-[#121212] border border-white/10 rounded-none p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#EAB308]">HABIT PROGRESSION</span>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider mt-1 mb-3">7-Day Habitation Streak</h3>
                
                <div className="flex justify-between items-center mb-6 bg-black p-4 rounded-none border border-white/10">
                  <div className="text-3xl font-black text-white font-mono tracking-tighter">7 <span className="text-xs font-bold text-[#EAB308]/80 font-mono tracking-widest">DAYS</span></div>
                  <div className="text-right text-[9px] font-mono text-zinc-400 leading-normal uppercase tracking-wider">
                    <span className="font-bold text-[#EAB308]">100% Habit Lock</span><br />
                    Reductions verified
                  </div>
                </div>

                {/* Circles for days of current week */}
                <div className="flex justify-between gap-1 mt-2">
                  {[
                    { d: 'M', checked: true },
                    { d: 'T', checked: true },
                    { d: 'W', checked: true },
                    { d: 'T', checked: true },
                    { d: 'F', checked: true },
                    { d: 'S', checked: false },
                    { d: 'S', checked: false },
                  ].map((day, ix) => (
                    <div key={ix} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-8 h-8 rounded-none flex items-center justify-center border text-[10px] font-bold tracking-wider font-mono transition-all ${
                        day.checked 
                          ? 'bg-[#EAB308] border-[#EAB308] text-black font-black'
                          : 'bg-black border-white/10 text-zinc-500'
                      }`}>
                        {day.checked ? <Check className="w-3.5 h-3.5" /> : day.d}
                      </div>
                      <span className="text-[8px] text-zinc-500 font-bold font-mono uppercase">{day.d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6 text-[10px] text-zinc-500 font-mono flex items-start gap-1.5 leading-normal uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-[#EAB308] flex-shrink-0" />
                <span>Maintain daily activity feeds (such as walk/compost) to compound streak indices.</span>
              </div>
            </div>

            {/* Spline Chart: Monthly reduction performance */}
            <div className="lg:col-span-8 bg-[#121212] border border-white/10 rounded-none p-5 flex flex-col justify-between shadow-sm min-h-[300px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">HISTORIC TREND</span>
                    <h3 className="font-extrabold text-base text-white uppercase tracking-wider mt-1 font-sans">Monthly Habit Impact Reductions</h3>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-black bg-[#EAB308] px-2.5 py-1 rounded-none border border-[#EAB308] flex items-center gap-1 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" /> High Capture Rate
                  </span>
                </div>

                <div className="h-44 relative mt-4">
                  {/* High Quality Styled Area Chart */}
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="goldImpactArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EAB308" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid */}
                    <line x1="0" y1="37" x2="500" y2="37" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="112" x2="500" y2="112" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Chart Gradient Path */}
                    <path
                      d="M 5,140 C 80,100 150,115 220,60 C 300,75 380,30 495,15"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="2.5"
                      strokeLinecap="square"
                    />
                    <path
                      d="M 5,140 C 80,100 150,115 220,60 C 300,75 380,30 495,15 L 495,150 L 5,150 Z"
                      fill="url(#goldImpactArea)"
                    />

                    {/* Nodes detailing milestones */}
                    <circle cx="220" cy="60" r="4" fill="#EAB308" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="495" cy="15" r="4" fill="#FFFFFF" stroke="#EAB308" strokeWidth="2" />
                  </svg>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between text-[9px] text-zinc-500 font-bold mt-2 font-mono px-2 uppercase tracking-widest">
                    <span>JAN</span>
                    <span>FEB</span>
                    <span>MAR</span>
                    <span>APR</span>
                    <span>MAY</span>
                    <span>JUN (CURRENT)</span>
                  </div>
                </div>
              </div>

              {/* Milestones timeline overview */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-4 font-mono text-[10px] uppercase tracking-wider">
                <div>
                  <div className="text-zinc-500 font-medium">Core Milestone: Sapling Bloom</div>
                  <div className="font-extrabold text-white mt-0.5">Unlocked 4 major tree varieties</div>
                </div>
                <div>
                  <div className="text-zinc-500 font-medium">Reduction Yield Index</div>
                  <div className="font-extrabold text-[#EAB308] mt-0.5">32.4 kg CO₂/month savings</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING MODAL: LOG TODAY'S IMPACT HABITS --- */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B0B0B] rounded-none border border-white/15 p-6 max-w-md w-full relative z-10 text-white"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-[#EAB308] font-mono font-bold text-xs uppercase tracking-wider">
                  <Sprout className="w-5 h-5" /> Log Habit Sequence
                </div>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="p-1 px-3 rounded-none bg-zinc-950 border border-white/10 hover:border-white text-xs font-mono font-bold text-zinc-400"
                >
                  Close
                </button>
              </div>

              <h3 className="font-black text-sm uppercase tracking-wider mb-1">Daily Action Ingestion</h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">
                Select your completed environmental routine behaviors to register impact balance indices:
              </p>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {QUICK_ACTIVITIES.map((act) => (
                  <button
                    key={act.name}
                    id={`quick-log-${act.name.toLowerCase().replace(/ /g, '-')}`}
                    onClick={() => handleQuickLog(act)}
                    className="w-full p-3.5 bg-[#121212] hover:bg-zinc-900 border border-white/10 rounded-none text-left flex justify-between items-center transition-all group"
                  >
                    <div>
                      <div className="font-bold text-xs text-white uppercase group-hover:text-[#EAB308] transition-colors">{act.name}</div>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-1">CO₂ REDUCTION: {act.co2} KG</div>
                    </div>
                    <span className="font-mono font-black text-[10px] bg-black text-[#EAB308] px-2.5 py-1.5 rounded-none border border-white/10 flex items-center gap-1 shrink-0">
                      +{act.pts} PTS
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
