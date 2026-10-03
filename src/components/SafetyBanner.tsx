import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <aside 
      aria-label="MVP Simulation Mode Notice"
      className="sticky top-0 z-50 w-full bg-amber-500/90 dark:bg-amber-600/90 text-amber-950 dark:text-amber-50 backdrop-blur-md px-4 py-2 border-b border-amber-600/30 shadow-sm text-xs md:text-sm font-medium transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-900 dark:text-amber-200 animate-pulse" />
          <span className="truncate">
            <strong className="font-bold tracking-tight">⚠️ MVP SIMULATION MODE:</strong> All AI insights, transit calculations, weather routing, and emergency triage protocols are mock simulations for demonstration purposes only.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-amber-900/15 dark:bg-amber-950/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Architectural Sandbox</span>
        </div>
      </div>
    </aside>
  );
};
