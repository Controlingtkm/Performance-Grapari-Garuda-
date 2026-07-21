import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Loader2, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import KpiCsView from './components/KpiCsView';
import KpiFosView from './components/KpiFosView';
import MonitoringView from './components/MonitoringView';
import TemplateCenterView from './components/TemplateCenterView';
import KnowledgeCenterView from './components/KnowledgeCenterView';
import PerformanceCenterView from './components/PerformanceCenterView';
import SettingsView from './components/SettingsView';
import yuniselPhoto from './assets/images/yunisel_avatar_1784641085038.jpg';

import { apiService } from './services/api';
import { 
  KpiCsRecord, 
  KpiFosRecord, 
  MonitoringRecord, 
  TemplateRecord, 
  KnowledgeRecord, 
  ActivityLog, 
  UserRole,
  User as UserType
} from './types';

import { 
  initialKpiCs, 
  initialKpiFos, 
  initialMonitoring, 
  initialTemplates, 
  initialKnowledge, 
  initialActivityLogs 
} from './mockData';

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab State
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);

  // Mobile sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Data Lists
  const [kpiCs, setKpiCs] = useState<KpiCsRecord[]>(initialKpiCs);
  const [kpiFos, setKpiFos] = useState<KpiFosRecord[]>(initialKpiFos);
  const [monitoring, setMonitoring] = useState<MonitoringRecord[]>(initialMonitoring);
  const [templates, setTemplates] = useState<TemplateRecord[]>(initialTemplates);
  const [knowledge, setKnowledge] = useState<KnowledgeRecord[]>(initialKnowledge);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  // Sheets endpoint
  const [sheetsUrl, setSheetsUrl] = useState('https://script.google.com/macros/s/AKfycbyGrapariGarudaSheetsBridge/exec');

  // Load Session and Theme preference on Mount
  useEffect(() => {
    // Session
    const stored = localStorage.getItem('grapari_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.isAuthenticated && parsed?.user) {
          setIsAuthenticated(true);
          setCurrentUser(parsed.user);
        }
      } catch (err) {
        // ignore
      }
    }

    // Theme
    const isDark = localStorage.getItem('grapari_dark_theme') === 'true';
    setDarkMode(isDark);
  }, []);

  // Update theme classes on body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('grapari_dark_theme', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('grapari_dark_theme', 'false');
    }
  }, [darkMode]);

  // Load live data from proxy API on login
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAllDatabaseRecords = async () => {
      try {
        const csData = await apiService.fetchSheetData<KpiCsRecord>('kpi_cs');
        if (csData && csData.length > 0) setKpiCs(csData);
      } catch (e) {
        console.warn('API fetch kpi_cs failed, using stateful seeded mock data instead.');
      }

      try {
        const fosData = await apiService.fetchSheetData<KpiFosRecord>('kpi_fos');
        if (fosData && fosData.length > 0) setKpiFos(fosData);
      } catch (e) {
        console.warn('API fetch kpi_fos failed, using stateful seeded mock data instead.');
      }

      try {
        const monData = await apiService.fetchSheetData<MonitoringRecord>('monitoring');
        if (monData && monData.length > 0) setMonitoring(monData);
      } catch (e) {
        console.warn('API fetch monitoring failed, using stateful seeded mock data instead.');
      }

      try {
        const tplData = await apiService.fetchSheetData<TemplateRecord>('templates');
        if (tplData && tplData.length > 0) setTemplates(tplData);
      } catch (e) {
        console.warn('API fetch templates failed, using stateful seeded mock data instead.');
      }

      try {
        const logsData = await apiService.fetchSheetData<ActivityLog>('activity_logs');
        if (logsData && logsData.length > 0) setActivityLogs(logsData);
      } catch (e) {
        console.warn('API fetch activity_logs failed, using stateful seeded mock data instead.');
      }
    };

    loadAllDatabaseRecords();
  }, [isAuthenticated]);

  // Unified audit log generator
  const createSystemLog = async (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Siti Rahma',
      role: currentUser?.role || 'Customer Service',
      action,
      details
    };

    setActivityLogs(prev => [newLog, ...prev]);

    try {
      await apiService.createRecord('activity_logs', newLog);
    } catch (e) {
      // ignore, local state updated
    }
  };

  // Auth: Manual Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const response = await apiService.login(usernameInput, passwordInput);
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      localStorage.setItem('grapari_session', JSON.stringify({ isAuthenticated: true, user: response.user }));
    } catch (err: any) {
      setAuthError(err.message || 'Username atau password salah.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Role simulator / Quick Login
  const handleQuickLogin = (role: UserRole) => {
    let mockUser: UserType = {
      id: 'user-cs',
      username: 'cs',
      role: 'Customer Service',
      name: 'Siti Rahma',
      nik: 'GG-00511',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    };

    if (role === 'Admin') {
      mockUser = {
        id: 'user-admin',
        username: 'admin',
        role: 'Admin',
        name: 'Haris Muhammad',
        nik: 'GG-00199',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      };
    } else if (role === 'Team Leader') {
      mockUser = {
        id: 'user-tl',
        username: 'leader',
        role: 'Team Leader',
        name: 'Yunisel Rachmil',
        nik: 'GG-00244',
        photo: yuniselPhoto
      };
    } else if (role === 'FOS') {
      mockUser = {
        id: 'user-fos',
        username: 'fos',
        role: 'FOS',
        name: 'Eko Wijaya',
        nik: 'GG-00788',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
      };
    }

    setIsAuthenticated(true);
    setCurrentUser(mockUser);
    localStorage.setItem('grapari_session', JSON.stringify({ isAuthenticated: true, user: mockUser }));
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleLogout = () => {
    createSystemLog('USER_LOGOUT', `User ${currentUser?.name} logged out from the system.`);
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('grapari_session');
  };

  // Simulating active role swap inside Settings View
  const handleSimulatedRoleChange = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem('grapari_session', JSON.stringify({ isAuthenticated: true, user: updated }));
    createSystemLog('ROLE_SIMULATED_SWAP', `Simulated session role shifted to "${role}" immediately.`);
  };

  // ==========================================
  // KPI CS CRUD HANDLERS
  // ==========================================
  const handleAddCsKpi = async (record: Partial<KpiCsRecord>) => {
    const newRecord: KpiCsRecord = {
      id: `cs-${Date.now()}`,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      name: record.name || 'CS Agent',
      nik: record.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
      sales: record.sales || 0,
      productivity: record.productivity || 0,
      attendance: record.attendance || 100,
      roleplay: record.roleplay || 80,
      achievement: record.achievement || 85,
      notes: record.notes || '',
      ranking: kpiCs.length + 1,
      progress: record.progress || 0,
      target: record.target || 150,
      status: record.status || 'Good'
    };

    // Calculate ranking order
    const updatedList = [...kpiCs, newRecord]
      .sort((a, b) => b.achievement - a.achievement)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiCs(updatedList);
    createSystemLog('CREATE_KPI_CS', `Added new CS assessment record for ${newRecord.name}`);

    try {
      await apiService.createRecord('kpi_cs', newRecord);
    } catch (e) {
      console.warn('Backend insert failed. Operating on client-side state safely.');
    }
  };

  const handleUpdateCsKpi = async (id: string, record: Partial<KpiCsRecord>) => {
    const updatedList = kpiCs.map(item => {
      if (item.id === id) {
        return { ...item, ...record };
      }
      return item;
    })
    .sort((a, b) => b.achievement - a.achievement)
    .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiCs(updatedList);
    
    const target = kpiCs.find(c => c.id === id);
    if (target) {
      createSystemLog('UPDATE_KPI_CS', `Modified assessment scores for CS Agent: ${target.name}`);
    }

    try {
      await apiService.updateRecord('kpi_cs', id, record);
    } catch (e) {
      console.warn('Backend update failed.');
    }
  };

  const handleDeleteCsKpi = async (id: string) => {
    const target = kpiCs.find(c => c.id === id);
    if (!target) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus penilaian KPI untuk ${target.name}?`)) return;

    const filtered = kpiCs.filter(item => item.id !== id)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiCs(filtered);
    createSystemLog('DELETE_KPI_CS', `Removed CS Agent metrics for: ${target.name}`);

    try {
      await apiService.deleteRecord('kpi_cs', id);
    } catch (e) {
      console.warn('Backend delete failed.');
    }
  };

  const handleBulkImportCs = async (bulkData: any[]) => {
    const structured: KpiCsRecord[] = bulkData.map((record, index) => ({
      id: `cs-${Date.now()}-${index}`,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      name: record.name,
      nik: record.nik,
      sales: record.sales,
      productivity: record.productivity,
      attendance: record.attendance,
      roleplay: record.roleplay,
      achievement: record.achievement,
      notes: record.notes,
      ranking: kpiCs.length + index + 1,
      progress: Math.round((record.sales / record.target) * 100),
      target: record.target,
      status: record.achievement >= 95 ? 'Excellent' : record.achievement >= 85 ? 'Good' : 'Needs Improvement'
    }));

    const sortedList = [...kpiCs, ...structured]
      .sort((a, b) => b.achievement - a.achievement)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiCs(sortedList);
    createSystemLog('BULK_IMPORT_CS', `Imported ${bulkData.length} records into CS roster via Spreadsheet.`);

    try {
      await apiService.bulkImportRecords('kpi_cs', structured);
    } catch (e) {
      console.warn('Bulk insert failed.');
    }
  };

  // ==========================================
  // KPI FOS CRUD HANDLERS
  // ==========================================
  const handleAddFosKpi = async (record: Partial<KpiFosRecord>) => {
    const newRecord: KpiFosRecord = {
      id: `fos-${Date.now()}`,
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      name: record.name || 'FOS Engineer',
      nik: record.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
      monitoringTicket: record.monitoringTicket || 0,
      inSla: record.inSla || 0,
      outSla: record.outSla || 0,
      achievement: record.achievement || 100,
      notes: record.notes || '',
      ranking: kpiFos.length + 1,
      status: record.status || 'Good'
    };

    const updatedList = [...kpiFos, newRecord]
      .sort((a, b) => b.achievement - a.achievement)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiFos(updatedList);
    createSystemLog('CREATE_KPI_FOS', `Registered new FOS Technician assessment for ${newRecord.name}`);

    try {
      await apiService.createRecord('kpi_fos', newRecord);
    } catch (e) {
      console.warn('Backend insert failed.');
    }
  };

  const handleUpdateFosKpi = async (id: string, record: Partial<KpiFosRecord>) => {
    const updatedList = kpiFos.map(item => {
      if (item.id === id) {
        return { ...item, ...record };
      }
      return item;
    })
    .sort((a, b) => b.achievement - a.achievement)
    .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiFos(updatedList);

    const target = kpiFos.find(f => f.id === id);
    if (target) {
      createSystemLog('UPDATE_KPI_FOS', `Modified assessment scores for FOS Technician: ${target.name}`);
    }

    try {
      await apiService.updateRecord('kpi_fos', id, record);
    } catch (e) {
      console.warn('Backend update failed.');
    }
  };

  const handleDeleteFosKpi = async (id: string) => {
    const target = kpiFos.find(f => f.id === id);
    if (!target) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus penilaian KPI untuk ${target.name}?`)) return;

    const filtered = kpiFos.filter(item => item.id !== id)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiFos(filtered);
    createSystemLog('DELETE_KPI_FOS', `Removed FOS Technician metrics for: ${target.name}`);

    try {
      await apiService.deleteRecord('kpi_fos', id);
    } catch (e) {
      console.warn('Backend delete failed.');
    }
  };

  const handleBulkImportFos = async (bulkData: any[]) => {
    const structured: KpiFosRecord[] = bulkData.map((record, index) => ({
      id: `fos-${Date.now()}-${index}`,
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      name: record.name,
      nik: record.nik,
      monitoringTicket: record.monitoringTicket,
      inSla: record.inSla,
      outSla: record.outSla,
      achievement: record.achievement,
      notes: record.notes,
      ranking: kpiFos.length + index + 1,
      status: record.achievement >= 95 ? 'Excellent' : record.achievement >= 88 ? 'Good' : 'Needs Improvement'
    }));

    const sortedList = [...kpiFos, ...structured]
      .sort((a, b) => b.achievement - a.achievement)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }));

    setKpiFos(sortedList);
    createSystemLog('BULK_IMPORT_FOS', `Imported ${bulkData.length} records into FOS roster via Spreadsheet.`);

    try {
      await apiService.bulkImportRecords('kpi_fos', structured);
    } catch (e) {
      console.warn('Bulk insert failed.');
    }
  };

  // ==========================================
  // MONITORING ADUAN CRUD HANDLERS
  // ==========================================
  const handleAddMonitoring = async (record: Partial<MonitoringRecord>) => {
    const newRecord: MonitoringRecord = {
      id: `mon-${Date.now()}`,
      type: record.type || 'Indihome',
      customerName: record.customerName || 'Pelanggan',
      csName: currentUser?.name || 'Siti Rahma',
      nik: currentUser?.nik || 'GG-00511',
      msisdn: record.msisdn || '',
      indihomeNumber: record.indihomeNumber || '-',
      complaint: record.complaint || '',
      ticketNumber: record.ticketNumber || `IN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sla: record.sla || 24,
      category: record.category || 'Technical',
      status: record.status || 'Open',
      notes: record.notes || '',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    setMonitoring(prev => [newRecord, ...prev]);
    createSystemLog('CREATE_TICKET', `Opened new ${newRecord.type} ticket aduan ${newRecord.ticketNumber} for customer ${newRecord.customerName}`);

    try {
      await apiService.createRecord('monitoring', newRecord);
    } catch (e) {
      console.warn('Backend insert failed.');
    }
  };

  const handleUpdateMonitoring = async (id: string, record: Partial<MonitoringRecord>) => {
    setMonitoring(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...record, updatedDate: new Date().toISOString() };
      }
      return item;
    }));

    const target = monitoring.find(m => m.id === id);
    if (target) {
      createSystemLog('UPDATE_TICKET', `Updated ticket status / notes for ${target.ticketNumber} to "${record.status || target.status}"`);
    }

    try {
      await apiService.updateRecord('monitoring', id, record);
    } catch (e) {
      console.warn('Backend update failed.');
    }
  };

  const handleDeleteMonitoring = async (id: string) => {
    const target = monitoring.find(m => m.id === id);
    if (!target) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus permanen tiket ${target.ticketNumber}?`)) return;

    setMonitoring(prev => prev.filter(item => item.id !== id));
    createSystemLog('DELETE_TICKET', `Deleted keluhan ticket ${target.ticketNumber} of ${target.customerName}`);

    try {
      await apiService.deleteRecord('monitoring', id);
    } catch (e) {
      console.warn('Backend delete failed.');
    }
  };

  // ==========================================
  // TEMPLATES CRUD HANDLERS
  // ==========================================
  const handleAddTemplate = async (record: Partial<TemplateRecord>) => {
    const newRecord: TemplateRecord = {
      id: `tpl-${Date.now()}`,
      title: record.title || 'Format Notifikasi',
      category: record.category || 'Customer Service',
      usageCount: 0,
      isFavorite: false,
      content: record.content || ''
    };

    setTemplates(prev => [...prev, newRecord]);
    createSystemLog('CREATE_TEMPLATE', `Added conversation template: ${newRecord.title}`);

    try {
      await apiService.createRecord('templates', newRecord);
    } catch (e) {
      console.warn('Backend insert failed.');
    }
  };

  const handleUpdateTemplate = async (id: string, record: Partial<TemplateRecord>) => {
    setTemplates(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...record };
      }
      return item;
    }));

    try {
      await apiService.updateRecord('templates', id, record);
    } catch (e) {
      console.warn('Backend update failed.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const target = templates.find(t => t.id === id);
    if (!target) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus template "${target.title}"?`)) return;

    setTemplates(prev => prev.filter(item => item.id !== id));
    createSystemLog('DELETE_TEMPLATE', `Removed template: ${target.title}`);

    try {
      await apiService.deleteRecord('templates', id);
    } catch (e) {
      console.warn('Backend delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* AUTH CHECK SCREEN */}
      {!isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-zinc-950 dark:to-zinc-900 p-4 relative overflow-hidden">
          
          {/* Visual Background Accent Orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 dark:bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Frosted Glass Login Wrapper */}
          <div className="w-full max-w-md apple-glass rounded-apple p-8 border border-white/50 dark:border-zinc-800/80 shadow-2xl relative z-10 animate-fade-in text-center">
            
            {/* Logo and Greeting */}
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-red-500/10 dark:border-red-500/20 flex items-center justify-center p-2.5 shadow-lg mx-auto mb-4">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
                  alt="Telkomsel Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white uppercase font-sans">
                Grapari Garuda
              </h1>
              <p className="text-xs text-gray-400 mt-1">Dashboard Pencapaian & Monitoring Terpadu</p>
            </div>

            {/* Creds Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium text-left">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    id="input-login-username"
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 dark:border-zinc-800/80 rounded-xl text-xs bg-white/40 dark:bg-zinc-900/40 focus:ring-1 focus:ring-red-500 outline-none"
                    placeholder="Masukkan username Anda..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 dark:border-zinc-800/80 rounded-xl text-xs bg-white/40 dark:bg-zinc-900/40 focus:ring-1 focus:ring-red-500 outline-none"
                    placeholder="Masukkan password Anda..."
                  />
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Sesi...</span>
                  </>
                ) : (
                  <span>Masuk Sesi Grapari</span>
                )}
              </button>
            </form>

            {/* Quick Evaluation Role play helper buttons */}
            <div className="mt-8 border-t border-gray-100 dark:border-zinc-900/60 pt-5 space-y-3.5">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-red-500 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluator One-Click Simulators</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  id="btn-quick-login-admin"
                  onClick={() => handleQuickLogin('Admin')} 
                  className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer"
                >
                  👑 Login Admin
                </button>
                <button 
                  id="btn-quick-login-leader"
                  onClick={() => handleQuickLogin('Team Leader')} 
                  className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer"
                >
                  👔 Login TL
                </button>
                <button 
                  id="btn-quick-login-cs"
                  onClick={() => handleQuickLogin('Customer Service')} 
                  className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer"
                >
                  🎧 Login CS
                </button>
                <button 
                  id="btn-quick-login-fos"
                  onClick={() => handleQuickLogin('FOS')} 
                  className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer"
                >
                  🔧 Login FOS
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        
        /* AUTHENTICATED SYSTEM MAIN LAYOUT */
        <div className="min-h-screen flex">
          
          {/* Sticky Apple Sidebar */}
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              setIsSidebarOpen(false); // Auto-close sidebar drawer on navigation
            }} 
            user={{
              name: currentUser?.name || 'Siti Rahma',
              role: currentUser?.role || 'Customer Service',
              photo: currentUser?.username === 'leader' || currentUser?.name === 'Yunisel Rachmil' ? yuniselPhoto : currentUser?.photo,
              nik: currentUser?.nik || 'GG-00511'
            }}
            onLogout={handleLogout}
            companyName="GRAPARI GARUDA"
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Core Content Stage */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Header Stage */}
            <Header 
              currentTab={currentTab}
              setCurrentTab={(tab) => {
                setCurrentTab(tab);
                setIsSidebarOpen(false); // Auto-close drawer
              }}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              kpiCsData={kpiCs}
              kpiFosData={kpiFos}
              monitoringData={monitoring}
              templatesData={templates}
              knowledgeData={initialKnowledge}
              user={currentUser ? { ...currentUser, photo: currentUser.username === 'leader' || currentUser.name === 'Yunisel Rachmil' ? yuniselPhoto : currentUser.photo } : null}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Inner Content Area */}
            <main className="p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto pb-16">
              
              {currentTab === 'dashboard' && (
                <DashboardView 
                  kpiCs={kpiCs}
                  kpiFos={kpiFos}
                  monitoring={monitoring}
                  activityLogs={activityLogs}
                  userRole={currentUser?.role || 'Customer Service'}
                  onCreateTicket={() => setCurrentTab('monitoring-indihome')}
                  onAddCsKpi={() => setCurrentTab('kpi-cs')}
                />
              )}

              {currentTab === 'kpi-cs' && (
                <KpiCsView 
                  data={kpiCs}
                  userRole={currentUser?.role || 'Customer Service'}
                  onAddRecord={handleAddCsKpi}
                  onUpdateRecord={handleUpdateCsKpi}
                  onDeleteRecord={handleDeleteCsKpi}
                  onBulkImport={handleBulkImportCs}
                />
              )}

              {currentTab === 'kpi-fos' && (
                <KpiFosView 
                  data={kpiFos}
                  userRole={currentUser?.role || 'Customer Service'}
                  onAddRecord={handleAddFosKpi}
                  onUpdateRecord={handleUpdateFosKpi}
                  onDeleteRecord={handleDeleteFosKpi}
                  onBulkImport={handleBulkImportFos}
                />
              )}

              {currentTab === 'monitoring-indihome' && (
                <MonitoringView 
                  data={monitoring}
                  type="Indihome"
                  userRole={currentUser?.role || 'Customer Service'}
                  onAddRecord={handleAddMonitoring}
                  onUpdateRecord={handleUpdateMonitoring}
                  onDeleteRecord={handleDeleteMonitoring}
                  onBulkImport={() => {}}
                />
              )}

              {currentTab === 'monitoring-telkomsel' && (
                <MonitoringView 
                  data={monitoring}
                  type="Telkomsel"
                  userRole={currentUser?.role || 'Customer Service'}
                  onAddRecord={handleAddMonitoring}
                  onUpdateRecord={handleUpdateMonitoring}
                  onDeleteRecord={handleDeleteMonitoring}
                  onBulkImport={() => {}}
                />
              )}

              {currentTab === 'templates' && (
                <TemplateCenterView 
                  data={templates}
                  userRole={currentUser?.role || 'Customer Service'}
                  user={currentUser}
                  onAddTemplate={handleAddTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onAddMonitoring={handleAddMonitoring}
                />
              )}

              {currentTab === 'knowledge' && (
                <KnowledgeCenterView 
                  userRole={currentUser?.role || 'Customer Service'}
                />
              )}

              {currentTab === 'performance' && (
                <PerformanceCenterView 
                  kpiCs={kpiCs}
                  kpiFos={kpiFos}
                />
              )}

              {currentTab === 'profile' && (
                <div className="max-w-2xl mx-auto text-left apple-glass rounded-apple p-8 apple-shadow space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 dark:border-zinc-900 pb-6">
                    <img src={currentUser?.username === 'leader' || currentUser?.name === 'Yunisel Rachmil' ? yuniselPhoto : currentUser?.photo} alt={currentUser?.name} className="w-20 h-20 rounded-full border border-gray-200 dark:border-zinc-800 object-cover" />
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                      <p className="text-xs text-red-500 font-bold uppercase tracking-wider mt-1">{currentUser?.role}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{currentUser?.nik}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl">
                      <span className="font-bold text-gray-400 uppercase">Divisi Utama</span>
                      <p className="text-gray-800 dark:text-gray-200 font-medium mt-1">Grapari Garuda Surabaya</p>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl">
                      <span className="font-bold text-gray-400 uppercase">Sistem Pembatasan</span>
                      <p className="text-gray-800 dark:text-gray-200 font-medium mt-1">Role-Based Access Active</p>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'settings' && (
                <SettingsView 
                  userRole={currentUser?.role || 'Customer Service'}
                  onChangeUserRole={handleSimulatedRoleChange}
                  onLogout={handleLogout}
                  theme={darkMode ? 'dark' : 'light'}
                  onToggleTheme={() => setDarkMode(!darkMode)}
                  sheetsUrl={sheetsUrl}
                  onSaveSheetsUrl={setSheetsUrl}
                />
              )}

            </main>
          </div>

        </div>
      )}

    </div>
  );
}
