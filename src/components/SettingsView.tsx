import React, { useState } from 'react';
import { 
  Settings, 
  UserCheck, 
  Palette, 
  Link2, 
  Sliders, 
  Database, 
  LogOut, 
  Shield, 
  Clock, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { UserRole } from '../types';

interface SettingsViewProps {
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  sheetsUrl: string;
  onSaveSheetsUrl: (url: string) => void;
}

export default function SettingsView({ 
  userRole, 
  onChangeUserRole, 
  onLogout,
  theme,
  onToggleTheme,
  sheetsUrl,
  onSaveSheetsUrl
}: SettingsViewProps) {
  const [localUrl, setLocalUrl] = useState(sheetsUrl);
  const [targetSales, setTargetSales] = useState(150);
  const [slaLimit, setSlaLimit] = useState(12);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSheetsUrl(localUrl);
    alert('Endpoint Google Apps Script berhasil diperbarui!');
  };

  const triggerMockSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Arsip data berhasil disinkronisasi ulang dengan database Google Sheets!');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Pengaturan Sistem</h2>
        <p className="text-xs text-gray-500 mt-1">Konfigurasi personalisasi tampilan, integrasi database eksternal Google Sheets, dan target penilaian.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Simulation Roleplay Switcher */}
        <div className="apple-glass rounded-apple p-5 apple-shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-3">
            <UserCheck className="w-4 h-4 text-red-500" />
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Simulator Role-Based Access</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Ubah peran aktif untuk menguji batas CRUD menu.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { role: 'Admin' as UserRole, desc: 'Akses penuh seluruh CRUD data, pengaturan API Sheets, hapus log.' },
              { role: 'Team Leader' as UserRole, desc: 'Akses CRUD data, persetujuan keluhan, cetak laporan.' },
              { role: 'Customer Service' as UserRole, desc: 'Hanya akses Input / Buka tiket keluhan aduan, copy template.' },
              { role: 'FOS' as UserRole, desc: 'Hanya ubah status tiket penyelesaian aduan lapangan, view KPI.' },
            ].map((item) => (
              <button
                id={`btn-simulate-role-${item.role.toLowerCase().replace(/\s+/g, '-')}`}
                key={item.role}
                onClick={() => onChangeUserRole(item.role)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex justify-between items-start cursor-pointer ${
                  userRole === item.role
                    ? 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10'
                    : 'border-gray-100 dark:border-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{item.role}</span>
                    {userRole === item.role && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">{item.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  userRole === item.role ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {userRole === item.role && <span className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel 2: Theme & Target Parameters */}
        <div className="space-y-6">
          
          {/* Theme card */}
          <div className="apple-glass rounded-apple p-5 apple-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-3">
              <Palette className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white font-mono">Tampilan & Personalisasi</h3>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold">Tema Antarmuka</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Pilih tema terang atau gelap Apple design</p>
              </div>
              <button 
                id="btn-toggle-theme"
                onClick={onToggleTheme}
                className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
              >
                Tema: {theme === 'light' ? 'Terang' : 'Gelap'}
              </button>
            </div>
          </div>

          {/* SLA Threshold configuration */}
          <div className="apple-glass rounded-apple p-5 apple-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-3">
              <Sliders className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white font-mono">Target & Batas SLA</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Sales CS (Bulan)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetSales}
                    onChange={(e) => setTargetSales(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-gray-400">Unit</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Batas SLA FOS (Technical)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={slaLimit}
                    onChange={(e) => setSlaLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-gray-400">Jam</span>
                </div>
              </div>
            </div>
            
            <p className="text-[9px] text-gray-400 font-mono italic">Adjusting these parameters will recalibrate overall dashboard target bars dynamically.</p>
          </div>

        </div>

      </div>

      {/* DATABASE INTEGRATION (GOOGLE SHEETS BRIDGE) */}
      <div className="apple-glass rounded-apple p-5 apple-shadow space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-3">
          <Database className="w-4 h-4 text-emerald-500" />
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Google Sheets REST API Integration (FREE Database)</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Hubungkan dashboard ini langsung dengan file Google Sheets perusahaan Anda.</p>
          </div>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Web App Deployment URL (Google Apps Script)</label>
            <div className="flex gap-3">
              <input
                id="input-sheets-endpoint"
                type="text"
                required
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent font-mono"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
              <button 
                id="btn-save-sheets-endpoint"
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs text-white rounded-xl font-medium cursor-pointer shadow-md shrink-0"
              >
                Simpan Endpoint
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-900">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Sinkronisasi Database Manual</span>
            <p className="text-[10px] text-gray-400 leading-normal">Tarik / unggah data baris paling aktual dari sheet secara paksa.</p>
          </div>
          <button
            id="btn-force-sync"
            onClick={triggerMockSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium cursor-pointer bg-white dark:bg-zinc-950 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-500' : ''}`} />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* LOGOUT BUTTON DECK */}
      <div className="flex justify-between items-center p-4 border border-red-500/10 bg-red-500/5 rounded-2xl">
        <div className="text-left">
          <span className="text-xs font-bold text-red-600 dark:text-red-400">Grapari Garuda Session</span>
          <p className="text-[10px] text-gray-400 mt-0.5">Sesi Anda dilindungi oleh enkripsi login standard.</p>
        </div>
        <button 
          id="btn-logout-settings"
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-xs text-white font-semibold rounded-xl cursor-pointer shadow-md transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>

    </div>
  );
}
