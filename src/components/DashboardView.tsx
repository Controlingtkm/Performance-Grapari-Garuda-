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
  Activity
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
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

const cardHoverVariants = {
  hover: { 
    y: -5,
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18
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

  // Recharts Trends Dummy Data
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
      className="space-y-8"
    >
      
      {/* Date & Title */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
              alt="Telkomsel" 
              className="w-7 h-7 object-contain"
              referrerPolicy="no-referrer"
            />
            Dashboard Pencapaian Grapari Garuda
          </h1>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            Monitor real-time Key Performance Indicators (KPI), SLA, dan aktivitas operasional harian.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-gray-800/80 rounded-xl shadow-xs text-xs font-medium text-gray-600 dark:text-gray-300">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          <span>{currentDateStr}</span>
        </div>
      </motion.div>

      {/* CORE KPI CARDS GRID */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        
        {/* Card 1: Achievement Today */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between h-36 cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Pencapaian Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-baseline gap-1.5">
              <span>96.4%</span>
              <span className="text-xs text-emerald-500 font-medium font-mono">+1.2%</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Dibanding rata-rata kemarin</p>
          </div>
        </motion.div>

        {/* Card 2: Sales Total */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between h-36 cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Total Penjualan Halo & Orbit
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-baseline gap-1.5">
              <span>{totalSales} Unit</span>
              <span className="text-xs text-emerald-500 font-medium font-mono">102% Target</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Akumulasi seluruh agen CS bulan ini</p>
          </div>
        </motion.div>

        {/* Card 3: Active Monitoring Tickets */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between h-36 cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Tiket Monitoring Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-baseline gap-1.5">
              <span>{activeTickets} Laporan</span>
              <span className="text-[10px] text-gray-400 font-mono font-normal">({closedTicketsCount} Selesai)</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Keluhan Indihome & Telkomsel aktif</p>
          </div>
        </motion.div>

        {/* Card 4: SLA Compliance FOS */}
        <motion.div 
          variants={cardHoverVariants}
          whileHover="hover"
          className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between h-36 cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              SLA Compliance FOS
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-baseline gap-1.5">
              <span>{overallSla}%</span>
              <span className="text-[10px] text-emerald-500 font-medium font-mono">Batas Aman &gt;92%</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Standard ketepatan waktu instalasi</p>
          </div>
        </motion.div>

      </motion.div>

      {/* CHARTS CONTAINER */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        
        {/* Trend Penjualan (Area Chart) */}
        <div className="apple-glass rounded-apple p-6 apple-shadow lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Tren Produktivitas & Penjualan</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Grafik harian konversi produk & tiket selesai</p>
            </div>
            <span className="text-[10px] font-mono font-medium text-red-500 px-2 py-0.5 bg-red-50 dark:bg-red-950/20 rounded-full">
              Siklus Mingguan
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-zinc-900" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: 'var(--tooltip-text)'
                  }} 
                  itemStyle={{ color: 'var(--tooltip-text)' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Bar Chart */}
        <div className="apple-glass rounded-apple p-6 apple-shadow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">SLA Ketepatan Prosedur</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Tingkat kepatuhan operasional lapangan (%)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-zinc-900" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: 'var(--tooltip-text)'
                  }} 
                  itemStyle={{ color: 'var(--tooltip-text)' }}
                />
                <Bar dataKey="SLA" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.SLA >= 95 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </motion.div>

      {/* HALL OF FAME & QUICK ACTIONS & LOGS */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        
        {/* Hall Of Fame: Juara Bulan Ini */}
        <div className="apple-glass rounded-apple p-5 apple-shadow space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Hall Of Fame (Best Performers)</h3>
          </div>
          <div className="space-y-3.5">
            {/* Top CS */}
            {topCs && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl flex items-center justify-between transition-colors duration-200 hover:bg-amber-500/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={topCs.photo} alt={topCs.name} className="w-11 h-11 rounded-full object-cover border-2 border-amber-400" />
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] px-1 rounded-full font-bold">CS</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{topCs.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Rank 1 • {topCs.achievement}% Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-amber-500 font-mono">MVP CS</div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">{topCs.sales} Sales</div>
                </div>
              </motion.div>
            )}

            {/* Top FOS */}
            {topFos && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 rounded-2xl flex items-center justify-between transition-colors duration-200 hover:bg-blue-500/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={topFos.photo} alt={topFos.name} className="w-11 h-11 rounded-full object-cover border-2 border-blue-400" />
                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[9px] px-1 rounded-full font-bold">FOS</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{topFos.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">SLA: {topFos.achievement}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-blue-500 font-mono">MVP FOS</div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">{topFos.monitoringTicket} Tickets</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Actions (Roleplay Authorized) */}
        <div className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Aksi Cepat (Quick Actions)</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                id="btn-quick-new-ticket"
                onClick={onCreateTicket}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-left hover:border-red-500/20 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors cursor-pointer group"
              >
                <Ticket className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                <div className="text-[11px] font-semibold text-gray-900 dark:text-white mt-2">Buka Tiket Baru</div>
                <p className="text-[9px] text-gray-400 mt-0.5">Aduan Indihome/Tsel</p>
              </motion.button>

              <motion.button 
                id="btn-quick-add-kpi"
                onClick={onAddCsKpi}
                disabled={userRole !== 'Admin' && userRole !== 'Team Leader'}
                whileHover={userRole === 'Admin' || userRole === 'Team Leader' ? { scale: 1.03 } : {}}
                whileTap={userRole === 'Admin' || userRole === 'Team Leader' ? { scale: 0.97 } : {}}
                className={`p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-left transition-colors group ${
                  userRole === 'Admin' || userRole === 'Team Leader'
                    ? 'hover:border-emerald-500/20 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="text-[11px] font-semibold text-gray-900 dark:text-white mt-2">Input Nilai KPI</div>
                <p className="text-[9px] text-gray-400 mt-0.5">Admin & Leader saja</p>
              </motion.button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-500/10 rounded-xl text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed flex items-start gap-2">
            <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>SLA Standard Grapari Garuda mewajibkan respon keluhan tipe **Technical** diselesaikan oleh FOS dalam kurun waktu 12 Jam.</span>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="apple-glass rounded-apple p-5 apple-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Aktivitas Sistem Terkini</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="text-left border-b border-gray-100 dark:border-gray-900/60 pb-2.5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{log.user}</span>
                  <span className="text-[8px] font-mono text-gray-400">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{log.details}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full font-semibold font-mono bg-gray-100 dark:bg-zinc-800 text-gray-400">
                    {log.action}
                  </span>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-6">Belum ada catatan aktivitas.</p>
            )}
          </div>
        </div>

      </motion.div>

    </motion.div>
  );
}
