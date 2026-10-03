import React from 'react';
import { Compass, Users, MapPin, Gauge, Moon, Sun, Download } from 'lucide-react';
import { AppTab, FamilyProfile } from '../types/travel';

interface NavigationProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  profile: FamilyProfile | null;
  onOpenDownloadModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  darkMode,
  onToggleDarkMode,
  profile,
  onOpenDownloadModal,
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'onboarding',
      label: 'Onboarding & Profiles',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'planning',
      label: 'Trip Planning',
      icon: <MapPin className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'management',
      label: 'Trip Management Dashboard',
      icon: <Gauge className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <header className="sticky top-[37px] z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark / brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Trip Pilot
          </span>
        </div>

        {/* Zone 2: Glassmorphic Tab Navigation Bar */}
        <nav 
          aria-label="Application Sections"
          className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-300/40 dark:border-slate-700/40"
        >
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm shadow-slate-900/10 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">
                  {tab.id === 'onboarding' ? 'Profiles' : tab.id === 'planning' ? 'Planning' : 'Dashboard'}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Download Files, Dark Mode Toggle & Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            title="Download offline travel files, itinerary, and emergency cards"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">Download Files</span>
          </button>

          {profile && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium truncate max-w-[120px]">{profile.familyName || 'Profile Active'}</span>
              <span className="text-slate-400">({profile.members.length} {profile.members.length === 1 ? 'member' : 'members'})</span>
            </div>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
