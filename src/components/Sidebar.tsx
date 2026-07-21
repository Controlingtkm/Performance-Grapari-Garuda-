import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Activity, 
  FileText, 
  BookOpen, 
  Award, 
  UserCircle, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: { name: string; role: UserRole; photo?: string; nik: string } | null;
  onLogout: () => void;
  companyName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, companyName, isOpen = false, onClose }: SidebarProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      case 'Team Leader': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'Customer Service': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'FOS': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kpi-cs', label: 'KPI CS', icon: Users },
    { id: 'kpi-fos', label: 'KPI FOS', icon: Layers },
    { id: 'monitoring', label: 'Monitoring Center', icon: Activity, subItems: ['Indihome', 'Telkomsel'] },
    { id: 'templates', label: 'Template Center', icon: FileText },
    { id: 'knowledge', label: 'Knowledge Center', icon: BookOpen },
    { id: 'performance', label: 'Performance Center', icon: Award },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          id="sidebar-mobile-overlay"
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

       <aside className={`w-68 shrink-0 h-screen flex flex-col border-r border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-zinc-950/95 md:bg-white/70 md:dark:bg-zinc-950/70 md:backdrop-blur-md transition-all duration-300 z-50 
         ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
         md:translate-x-0 md:sticky fixed inset-y-0 left-0`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-red-500/10 dark:border-red-500/20 flex items-center justify-center p-1.5 shadow-md">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkomsel_2021_icon.svg" 
                alt="Telkomsel Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="font-semibold text-sm tracking-tight text-gray-900 dark:text-white truncate max-w-[120px]">
                {companyName}
              </h2>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Enterprise</span>
            </div>
          </div>
          {onClose && (
            <button 
              id="btn-close-sidebar-mobile"
              onClick={onClose} 
              className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      {/* User Badge */}
      {user && (
        <div className="p-4 mx-4 mt-4 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100/50 dark:border-gray-800/40 flex items-center gap-3">
          <img 
            src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
            alt={user.name} 
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-mono mt-0.5">{user.nik}</p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id || (item.subItems && currentTab.startsWith(item.id));
          
          return (
            <div key={item.id} className="space-y-0.5">
              <button
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  if (item.subItems) {
                    setCurrentTab(`${item.id}-${item.subItems[0].toLowerCase()}`);
                  } else {
                    setCurrentTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-zinc-900/60 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isActive ? 'rotate-90 text-red-500' : ''}`} />
                )}
              </button>

              {/* Collapsible Submenus */}
              {item.subItems && isActive && (
                <div className="pl-10 pr-2 py-1 space-y-1 border-l border-gray-100 dark:border-zinc-900 ml-5">
                  {item.subItems.map((sub) => {
                    const subId = `${item.id}-${sub.toLowerCase()}`;
                    const isSubActive = currentTab === subId;
                    return (
                      <button
                        key={sub}
                        id={`sidebar-sublink-${subId}`}
                        onClick={() => setCurrentTab(subId)}
                        className={`w-full text-left py-1.5 px-3 rounded-lg text-[11px] transition-all duration-150 ${
                          isSubActive
                            ? 'text-red-600 dark:text-red-400 font-semibold bg-red-500/5'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile / Action */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-900/60 space-y-2">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
    </>
  );
}
