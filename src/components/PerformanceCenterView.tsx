import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Users, TrendingUp, BarChart3, Scale, Star, Zap } from 'lucide-react';
import { KpiCsRecord, KpiFosRecord } from '../types';

interface PerformanceCenterViewProps {
  kpiCs: KpiCsRecord[];
  kpiFos: KpiFosRecord[];
}

export default function PerformanceCenterView({ kpiCs, kpiFos }: PerformanceCenterViewProps) {
  // Compare CS states
  const [csAgent1Id, setCsAgent1Id] = useState<string>(kpiCs[0]?.id || '');
  const [csAgent2Id, setCsAgent2Id] = useState<string>(kpiCs[1]?.id || '');

  // Find selected agents
  const agent1 = kpiCs.find(c => c.id === csAgent1Id) || kpiCs[0];
  const agent2 = kpiCs.find(c => c.id === csAgent2Id) || kpiCs[1];

  // Team averages
  const totalSales = kpiCs.reduce((acc, curr) => acc + curr.sales, 0);
  const avgSales = kpiCs.length > 0 ? Math.round(totalSales / kpiCs.length) : 120;
  
  const avgCsAchievement = kpiCs.length > 0 
    ? Math.round((kpiCs.reduce((acc, curr) => acc + curr.achievement, 0) / kpiCs.length) * 10) / 10 
    : 92.5;

  const avgFosAchievement = kpiFos.length > 0 
    ? Math.round((kpiFos.reduce((acc, curr) => acc + curr.achievement, 0) / kpiFos.length) * 10) / 10 
    : 94.2;

  const avgAttendance = kpiCs.length > 0
    ? Math.round((kpiCs.reduce((acc, curr) => acc + curr.attendance, 0) / kpiCs.length) * 10) / 10
    : 98.2;

  // Compare Data formatting for Radar/Bar Chart
  const comparisonChartData = [
    { metric: 'Penjualan', [agent1?.name || 'Agent A']: agent1?.sales || 0, [agent2?.name || 'Agent B']: agent2?.sales || 0 },
    { metric: 'Kehadiran (%)', [agent1?.name || 'Agent A']: agent1?.attendance || 0, [agent2?.name || 'Agent B']: agent2?.attendance || 0 },
    { metric: 'Roleplay (%)', [agent1?.name || 'Agent A']: agent1?.roleplay || 0, [agent2?.name || 'Agent B']: agent2?.roleplay || 0 },
    { metric: 'Pencapaian (%)', [agent1?.name || 'Agent A']: agent1?.achievement || 0, [agent2?.name || 'Agent B']: agent2?.achievement || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Performance Analytics</h2>
        <p className="text-xs text-gray-500 mt-1">Ukur perbandingan performa antar karyawan secara head-to-head, distribusi kontribusi, dan agregasi statistik tim.</p>
      </div>

      {/* TIM STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Rata-Rata Penjualan */}
        <div className="apple-glass rounded-apple p-5 apple-shadow text-left">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rerata Penjualan CS</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1.5">{avgSales} Unit</div>
          <div className="text-[10px] text-emerald-500 font-mono mt-1">▲ 10.4% Target Minimal</div>
        </div>

        {/* Stat 2: Rata-Rata Pencapaian CS */}
        <div className="apple-glass rounded-apple p-5 apple-shadow text-left">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rerata Skor KPI CS</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1.5">{avgCsAchievement}%</div>
          <div className="text-[10px] text-gray-400 mt-1">Target Perusahaan &gt; 90%</div>
        </div>

        {/* Stat 3: Rata-Rata Pencapaian FOS */}
        <div className="apple-glass rounded-apple p-5 apple-shadow text-left">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rerata Skor SLA FOS</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1.5">{avgFosAchievement}%</div>
          <div className="text-[10px] text-emerald-500 font-mono mt-1">92% Standard Batas Minimum</div>
        </div>

        {/* Stat 4: Kehadiran Rata-Rata */}
        <div className="apple-glass rounded-apple p-5 apple-shadow text-left">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rerata Kehadiran Tim</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1.5">{avgAttendance}%</div>
          <div className="text-[10px] text-emerald-500 font-mono mt-1">Excellent Attendance</div>
        </div>

      </div>

      {/* COMPARATIVE ANALYSIS (HEAD TO HEAD) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Side Selection and Overview Panels */}
        <div className="apple-glass rounded-apple p-5 apple-shadow space-y-6 text-left">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-3">
            <Scale className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Head-to-Head Comparison</h3>
          </div>

          {/* Selectors */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Pilih Agen Pertama (A)</label>
              <select
                id="select-cs-compare-1"
                value={csAgent1Id}
                onChange={(e) => setCsAgent1Id(e.target.value)}
                className="w-full text-xs border border-gray-100 dark:border-zinc-800 rounded-xl px-3 py-2.5 bg-white/50 dark:bg-zinc-900/40"
              >
                {kpiCs.map(cs => (
                  <option key={cs.id} value={cs.id}>{cs.name} ({cs.nik})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Pilih Agen Kedua (B)</label>
              <select
                id="select-cs-compare-2"
                value={csAgent2Id}
                onChange={(e) => setCsAgent2Id(e.target.value)}
                className="w-full text-xs border border-gray-100 dark:border-zinc-800 rounded-xl px-3 py-2.5 bg-white/50 dark:bg-zinc-900/40"
              >
                {kpiCs.map(cs => (
                  <option key={cs.id} value={cs.id}>{cs.name} ({cs.nik})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Individual comparison stats lists */}
          {agent1 && agent2 && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-900/60">
              
              {/* Metric 1: Sales comparative */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-gray-500">
                  <span>Sales Volume</span>
                  <span className="font-bold">{agent1.sales} Unit vs {agent2.sales} Unit</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <div 
                    className="bg-red-500 rounded-l-full transition-all" 
                    style={{ width: `${(agent1.sales / (agent1.sales + agent2.sales || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-blue-500 rounded-r-full transition-all" 
                    style={{ width: `${(agent2.sales / (agent1.sales + agent2.sales || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Metric 2: Achievement comparative */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-gray-500">
                  <span>SLA / Achievement %</span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">{agent1.achievement}% vs {agent2.achievement}%</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <div 
                    className="bg-red-500 rounded-l-full transition-all" 
                    style={{ width: `${(agent1.achievement / (agent1.achievement + agent2.achievement || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-blue-500 rounded-r-full transition-all" 
                    style={{ width: `${(agent2.achievement / (agent1.achievement + agent2.achievement || 1)) * 100}%` }} 
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Dynamic Comparison Chart */}
        <div className="apple-glass rounded-apple p-5 apple-shadow lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Metric Head-to-Head Visual</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> {agent1?.name}</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> {agent2?.name}</span>
              </div>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-zinc-900" />
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                  <Bar dataKey={agent1?.name || 'Agent A'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={agent2?.name || 'Agent B'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl flex items-start gap-2 text-[10px] text-gray-500 leading-relaxed mt-4">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>Karyawan dengan nilai **Roleplay** tinggi merepresentasikan kompetensi komunikasi layanan terbaik saat menghadapi pelanggan riil.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
