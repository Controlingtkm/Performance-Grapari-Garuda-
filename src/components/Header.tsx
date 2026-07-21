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
  Menu
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
  user: { name: string; role: UserRole; photo?: string } | null;
  onToggleSidebar?: () => void;
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
  onToggleSidebar
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Search FOS KPI
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

    // Search Monitoring (Ticket, Customer Name, MSISDN, Indihome Number)
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

    // Search Templates
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

    // Search Knowledge Center
    knowledgeData.forEach(kn => {
      if (
        kn.title.toLowerCase().includes(query) ||
        kn.content.toLowerCase().includes(query) ||
        kn.tags.some(t => t.toLowerCase().includes(query))
      ) {
        results.push({
          id: kn.id,
          title: kn.title,
          subtitle: `Knowledge Center • SOP & FAQ • Tags: ${kn.tags.join(', ')}`,
          type: 'Knowledge',
          tabTarget: 'knowledge'
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limit to top 8
  }, [searchQuery, kpiCsData, kpiFosData, monitoringData, templatesData, knowledgeData]);

  // Static/Mock notifications matching requested notifications
  const notifications = [
    { id: 1, type: 'achievement', title: 'Achievement Updated', desc: 'Siti Rahma achieved 98.4% score!', time: '5m ago', read: false },
    { id: 2, type: 'due', title: 'Monitoring Due', desc: 'Ticket TS-2026-101 requires verification in 30m.', time: '12m ago', read: false },
    { id: 3, type: 'sla', title: 'SLA Warning', desc: 'Ticket TS-2026-102 is currently over-due by 2h.', time: '1h ago', read: true },
    { id: 4, type: 'upload', title: 'Success Upload Excel', desc: 'CS KPI parsed successfully. 6 records synchronized.', time: '2h ago', read: true },
    { id: 5, type: 'finished', title: 'Import Finished', desc: 'Sheet "Monitoring_Indihome" refreshed successfully.', time: '5h ago', read: true }
  ];

  const getBreadcrumbs = () => {
    const parts = currentTab.split('-');
    const formattedParts = parts.map(p => {
      if (p === 'kpi') return 'KPI';
      if (p === 'cs') return 'Customer Service';
      if (p === 'fos') return 'FOS';
      return p.charAt(0).toUpperCase() + p.slice(1);
    });
    return formattedParts;
  };

  return (
    <header className="h-16 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        {onToggleSidebar && (
          <button 
            id="btn-toggle-sidebar-mobile"
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 mr-1 shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1.5 mr-1 shrink-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
            alt="Telkomsel" 
            className="w-4.5 h-4.5 object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-gray-400 font-medium shrink-0">Grapari Garuda</span>
        </div>
        <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-gray-300 dark:text-gray-700 shrink-0" />
        <div className="flex items-center gap-1.5 truncate">
          {getBreadcrumbs().map((b, idx, arr) => (
            <React.Fragment key={b}>
              <span className={`truncate ${idx === arr.length - 1 ? 'text-gray-800 dark:text-white font-semibold' : 'text-gray-400 font-medium'}`}>
                {b}
              </span>
              {idx < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        
        {/* Apple Spotlight Search Trigger Box */}
        <button 
          id="btn-global-search"
          onClick={() => setShowSearch(true)}
          className="flex items-center justify-center md:justify-start gap-2 p-2 md:px-3 md:py-1.5 rounded-lg border border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-zinc-900 bg-gray-50/50 dark:bg-zinc-900/40 text-gray-400 text-xs w-9 md:w-56 transition-all duration-150 text-left cursor-pointer shrink-0"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline flex-1 truncate">Search everything...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-gray-400 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button 
          id="btn-toggle-theme"
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button 
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950 animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 shadow-xl overflow-hidden z-50 animate-fade-in rounded-apple">
                <div className="p-4 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-gray-900 dark:text-white">Notifikasi Aktivitas</h3>
                  <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                    {notifications.filter(n => !n.read).length} Baru
                  </span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-900 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3.5 transition-colors text-left flex gap-3 ${!n.read ? 'bg-red-50/10 dark:bg-red-950/5' : ''}`}>
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
            </>
          )}
        </div>

        {/* Small Profile Orb */}
        {user && (
          <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0 bg-gray-50">
            <img 
              src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

      </div>

      {/* APPLE SPOTLIGHT OVERLAY MODAL */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-zinc-950/30 dark:bg-zinc-950/60 backdrop-blur-xs">
          {/* Dismiss Click-away */}
          <div className="fixed inset-0 -z-10" onClick={() => setShowSearch(false)} />
          
          <div className="w-full max-w-xl bg-white/95 dark:bg-zinc-950/95 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl overflow-hidden animate-fade-in rounded-apple">
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
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
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
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-red-400/80" />
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
                      className="w-full text-left p-3 rounded-xl hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors flex items-center justify-between group"
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
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[400px]">
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

    </header>
  );
}
