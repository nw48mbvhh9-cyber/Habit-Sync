
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, BarChart3, Settings, CheckCircle2 } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { storage, UserSettings } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDataRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onDataRefresh }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());

  const handleSettingsChange = () => {
    const s = storage.getSettings();
    setSettings(s);
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  // Handle Theme Application including system listener
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = 
        settings.theme === 'dark' || 
        (settings.theme === 'system' && mediaQuery.matches);
      
      if (isDark) {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system changes if mode is 'system'
    if (settings.theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  const initials = useMemo(() => {
    const name = settings.userName || 'User';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  }, [settings.userName]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-[#1A1A1A] border-x border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden font-sans transition-colors duration-300">
      {/* Header - Focused and Clean */}
      <header className="pt-14 pb-4 px-6 flex items-center justify-between bg-white dark:bg-[#252525] border-b border-gray-50 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6264A7] flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-white dark:border-gray-800">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">HabitSync</h1>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Hello, {settings.userName || 'User'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-90"
          >
            <Settings size={22} className="text-gray-400 hover:text-[#6264A7]" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar bg-[#FBFBFF] dark:bg-[#1A1A1A]">
        {children}
      </main>

      {/* Simplified Bottom Navigation */}
      <footer className="pb-10 pt-3 px-6 bg-white dark:bg-[#252525] border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-colors">
        <NavItem 
          icon={<CheckCircle2 size={24} />} 
          label="Today" 
          active={activeTab === 'habits'} 
          onClick={() => setActiveTab('habits')}
        />
        <NavItem 
          icon={<BarChart3 size={24} />} 
          label="Stats" 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        />
        <NavItem 
          icon={<Calendar size={24} />} 
          label="Planner" 
          active={activeTab === 'calendar'} 
          onClick={() => setActiveTab('calendar')}
        />
      </footer>

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          onDataChange={handleSettingsChange}
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${active ? 'text-[#6264A7]' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'}`}
  >
    <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-[#6264A7]/5' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
