import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  FileText,
  User,
  Activity,
  BookOpen,
  X,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Users,
  Layers,
  Award,
  MessageSquare
} from 'lucide-react';
import { KpiCsRecord, KpiFosRecord, MonitoringRecord, TemplateRecord, KnowledgeRecord, UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  kpiCsData: KpiCsRecord[];
  kpiFosData: KpiFosRecord[];
  monitoringData: MonitoringRecord[];
  templatesData: TemplateRecord[];
  knowledgeData: KnowledgeRecord[];
  user: { name: string; role: UserRole; photo?: string; nik?: string } | null;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'CS KPI' | 'FOS KPI' | 'Ticket' | 'Template' | 'Knowledge';
  tabTarget: string;
}

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  darkMode, 
  setDarkMode,
  kpiCsData,
  kpiFosData,
  monitoringData,
  templatesData,
  knowledgeData,
  user,
  onToggleSidebar,
  onLogout
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search on CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Spotlight search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search CS KPI
    if (kpiCsData && Array.isArray(kpiCsData)) {
      kpiCsData.forEach(cs => {
        if (cs.name.toLowerCase().includes(query) || cs.nik.toLowerCase().includes(query)) {
          results.push({
            id: cs.id,
            title: cs.name,
            subtitle: `NIK: ${cs.nik} • Achievement: ${cs.achievement}% • Rank ${cs.ranking}`,
            type: 'CS KPI',
            tabTarget: 'kpi-cs'
          });
        }
      });
    }

    // Search FOS KPI
    if (kpiFosData && Array.isArray(kpiFosData)) {
      kpiFosData.forEach(fos => {
        if (fos.name.toLowerCase().includes(query) || fos.nik.toLowerCase().includes(query)) {
          results.push({
            id: fos.id,
            title: fos.name,
            subtitle: `NIK: ${fos.nik} • Achievement: ${fos.achievement}%`,
            type: 'FOS KPI',
            tabTarget: 'kpi-fos'
          });
        }
      });
    }

    // Search Monitoring (Ticket, Customer Name, MSISDN, Indihome Number)
    if (monitoringData && Array.isArray(monitoringData)) {
      monitoringData.forEach(mon => {
        if (
          mon.customerName.toLowerCase().includes(query) ||
          mon.ticketNumber.toLowerCase().includes(query) ||
          mon.msisdn.includes(query) ||
          mon.indihomeNumber.includes(query) ||
          mon.complaint.toLowerCase().includes(query)
        ) {
          results.push({
            id: mon.id,
            title: `${mon.ticketNumber} - ${mon.customerName}`,
            subtitle: `MSISDN: ${mon.msisdn} • Category: ${mon.category} • Status: ${mon.status}`,
            type: 'Ticket',
            tabTarget: `monitoring-${mon.type.toLowerCase()}`
          });
        }
      });
    }

    // Search Templates
    if (templatesData && Array.isArray(templatesData)) {
      templatesData.forEach(tpl => {
        if (tpl.title.toLowerCase().includes(query) || tpl.content.toLowerCase().includes(query)) {
          results.push({
            id: tpl.id,
            title: tpl.title,
            subtitle: `Template Center • Usage: ${tpl.usageCount} times`,
            type: 'Template',
            tabTarget: 'templates'
          });
        }
      });
    }

    // Search Knowledge Center
    if (knowledgeData && Array.isArray(knowledgeData)) {
      knowledgeData.forEach(kn => {
        if (
          kn.title.toLowerCase().includes(query) ||
          kn.content.toLowerCase().includes(query) ||
          (kn.tags && kn.tags.some(t => t.toLowerCase().includes(query)))
        ) {
          results.push({
            id: kn.id,
            title: kn.title,
            subtitle: `Knowledge Center • SOP & FAQ • Tags: ${kn.tags?.join(', ') || ''}`,
            type: 'Knowledge',
            tabTarget: 'knowledge'
          });
        }
      });
    }

    setSearchResults(results.slice(0, 8)); // Limit to top 8
  }, [searchQuery, kpiCsData, kpiFosData, monitoringData, templatesData, knowledgeData]);

  // Static/Mock notifications matching requested notifications
  const notifications = [
    { id: 1, type: 'achievement', title: 'Achievement Updated', desc: 'NAFA LAILA WAHIDAH achieved 98.5% score!', time: '5m ago', read: false },
    { id: 2, type: 'due', title: 'Monitoring Due', desc: 'Ticket TS-2026-101 requires verification in 30m.', time: '12m ago', read: false },
    { id: 3, type: 'sla', title: 'SLA Warning', desc: 'Ticket TS-2026-102 is currently over-due by 2h.', time: '1h ago', read: true },
    { id: 4, type: 'upload', title: 'Success Upload Excel', desc: 'CS KPI parsed successfully. 6 records synchronized.', time: '2h ago', read: true },
    { id: 5, type: 'finished', title: 'Import Finished', desc: 'Sheet "Monitoring_Indihome" refreshed successfully.', time: '5h ago', read: true }
  ];

  // Map tabs to header navigation items
  const isFiturUtamaActive = [
    'dashboard',
    'kpi-cs',
    'kpi-fos',
    'monitoring-indihome',
    'monitoring-telkomsel',
    'performance'
  ].includes(currentTab);

  const isSopFaqActive = currentTab === 'knowledge';
  const isEformActive = currentTab === 'templates';
  const isAsistenAiActive = currentTab === 'asisten-ai';

  const subItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kpi-cs', label: 'KPI CS', icon: Users },
    { id: 'kpi-fos', label: 'KPI FOS', icon: Layers },
    { id: 'monitoring-indihome', label: 'Monitoring IndiHome', icon: Activity },
    { id: 'monitoring-telkomsel', label: 'Monitoring Telkomsel', icon: Activity },
    { id: 'performance', label: 'Performance Center', icon: Award },
  ];

  return (
    <div className="sticky top-0 z-40 w-full transition-colors duration-300">
      
      {/* 1. PRIMARY HEADER BAR */}
      <header className="h-16 border-b border-gray-150/80 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
        
        {/* Left: Hamburger (for mobile) & Brand Branding */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button 
              id="btn-toggle-sidebar-mobile"
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
                alt="Telkomsel Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xs tracking-tight text-slate-950 dark:text-white uppercase leading-none">
                Grapari Garuda
              </span>
              <span className="text-[9px] text-gray-400 font-mono tracking-wider mt-0.5 leading-none font-bold">SURABAYA</span>
            </div>
          </div>
        </div>

        {/* Center: Premium Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            id="nav-fitur-utama"
            onClick={() => setCurrentTab('dashboard')}
            className={`text-xs font-bold transition-all relative py-1 cursor-pointer ${
              isFiturUtamaActive 
                ? 'text-red-600 dark:text-red-400 font-extrabold' 
                : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span>Fitur Utama</span>
            {isFiturUtamaActive && (
              <span className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-red-600 dark:bg-red-500 rounded-full" />
            )}
          </button>

          <button
            id="nav-sop-faq"
            onClick={() => setCurrentTab('knowledge')}
            className={`text-xs font-bold transition-all relative py-1 cursor-pointer ${
              isSopFaqActive 
                ? 'text-red-600 dark:text-red-400 font-extrabold' 
                : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span>SOP & FAQ</span>
            {isSopFaqActive && (
              <span className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-red-600 dark:bg-red-500 rounded-full" />
            )}
          </button>

          <button
            id="nav-eform"
            onClick={() => setCurrentTab('templates')}
            className={`text-xs font-bold transition-all relative py-1 cursor-pointer ${
              isEformActive 
                ? 'text-red-600 dark:text-red-400 font-extrabold' 
                : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span>E-Form Digital</span>
            {isEformActive && (
              <span className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-red-600 dark:bg-red-500 rounded-full" />
            )}
          </button>

          <button
            id="nav-asisten-ai"
            onClick={() => setCurrentTab('asisten-ai')}
            className={`text-xs font-bold transition-all relative py-1 cursor-pointer ${
              isAsistenAiActive 
                ? 'text-red-600 dark:text-red-400 font-extrabold' 
                : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Asisten AI</span>
            </span>
            {isAsistenAiActive && (
              <span className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-red-600 dark:bg-red-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Actions: Spotlight, Theme, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-2 md:gap-3.5 shrink-0">
          
          {/* Spotlight Search Trigger Box */}
          <button 
            id="btn-global-search"
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center md:justify-start gap-2 p-2 md:px-3 md:py-1.5 rounded-xl border border-gray-150 dark:border-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-900 bg-gray-50/50 dark:bg-zinc-900/40 text-gray-400 text-xs w-9 md:w-44 transition-all duration-150 text-left cursor-pointer shrink-0 shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline flex-1 truncate text-[11px] font-medium">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[8px] font-mono text-gray-400 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button 
            id="btn-toggle-theme"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-100 dark:hover:border-zinc-850 cursor-pointer transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notificationsRef}>
            <button 
              id="btn-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-100 dark:hover:border-zinc-850 cursor-pointer transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-zinc-950 animate-pulse"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-950 rounded-2xl border border-gray-150 dark:border-zinc-900 shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between">
                  <h3 className="font-bold text-xs text-gray-900 dark:text-white">Notifikasi Aktivitas</h3>
                  <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                    {notifications.filter(n => !n.read).length} Baru
                  </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-zinc-900 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3.5 transition-colors text-left flex gap-3 ${!n.read ? 'bg-red-500/[0.02] dark:bg-red-500/[0.01]' : ''}`}>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-red-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.desc}</p>
                        <span className="text-[9px] text-gray-400 font-mono mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Profile Dropdown Menu */}
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button
                id="btn-profile-menu-trigger"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-gray-150 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/40 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-50">
                  <img 
                    src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-0.5" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-zinc-950 rounded-2xl border border-gray-150 dark:border-zinc-900 shadow-2xl z-50 p-2 animate-fade-in text-left">
                  
                  {/* User Profile Summary */}
                  <div className="p-3 border-b border-gray-100 dark:border-zinc-900 pb-3.5 mb-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-red-500 font-extrabold uppercase mt-0.5 tracking-wider">{user.role}</p>
                    {user.nik && (
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">{user.nik}</p>
                    )}
                  </div>

                  {/* Dropdown items */}
                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl transition-all text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl transition-all text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>System Settings</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      </header>

      {/* 2. SECONDARY SUB-HEADER BAR FOR OPERATIONAL FEATURES (Fitur Utama sub-tabs) */}
      {isFiturUtamaActive && (
        <div className="h-14 border-b border-gray-150/70 dark:border-zinc-900/60 bg-slate-50/60 dark:bg-zinc-950/40 backdrop-blur-md px-4 md:px-8 flex items-center gap-4 overflow-x-auto scrollbar-none scroll-smooth">
          {/* Decorative Section Tag for Context */}
          <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 dark:border-zinc-850 pr-4 shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              OPERASIONAL SUITE
            </span>
          </div>

          {/* Tab Button Row */}
          <div className="flex items-center gap-2 md:gap-3 py-1.5 overflow-x-auto scrollbar-none scroll-smooth">
            {subItems.map((sub) => {
              const Icon = sub.icon;
              const isActive = currentTab === sub.id;
              return (
                <button
                  key={sub.id}
                  id={`sub-tab-${sub.id}`}
                  onClick={() => setCurrentTab(sub.id)}
                  className={`text-[11px] font-bold py-1.5 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer transform hover:scale-[1.01] active:scale-95 group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-600 dark:to-rose-500 text-white shadow-md shadow-red-500/15 dark:shadow-red-600/10 font-extrabold border border-transparent'
                      : 'bg-white dark:bg-zinc-900/40 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 border border-gray-100/60 dark:border-zinc-900 shadow-2xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300'}`} />
                  <span>{sub.label}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-white animate-fade-in shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. APPLE SPOTLIGHT SEARCH OVERLAY MODAL */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-zinc-950/30 dark:bg-zinc-950/60 backdrop-blur-xs">
          {/* Dismiss Click-away */}
          <div className="fixed inset-0 -z-10" onClick={() => setShowSearch(false)} />
          
          <div className="w-full max-w-xl bg-white/95 dark:bg-zinc-950/95 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl overflow-hidden animate-fade-in">
            {/* Input Line */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-900 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                id="input-spotlight-search"
                ref={searchInputRef}
                type="text"
                placeholder="Cari Agen, No Tiket, MSISDN, SOP, FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm text-gray-800 dark:text-white placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <kbd className="text-[10px] font-mono px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-400 border border-gray-200/50 dark:border-gray-700/50 rounded">
                ESC
              </kbd>
            </div>

            {/* Results Grid */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {!searchQuery && (
                <div className="p-8 text-center text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-red-400/80 animate-pulse" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Spotlight Search Grapari Garuda</p>
                  <p className="text-[10px] mt-1">Ketik nama agen, NIK, nomor HP, nomor Indihome, nomor tiket, atau judul SOP.</p>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-xs">Tidak menemukan hasil untuk "{searchQuery}"</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      id={`spotlight-result-${r.id}`}
                      onClick={() => {
                        setCurrentTab(r.tabTarget);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-red-500/[0.03] dark:hover:bg-red-500/[0.05] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                          {r.type === 'CS KPI' && <User className="w-4 h-4 text-emerald-500" />}
                          {r.type === 'FOS KPI' && <User className="w-4 h-4 text-purple-500" />}
                          {r.type === 'Ticket' && <Activity className="w-4 h-4 text-orange-500" />}
                          {r.type === 'Template' && <FileText className="w-4 h-4 text-blue-500" />}
                          {r.type === 'Knowledge' && <BookOpen className="w-4 h-4 text-red-500" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                            {r.title}
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[340px]">
                            {r.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <span>Go to {r.type}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Spotlight Footer */}
            <div className="p-3 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-[10px] text-gray-400 font-mono px-4">
              <span>Cari lintas divisi Grapari Garuda</span>
              <span>↑↓ Navigasi • ENTER Pilih</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
