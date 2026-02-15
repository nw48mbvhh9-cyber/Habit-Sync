
import React, { useState, useEffect } from 'react';
import { X, Download, Upload, Trash2, User, ShieldCheck, Info, Github, Moon, Sun, Monitor, Calendar } from 'lucide-react';
import { storage, UserSettings, ThemeMode } from '../services/storage';

interface SettingsModalProps {
  onClose: () => void;
  onDataChange: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onDataChange }) => {
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [isResetting, setIsResetting] = useState(false);
  const [resetTimer, setResetTimer] = useState<number | null>(null);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    onDataChange();
  };

  const handleExport = () => {
    storage.exportData();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importData(content)) {
        onDataChange();
        // Since we removed reload(), we need to manually trigger refresh. 
        // onDataChange will do this in the parent.
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isResetting) {
      // 1. Clear filled data only (habits and logs)
      storage.clearAllData();
      
      // 2. Notify Layout/App to refresh state immediately
      onDataChange();
      
      // 3. Clear UI state
      if (resetTimer) clearTimeout(resetTimer);
      setIsResetting(false);
      
      // 4. Close the modal to show the clean state
      onClose();
    } else {
      setIsResetting(true);
      // Create a 5-second window to confirm before auto-canceling
      if (resetTimer) clearTimeout(resetTimer);
      const timer = window.setTimeout(() => setIsResetting(false), 5000);
      setResetTimer(timer);
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [resetTimer]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="bg-[#FBFBFF] dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 bg-white dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Profile Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <User size={14} className="text-[#6264A7]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Profile</h3>
            </div>
            <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Display Name</label>
                <input 
                  type="text" 
                  value={settings.userName}
                  onChange={(e) => updateSetting('userName', e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#6264A7] focus:border-transparent outline-none transition-all text-sm font-medium dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Monitor size={14} className="text-[#6264A7]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Appearance</h3>
            </div>
            <div className="bg-white dark:bg-[#252525] p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex gap-1">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateSetting('theme', mode)}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all capitalize text-[10px] font-bold ${
                    settings.theme === mode 
                    ? 'bg-[#6264A7] text-white shadow-md' 
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {mode === 'light' && <Sun size={18} />}
                  {mode === 'dark' && <Moon size={18} />}
                  {mode === 'system' && <Monitor size={18} />}
                  {mode}
                </button>
              ))}
            </div>
          </section>

          {/* Preferences Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={14} className="text-[#6264A7]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Preferences</h3>
            </div>
            <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Start of week</p>
                    <p className="text-[10px] text-gray-400">Affects calendar and stats</p>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg">
                    <button 
                      onClick={() => updateSetting('startOfWeek', 1)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all ${settings.startOfWeek === 1 ? 'bg-white dark:bg-[#252525] text-[#6264A7] shadow-sm' : 'text-gray-400'}`}
                    >
                      MON
                    </button>
                    <button 
                      onClick={() => updateSetting('startOfWeek', 0)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all ${settings.startOfWeek === 0 ? 'bg-white dark:bg-[#252525] text-[#6264A7] shadow-sm' : 'text-gray-400'}`}
                    >
                      SUN
                    </button>
                  </div>
               </div>
            </div>
          </section>

          {/* Data Management Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={14} className="text-[#6264A7]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Data Management</h3>
            </div>
            <div className="bg-white dark:bg-[#252525] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800">
              <button 
                onClick={handleExport}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg">
                    <Download size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Export Backup</p>
                    <p className="text-[10px] text-gray-400">Download your data as JSON</p>
                  </div>
                </div>
              </button>

              <label className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-lg">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Import Data</p>
                    <p className="text-[10px] text-gray-400">Restore from a JSON file</p>
                  </div>
                </div>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <button 
                onClick={handleReset}
                className={`w-full px-5 py-4 flex items-center justify-between transition-all text-left ${isResetting ? 'bg-red-600 text-white' : 'hover:bg-red-50/30 dark:hover:bg-red-500/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isResetting ? 'bg-white text-red-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isResetting ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                      {isResetting ? 'Confirm Reset Now' : 'Factory Reset'}
                    </p>
                    <p className={`text-[10px] ${isResetting ? 'text-white/80' : 'text-gray-400'}`}>
                       {isResetting ? 'Click again to wipe all records' : 'Wipe habits and progress records'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* About Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Info size={14} className="text-[#6264A7]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">About</h3>
            </div>
            <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Version</span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">1.3.4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Storage Type</span>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                   Local Secure Storage
                </span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white dark:bg-[#252525] border-t border-gray-50 dark:border-gray-800">
           <p className="text-[10px] text-center text-gray-400 font-medium leading-relaxed">
             HabitSync Private Productivity Tool.<br/>
             <span className="text-[#6264A7] font-bold">Developed by RTSN Labs.</span><br/>
             Your settings are preserved during reset.
           </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
