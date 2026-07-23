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
  FileText,
  ArrowRight,
  BookOpen,
  Award,
  Terminal,
  ArrowUpRight,
  Check,
  Globe,
  X
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
import AiAssistantView from './components/AiAssistantView';
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
      user: currentUser?.name || 'NAFA LAILA WAHIDAH',
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
      name: 'NAFA LAILA WAHIDAH',
      nik: 'GG-00501',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
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
      csName: currentUser?.name || 'NAFA LAILA WAHIDAH',
      nik: currentUser?.nik || 'GG-00501',
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
        <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-x-hidden selection:bg-red-500/10 selection:text-red-500 font-sans">
          
          {/* Subtle grid pattern background to look incredibly premium */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
          
          {/* Visual Background Accent Orbs */}
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-red-500/5 dark:bg-red-500/3 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-[140px] pointer-events-none" />

          {/* Premium Header/Navigation Bar */}
          <header className="sticky top-0 z-45 w-full border-b border-gray-100 dark:border-zinc-900/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              
              {/* Brand Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center shadow-xs">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
                    alt="Telkomsel Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                    Grapari Garuda
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono tracking-wider -mt-0.5">SURABAYA</span>
                </div>
              </div>

              {/* Navigation center links */}
              <nav className="hidden md:flex items-center gap-8">
                <a href="#fitur" className="text-xs font-semibold text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Fitur Utama
                </a>
                <a href="#sop" className="text-xs font-semibold text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  SOP & FAQ
                </a>
                <a href="#eform" className="text-xs font-semibold text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  E-Form Digital
                </a>
                <a href="#ai" className="text-xs font-semibold text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Asisten AI
                </a>
              </nav>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-xs transition-all"
                >
                  Get Started
                </button>
              </div>

            </div>
          </header>

          {/* Hero Section */}
          <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
            
            {/* New Announcement Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-850 mb-8 animate-fade-in text-[11px] text-slate-600 dark:text-zinc-400">
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">New:</span>
              <span>AI-powered Knowledge Base & SOPs</span>
            </div>

            {/* Massive Display Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-4xl leading-[1.1] font-sans">
              Build consistent service <br className="hidden sm:block" />
              <span className="text-gray-400 dark:text-gray-500">systems at scale.</span>
            </h1>

            {/* Premium subtitle */}
            <p className="mt-6 text-sm sm:text-base text-gray-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Sistem operasional terpadu Grapari Garuda Surabaya. Kelola KPI kinerja secara real-time, 
              otomatisasi pembuatan e-form PSB Halo & IndiHome, dan percepat resolusi gangguan pelanggan dengan asisten AI.
            </p>

            {/* Dual CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 text-xs font-semibold rounded-full shadow-md flex items-center justify-center gap-1.5 group cursor-pointer transition-all"
              >
                <span>Mulai Sesi Cepat</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('fitur');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Pelajari Fitur</span>
              </button>
            </div>

            {/* Stats Dashboard Preview Section (Aesthetic Minimal Blocks) */}
            <div id="fitur" className="mt-20 sm:mt-28 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[160px] transition-all hover:border-red-500/20">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">KPI & Pencapaian</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Sinkronisasi berkala data KPI CS & FOS langsung dari Google Sheets. Evaluasi skor secara objektif & transparan.
                  </p>
                </div>
              </div>

              <div id="sop" className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[160px] transition-all hover:border-red-500/20">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Pusat Pengetahuan</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Akses SOP terstruktur, daftar FAQ terupdate, dan draf skrip CS untuk berbagai jenis skenario penawaran.
                  </p>
                </div>
              </div>

              <div id="eform" className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-900/80 shadow-xs flex flex-col justify-between min-h-[160px] transition-all hover:border-red-500/20">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">E-Form Otomatis</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Generator surat pernyataan migrasi PSB Halo, aktivasi baru PSB IndiHome, terminasi layanan, dan ganti kartu instan.
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* Footer of Landing Page */}
          <footer className="mt-20 border-t border-gray-100 dark:border-zinc-900 py-10 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-mono">
            <div>
              © {new Date().getFullYear()} Grapari Garuda Surabaya. Seluruh Hak Cipta Dilindungi.
            </div>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Syarat Layanan</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Panduan Grapari</a>
            </div>
          </footer>

          {/* INTERACTIVE FLOATING LOGIN MODAL */}
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Dark backdrop overlay with blur */}
              <div 
                className="absolute inset-0 bg-zinc-950/45 dark:bg-zinc-950/70 backdrop-blur-xs transition-opacity"
                onClick={() => setIsLoginModalOpen(false)}
              />
              
              {/* Modal Box */}
              <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-gray-150 dark:border-zinc-900 p-8 shadow-2xl z-10 animate-fade-in text-center">
                
                {/* Close Button */}
                <button 
                  onClick={() => setIsLoginModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Logo and Greeting */}
                <div className="mb-6 mt-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-red-500/10 dark:border-red-500/20 flex items-center justify-center p-2.5 shadow-xs mx-auto mb-3">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
                      alt="Telkomsel Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                    Masuk Grapari Garuda
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Masukkan kredensial Anda untuk mengakses sistem</p>
                </div>

                {/* Creds Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {authError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium text-left">
                      {authError}
                    </div>
                  )}

                  <div className="text-left">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="input-login-username"
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-white/40 dark:bg-zinc-900/40 focus:ring-1 focus:ring-red-500 outline-none text-slate-800 dark:text-white"
                        placeholder="Masukkan username..."
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="input-login-password"
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-white/40 dark:bg-zinc-900/40 focus:ring-1 focus:ring-red-500 outline-none text-slate-800 dark:text-white"
                        placeholder="Masukkan password..."
                      />
                    </div>
                  </div>

                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-xs font-semibold text-white dark:text-slate-950 rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
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

                {/* Quick Evaluation One-Click Simulators */}
                <div className="mt-6 border-t border-gray-100 dark:border-zinc-900 pt-5 space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                    <span>Evaluator One-Click Simulators</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      id="btn-quick-login-admin"
                      onClick={() => handleQuickLogin('Admin')} 
                      className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-zinc-300 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer transition-colors"
                    >
                      👑 Admin
                    </button>
                    <button 
                      id="btn-quick-login-leader"
                      onClick={() => handleQuickLogin('Team Leader')} 
                      className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-zinc-300 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer transition-colors"
                    >
                      👔 Team Leader
                    </button>
                    <button 
                      id="btn-quick-login-cs"
                      onClick={() => handleQuickLogin('Customer Service')} 
                      className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-zinc-300 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer transition-colors"
                    >
                      🎧 CS Agent
                    </button>
                    <button 
                      id="btn-quick-login-fos"
                      onClick={() => handleQuickLogin('FOS')} 
                      className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-zinc-300 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 cursor-pointer transition-colors"
                    >
                      🔧 FOS Staff
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      ) : (
        
        /* AUTHENTICATED SYSTEM MAIN LAYOUT */
        <div className="min-h-screen flex bg-[#fafafa] dark:bg-zinc-950">
          
          {/* Sticky Apple Sidebar */}
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              setIsSidebarOpen(false); // Auto-close sidebar drawer on navigation
            }} 
            user={{
              name: currentUser?.name || 'NAFA LAILA WAHIDAH',
              role: currentUser?.role || 'Customer Service',
              photo: currentUser?.username === 'leader' || currentUser?.name === 'Yunisel Rachmil' ? yuniselPhoto : currentUser?.photo,
              nik: currentUser?.nik || 'GG-00501'
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
              onLogout={handleLogout}
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

              {currentTab === 'asisten-ai' && (
                <AiAssistantView 
                  userRole={currentUser?.role || 'Customer Service'}
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
