import React, { useState } from 'react';
import { Wrench, RotateCcw, Sparkles, ChevronUp, ChevronDown, CheckCircle2, Download } from 'lucide-react';
import { clearAllDemoData, loadDemoPreset } from '../utils/storage';

interface AdminToolsTrayProps {
  onDataReset?: () => void;
  onPresetLoaded?: () => void;
  hasProfile: boolean;
  hasTrip: boolean;
  onOpenDownloadModal?: () => void;
}

export const AdminToolsTray: React.FC<AdminToolsTrayProps> = ({
  hasProfile,
  hasTrip,
  onDataReset,
  onPresetLoaded,
  onOpenDownloadModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleReset = () => {
    // Single-click instantaneous wipe without blocking window.confirm (avoids iframe sandbox modal blockage)
    clearAllDemoData();
    onDataReset?.();
    setFeedback('App Reset to Clean Slate!');
    setTimeout(() => {
      try {
        window.location.reload();
      } catch (e) {
        console.warn('Page reload skipped or blocked by iframe:', e);
      }
    }, 150);
  };

  const handleLoadPreset = () => {
    loadDemoPreset();
    onPresetLoaded?.();
    setFeedback('Preset Family Loaded!');
    setTimeout(() => {
      try {
        window.location.reload();
      } catch (e) {
        console.warn('Page reload skipped or blocked by iframe:', e);
      }
    }, 150);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 pb-2 flex flex-col items-end">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-slate-900/90 dark:bg-slate-800/90 text-slate-200 hover:text-white border-t border-x border-slate-700/60 backdrop-blur-md text-xs font-semibold shadow-lg transition-all hover:bg-slate-800"
          aria-expanded={isOpen}
          aria-label="Toggle Developer Admin Tools"
        >
          <Wrench className="w-3.5 h-3.5 text-sky-400" />
          <span>Developer Admin Tools</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {/* Tray Panel */}
        {isOpen && (
          <div className="pointer-events-auto w-full max-w-xl bg-slate-950/95 dark:bg-slate-900/95 text-slate-100 border border-slate-800 rounded-tl-xl rounded-b-none p-4 shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-sky-400 uppercase tracking-wider">
                  Admin Sandbox Controls
                </span>
                <span className="text-[11px] text-slate-400">
                  (Single-click live pitch resets)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  Profile: <strong className={hasProfile ? 'text-emerald-400' : 'text-amber-400'}>
                    {hasProfile ? 'Configured' : 'Empty'}
                  </strong>
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  Trip: <strong className={hasTrip ? 'text-emerald-400' : 'text-slate-400'}>
                    {hasTrip ? 'Active' : 'None'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 rounded-md transition-all active:scale-95"
                  title="Wipes localStorage and reloads the application"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset App & Clear Demo Data</span>
                </button>

                <button
                  onClick={handleLoadPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/80 rounded-md transition-all active:scale-95"
                  title="Populates complete family profile (Miller Family: 3 members, Nut Allergy, Gluten-Free, Slow Pace)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Load Preset Family Profile</span>
                </button>

                {onOpenDownloadModal && (
                  <button
                    onClick={onOpenDownloadModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-md transition-all active:scale-95"
                    title="Export and download all travel files and profile data"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Files</span>
                  </button>
                )}
              </div>

              {feedback && (
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{feedback}</span>
                </div>
              )}
            </div>
            
            <p className="mt-2.5 text-[11px] text-slate-400 leading-normal">
              Notice: Resetting clears local traveler preferences, saved itinerary, and returns the view to initial step 1 onboarding.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};
