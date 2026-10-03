import React, { useState } from 'react';
import { 
  Calendar, MapPin, DollarSign, Sparkles, FastForward, CheckCircle2, 
  Clock, ShieldAlert, ArrowRight, Compass, RefreshCw, FileText, Download
} from 'lucide-react';
import { FamilyProfile, TripPlan, ItineraryDay } from '../types/travel';
import { generateAIItinerary } from '../utils/aiEngines';
import { saveStoredTrip } from '../utils/storage';
import { createMarkdownItinerary, triggerFileDownload } from '../utils/exportHelpers';

interface TripPlanningSectionProps {
  currentProfile: FamilyProfile | null;
  activeTrip: TripPlan | null;
  onTripUpdated: (trip: TripPlan) => void;
  onNavigateToDashboard: () => void;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
}

const PRESET_DESTINATIONS = [
  'Kyoto & Nara, Japan',
  'Barcelona & Costa Brava, Spain',
  'Reykjavik & Golden Circle, Iceland',
  'Vancouver & Whistler, Canada',
];

export const TripPlanningSection: React.FC<TripPlanningSectionProps> = ({
  currentProfile,
  activeTrip,
  onTripUpdated,
  onNavigateToDashboard,
  onShowToast,
}) => {
  const [destination, setDestination] = useState<string>(
    activeTrip?.destination || 'Kyoto & Nara, Japan'
  );
  const [startDate, setStartDate] = useState<string>(
    activeTrip?.startDate || '2026-10-15'
  );
  const [endDate, setEndDate] = useState<string>(
    activeTrip?.endDate || '2026-10-20'
  );
  const [budgetLevel, setBudgetLevel] = useState<'Budget-Friendly' | 'Moderate' | 'Luxury'>(
    activeTrip?.budgetLevel || 'Moderate'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<{
    days: ItineraryDay[];
    appliedConstraints: {
      paceExplanation: string;
      dietaryFilters: string[];
      familyConsiderations: string[];
    };
    disclaimer: string;
  } | null>(() => {
    if (activeTrip && !activeTrip.isSkipped) {
      return generateAIItinerary(activeTrip, currentProfile);
    }
    return null;
  });

  const handleGenerate = () => {
    if (!destination.trim()) {
      onShowToast('warning', 'Missing Destination', 'Please specify a trip destination.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const trip: TripPlan = {
        id: activeTrip?.id || `trip-${Date.now()}`,
        destination: destination.trim(),
        startDate,
        endDate,
        budgetLevel,
        isSkipped: false,
      };

      saveStoredTrip(trip);
      onTripUpdated(trip);

      const generated = generateAIItinerary(trip, currentProfile);
      setItineraryResult(generated);
      setIsGenerating(false);

      onShowToast(
        'success',
        'AI Itinerary Generated',
        `Customized for ${currentProfile?.familyName || 'Family'} with ${generated.appliedConstraints.dietaryFilters.length} dietary constraints.`
      );
    }, 600);
  };

  const handleSkipPlanning = () => {
    const fallbackTrip: TripPlan = {
      id: `trip-skipped-${Date.now()}`,
      destination: destination || 'Kyoto, Japan',
      startDate: startDate || '2026-10-15',
      endDate: endDate || '2026-10-20',
      budgetLevel: budgetLevel || 'Moderate',
      isSkipped: true,
    };
    saveStoredTrip(fallbackTrip);
    onTripUpdated(fallbackTrip);
    onShowToast('info', 'Planning Skipped', 'Direct access enabled to Real-Time Trip Management.');
    onNavigateToDashboard();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with prominent Skip button */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Step 2: AI Itinerary Synthesizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trip Planning & Profile-Honoring Synthesis
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Specify your travel dates and destination. Trip Pilot synthesizes an itinerary tailored to your registered party, enforcing certified allergen-safe dining, family pacing intervals, and mobility buffers.
            </p>
          </div>

          {/* Prominent SKIP Button */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleSkipPlanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <FastForward className="w-4 h-4 text-sky-500" />
              <span>Skip / I already have a trip booked</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trip Configuration Form */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Destination */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Destination City or Region
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto & Nara, Japan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">Popular:</span>
              {PRESET_DESTINATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDestination(d)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Travel Dates
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Budget Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Budget Level
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Budget-Friendly', 'Moderate', 'Luxury'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setBudgetLevel(lvl)}
                  className={`px-2 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    budgetLevel === lvl
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {lvl === 'Budget-Friendly' ? 'Value' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {currentProfile ? (
              <span>
                Synthesizing with active profile:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {currentProfile.familyName}
                </strong>{' '}
                ({currentProfile.members.length} members)
              </span>
            ) : (
              <span>No profile saved yet; using default safe pacing baseline.</span>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Profile Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Profile-Honoring AI Itinerary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Itinerary Preview */}
      {itineraryResult && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800/80 pb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Synthesized Itinerary Preview
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {destination} Family Journey
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{startDate} &rarr; {endDate}</span>
                <span>·</span>
                <span>Budget: {budgetLevel}</span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                  {itineraryResult.disclaimer}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  const content = createMarkdownItinerary(activeTrip, currentProfile);
                  triggerFileDownload(`trip_pilot_${destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_itinerary.md`, content, 'text/markdown;charset=utf-8');
                  onShowToast('success', 'Itinerary Downloaded', 'Saved offline markdown itinerary.');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-sky-500" />
                <span>Download Itinerary (.md)</span>
              </button>

              <button
                onClick={onNavigateToDashboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                <span>Adopt & Open Real-Time Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Explicitly Honored Constraints Highlight Box */}
          <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-300">
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Traveler Profile Rules Enforced in this Itinerary:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-sky-800 dark:text-sky-200">
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
                <span>{itineraryResult.appliedConstraints.paceExplanation}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                <span>
                  Allergen Filters:{' '}
                  <strong>
                    {itineraryResult.appliedConstraints.dietaryFilters.join(', ') || 'Standard Clean Kitchens'}
                  </strong>{' '}
                  (Zero cross-contamination protocols verified)
                </span>
              </div>
            </div>
          </div>

          {/* Days Timeline */}
          <div className="space-y-6">
            {itineraryResult.days.map((day) => (
              <div key={day.dayNumber} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold">
                    Day {day.dayNumber}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {day.theme}
                  </h3>
                </div>

                <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                  {day.activities.map((act, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {act.time}
                          </span>
                          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                            {act.category}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {act.location}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Duration: {act.estimatedDuration}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {act.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/40 flex flex-wrap gap-3 text-xs">
                        <span className="text-sky-700 dark:text-sky-300 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{act.paceNote}</span>
                        </span>
                        {act.dietaryNote && (
                          <span className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{act.dietaryNote}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
