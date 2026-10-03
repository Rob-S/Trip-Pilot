import React, { useState } from 'react';
import { 
  Download, FileText, FileCode, ShieldAlert, X, Check, Copy, Sparkles, ExternalLink 
} from 'lucide-react';
import { FamilyProfile, TripPlan } from '../types/travel';
import { 
  createMarkdownItinerary, 
  createProfileJson, 
  createEmergencyCardText, 
  createFullTripBundleJson, 
  triggerFileDownload 
} from '../utils/exportHelpers';

interface DownloadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FamilyProfile | null;
  trip: TripPlan | null;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
}

export const DownloadFilesModal: React.FC<DownloadFilesModalProps> = ({
  isOpen,
  onClose,
  profile,
  trip,
  onShowToast,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<'itinerary' | 'emergency' | 'bundle'>('itinerary');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const destinationSlug = (trip?.destination || 'trip')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 20);

  const handleDownloadItinerary = () => {
    const content = createMarkdownItinerary(trip, profile);
    const filename = `trip_pilot_${destinationSlug}_itinerary.md`;
    triggerFileDownload(filename, content, 'text/markdown;charset=utf-8');
    onShowToast('success', 'File Downloaded', `Saved ${filename} for offline use.`);
  };

  const handleDownloadEmergencyCards = () => {
    const content = createEmergencyCardText(profile);
    const filename = `trip_pilot_emergency_bilingual_cards.txt`;
    triggerFileDownload(filename, content, 'text/plain;charset=utf-8');
    onShowToast('success', 'File Downloaded', `Saved ${filename} for offline travel safety.`);
  };

  const handleDownloadProfilesJson = () => {
    const content = createProfileJson(profile);
    const filename = `trip_pilot_traveler_profiles.json`;
    triggerFileDownload(filename, content, 'application/json;charset=utf-8');
    onShowToast('success', 'File Downloaded', `Saved ${filename} profile data.`);
  };

  const handleDownloadFullBundle = () => {
    const content = createFullTripBundleJson(profile, trip);
    const filename = `trip_pilot_complete_dossier.json`;
    triggerFileDownload(filename, content, 'application/json;charset=utf-8');
    onShowToast('success', 'Full Bundle Downloaded', `Saved ${filename} with complete trip parameters.`);
  };

  const currentPreviewText = 
    selectedPreview === 'itinerary'
      ? createMarkdownItinerary(trip, profile)
      : selectedPreview === 'emergency'
      ? createEmergencyCardText(profile)
      : createFullTripBundleJson(profile, trip);

  const handleCopyPreview = () => {
    navigator.clipboard?.writeText(currentPreviewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('info', 'Copied to Clipboard', 'File content copied.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Download Travel Files & Offline Dossier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export offline-ready itineraries, emergency bilingual cards, and structured JSON profiles.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Download Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Markdown Itinerary */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Offline Guide
                  </span>
                  <FileText className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Trip Itinerary (.md)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Day-by-day timetable, restaurant notes, and pace buffer annotations.
                </p>
              </div>

              <button
                onClick={handleDownloadItinerary}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>

            {/* Card 2: Emergency Bilingual Cards */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Emergency Kit
                  </span>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Medical Cards (.txt)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Bilingual Japanese cards for fever, allergies, lost meds, and phone numbers.
                </p>
              </div>

              <button
                onClick={handleDownloadEmergencyCards}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .TXT</span>
              </button>
            </div>

            {/* Card 3: Profiles JSON */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Profile Data
                  </span>
                  <FileCode className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Family Profile (.json)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  JSON structure of all traveler members, diets, pacing, and preferences.
                </p>
              </div>

              <button
                onClick={handleDownloadProfilesJson}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>
            </div>

            {/* Card 4: Complete Bundle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Complete State
                  </span>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Full Bundle (.json)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Everything combined: profile, trip plan, weather, and emergency states.
                </p>
              </div>

              <button
                onClick={handleDownloadFullBundle}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Bundle</span>
              </button>
            </div>
          </div>

          {/* Interactive File Preview Pane */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  File Preview:
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                  <button
                    onClick={() => setSelectedPreview('itinerary')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      selectedPreview === 'itinerary'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Itinerary (.md)
                  </button>
                  <button
                    onClick={() => setSelectedPreview('emergency')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      selectedPreview === 'emergency'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Emergency (.txt)
                  </button>
                  <button
                    onClick={() => setSelectedPreview('bundle')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      selectedPreview === 'bundle'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Bundle (.json)
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyPreview}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-64 leading-relaxed border border-slate-800 select-all">
              {currentPreviewText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Files are compiled on-device with zero server uploads for maximum traveler privacy.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
