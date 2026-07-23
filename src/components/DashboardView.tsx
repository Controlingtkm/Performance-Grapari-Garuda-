import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Award, 
  Ticket, 
  Percent, 
  ShoppingBag, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  Activity,
  Sparkles,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { KpiCsRecord, KpiFosRecord, MonitoringRecord, ActivityLog, UserRole } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16
    }
  }
};

const cardHoverVariants = {
  hover: { 
    y: -3,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20
    }
  }
};

interface DashboardViewProps {
  kpiCs: KpiCsRecord[];
  kpiFos: KpiFosRecord[];
  monitoring: MonitoringRecord[];
  activityLogs: ActivityLog[];
  userRole: UserRole;
  onCreateTicket: () => void;
  onAddCsKpi: () => void;
}

export default function DashboardView({ 
  kpiCs, 
  kpiFos, 
  monitoring, 
  activityLogs, 
  userRole,
  onCreateTicket,
  onAddCsKpi
}: DashboardViewProps) {

  // Computed stats
  const totalSales = kpiCs.reduce((acc, curr) => acc + curr.sales, 0);
  const activeTickets = monitoring.filter(m => m.status === 'Open' || m.status === 'In Progress').length;
  const closedTicketsCount = monitoring.filter(m => m.status === 'Resolved').length;
  const inSlaCount = kpiFos.reduce((acc, curr) => acc + curr.inSla, 0);
  const totalFosTickets = kpiFos.reduce((acc, curr) => acc + curr.monitoringTicket, 0);
  const overallSla = totalFosTickets > 0 ? Math.round((inSlaCount / totalFosTickets) * 100) : 95;

  const avgCsAchievement = kpiCs.length > 0 
    ? Math.round(kpiCs.reduce((acc, curr) => acc + curr.achievement, 0) / kpiCs.length) 
    : 92;

  // Recharts Trends Dummy Data (highly aesthetic, matching brand identity colors)
  const trendData = [
    { name: 'Sen', Sales: 18, Achievement: 82, SLA: 94 },
    { name: 'Sel', Sales: 24, Achievement: 88, SLA: 96 },
    { name: 'Rab', Sales: 31, Achievement: 91, SLA: 92 },
    { name: 'Kam', Sales: 28, Achievement: 89, SLA: 90 },
    { name: 'Jum', Sales: 35, Achievement: 95, SLA: 95 },
    { name: 'Sab', Sales: 42, Achievement: 97, SLA: 98 },
    { name: 'Min', Sales: 40, Achievement: 98, SLA: 97 },
  ];

  // Best of CS (Rank 1) and Best of FOS (Rank 1)
  const topCs = kpiCs.find(c => c.ranking === 1) || kpiCs[0];
  const topFos = kpiFos.find(f => f.ranking === 1) || kpiFos[0];

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      
      {/* 1. Header Title & Time Badge */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-zinc-900 pb-6"
      >
        <div>
          {/* Announcement pill badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-850/50 mb-3 text-[10px] text-slate-600 dark:text-zinc-400">
            <span className="flex h-1.5 w-1.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">Live:</span>
            <span>Real-time KPI synchronization is active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans leading-[1.1]">
            Build consistent service <br className="hidden sm:block" />
            <span className="text-gray-400 dark:text-gray-500">metrics at scale.</span>
          </h1>
          <p className="mt-2.5 text-xs text-gray-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            Monitor real-time Key Performance Indicators (KPI), SLA, dan aktivitas operasional harian Grapari Garuda secara terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-850 rounded-xl shadow-xs text-xs font-semibold text-gray-600 dark:text-gray-300">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          <span>{currentDateStr}</span>
        </div>
      </motion.div>

      {/* 2. CORE KPI CARDS GRID (Sleek Minimal Grid matching Landings) */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        
        {/* Card 1: Today's Achievement */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[150px] transition-all hover:border-red-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Pencapaian Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-baseline gap-1.5">
              <span>96.4%</span>
              <span className="text-xs text-emerald-500 font-bold font-mono">+1.2%</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Mengungguli performa hari kemarin</p>
          </div>
        </motion.div>

        {/* Card 2: Total Sales */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[150px] transition-all hover:border-red-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Penjualan Halo & Orbit
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-baseline gap-1.5">
              <span>{totalSales} <span className="text-sm font-semibold text-gray-400">Unit</span></span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">102% Target</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Akumulasi seluruh CS bulan ini</p>
          </div>
        </motion.div>

        {/* Card 3: Active Monitoring Tickets */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[150px] transition-all hover:border-red-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Tiket Monitoring Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-baseline gap-1.5">
              <span>{activeTickets} <span className="text-sm font-semibold text-gray-400">Kasus</span></span>
              <span className="text-[10px] text-gray-400 font-mono font-medium">({closedTicketsCount} Closed)</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Keluhan aktif dalam antrean tindak lanjut</p>
          </div>
        </motion.div>

        {/* Card 4: SLA Compliance FOS */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[150px] transition-all hover:border-red-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              SLA Compliance FOS
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-baseline gap-1.5">
              <span>{overallSla}%</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">Standard OK</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Ketepatan waktu instalasi lapangan</p>
          </div>
        </motion.div>

      </motion.div>

      {/* 3. CHARTS CONTAINER */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Chart 1: Trend Penjualan (Sleek Area Chart) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Tren Produktivitas & Penjualan</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Grafik harian konversi produk & tiket selesai</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 px-2.5 py-1 bg-red-50 dark:bg-red-950/15 rounded-full">
              Siklus Mingguan
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e4e4e7', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#09090b',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                  }} 
                />
                <Area type="monotone" dataKey="Sales" stroke="#dc2626" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: SLA Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">SLA Ketepatan Prosedur</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Tingkat kepatuhan operasional lapangan (%)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e4e4e7', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#09090b',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                  }} 
                />
                <Bar dataKey="SLA" fill="#dc2626" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.SLA >= 95 ? '#dc2626' : '#a1a1aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </motion.div>

      {/* 4. HALL OF FAME & QUICK ACTIONS & SYSTEM LOGS */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Block A: Hall Of Fame */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Hall of Fame (Best Performers)</h3>
            </div>
            
            <div className="space-y-4">
              {/* MVP CS */}
              {topCs && (
                <div className="p-3.5 bg-slate-50/50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-900 rounded-xl flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-500/20 flex items-center justify-center font-bold text-red-600 dark:text-red-400 text-xs shrink-0">
                        CS
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full font-bold scale-90">#1</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{topCs.name}</h4>
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">Rank 1 • {topCs.achievement}% Score</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-red-600 dark:text-red-400 font-mono">MVP CS</div>
                    <div className="text-[9px] text-gray-400 font-mono mt-0.5">{topCs.sales} Sales</div>
                  </div>
                </div>
              )}

              {/* MVP FOS */}
              {topFos && (
                <div className="p-3.5 bg-slate-50/50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-900 rounded-xl flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={topFos.photo} alt={topFos.name} className="w-10 h-10 rounded-full object-cover border border-slate-400/20" />
                      <span className="absolute -bottom-1 -right-1 bg-slate-800 dark:bg-zinc-800 text-white text-[8px] px-1 rounded-full font-bold scale-90">FOS</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{topFos.name}</h4>
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">SLA: {topFos.achievement}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-700 dark:text-zinc-400 font-mono">MVP FOS</div>
                    <div className="text-[9px] text-gray-400 font-mono mt-0.5">{topFos.monitoringTicket} Tickets</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-900 text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Kinerja dihitung otomatis berdasarkan akumulasi harian</span>
          </div>
        </div>

        {/* Block B: Quick Actions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Aksi Cepat (Quick Actions)</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                id="btn-quick-new-ticket"
                onClick={onCreateTicket}
                className="p-4 rounded-xl border border-gray-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/20 text-left hover:border-red-500/20 hover:bg-red-50/5 dark:hover:bg-red-950/10 transition-colors cursor-pointer group"
              >
                <Ticket className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                <div className="text-[11px] font-bold text-slate-900 dark:text-white mt-3">Buka Tiket Baru</div>
                <p className="text-[9px] text-gray-400 mt-0.5">Aduan Indihome & Tsel</p>
              </button>

              <button 
                id="btn-quick-add-kpi"
                onClick={onAddCsKpi}
                disabled={userRole !== 'Admin' && userRole !== 'Team Leader'}
                className={`p-4 rounded-xl border text-left transition-colors group ${
                  userRole === 'Admin' || userRole === 'Team Leader'
                    ? 'border-gray-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/20 hover:border-red-500/20 hover:bg-red-50/5 dark:hover:bg-red-950/10 cursor-pointer'
                    : 'border-dashed border-gray-100 dark:border-zinc-900 bg-transparent opacity-50 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                <div className="text-[11px] font-bold text-slate-900 dark:text-white mt-3">Input Nilai KPI</div>
                <p className="text-[9px] text-gray-400 mt-0.5">Wewenang Leader & Admin</p>
              </button>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-red-50/20 dark:bg-red-950/5 border border-red-500/10 rounded-xl text-[10px] text-slate-600 dark:text-zinc-400 leading-relaxed flex items-start gap-2">
            <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>SLA Standard Garuda mewajibkan respon keluhan diselesaikan FOS maksimal 12 Jam.</span>
          </div>
        </div>

        {/* Block C: Recent Audit Logs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Aktivitas Sistem Terkini</h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3 max-h-[175px] overflow-y-auto pr-1">
              {activityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-left border-b border-gray-100 dark:border-zinc-900 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">{log.user}</span>
                    <span className="text-[8px] font-mono text-gray-400">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8px] px-2 py-0.2 rounded-full font-semibold font-mono bg-slate-100 dark:bg-zinc-800 text-gray-400">
                      {log.action}
                    </span>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">Belum ada aktivitas tercatat.</p>
              )}
            </div>
          </div>

          <div className="mt-5 text-[10px] text-gray-400 flex items-center gap-1.5 font-mono pt-3 border-t border-gray-100 dark:border-zinc-900">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Audit trail dilindungi enkripsi internal</span>
          </div>
        </div>

      </motion.div>

    </motion.div>
  );
}
