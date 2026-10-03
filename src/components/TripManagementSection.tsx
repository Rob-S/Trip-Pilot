import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, ThumbsUp, Star, ThumbsDown, Clock, Search, Sparkles, 
  MapPin, ShieldAlert, CloudRain, Sun, AlertOctagon, PhoneCall, 
  ChevronRight, Compass, Heart, AlertTriangle, ArrowRight, CheckCircle2,
  Volume2, Check, ExternalLink, Download
} from 'lucide-react';
import { FamilyProfile, TripPlan, SuggestionItem } from '../types/travel';
import { 
  getTailoredSuggestions, calculateAlarmSchedule, getWeatherAlternatives, 
  getEmergencyTriage 
} from '../utils/aiEngines';
import { MOCK_NOTICE } from '../utils/storage';

interface TripManagementSectionProps {
  currentProfile: FamilyProfile | null;
  activeTrip: TripPlan | null;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
  onOpenDownloadModal?: () => void;
}

export const TripManagementSection: React.FC<TripManagementSectionProps> = ({
  currentProfile,
  activeTrip,
  onShowToast,
  onOpenDownloadModal,
}) => {
  // Real-time input & voice state
  const [contextInput, setContextInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastSentiment, setLastSentiment] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  // Sub-tool drawer/modal view states: 'none' | 'time' | 'weather' | 'emergency'
  const [activeSubTool, setActiveSubTool] = useState<'none' | 'time' | 'weather' | 'emergency'>('none');

  // Time Calculator Sub-Tool States
  const [originLocation, setOriginLocation] = useState<string>('Hotel Kanra Kyoto');
  const [destinationLocation, setDestinationLocation] = useState<string>('Nishiki Market Arcade');
  const [targetTime, setTargetTime] = useState<string>('12:30');
  const [transitMode, setTransitMode] = useState<'walking' | 'subway' | 'taxi' | 'stroller_transit'>('walking');
  const [alarmScheduleResult, setAlarmScheduleResult] = useState<ReturnType<typeof calculateAlarmSchedule> | null>(null);

  // Weather Resiliency Sub-Tool States
  const [selectedWeatherScenario, setSelectedWeatherScenario] = useState<'Heavy Rain' | 'Severe Heat Wave' | 'Sudden Thunderstorm' | 'High UV Alert'>('Heavy Rain');
  const [weatherResult, setWeatherResult] = useState<ReturnType<typeof getWeatherAlternatives> | null>(null);

  // Emergency Assistant Sub-Tool States
  const [selectedEmergencyIssue, setSelectedEmergencyIssue] = useState<'child_fever' | 'lost_medication' | 'allergic_reaction'>('child_fever');
  const [emergencyResult, setEmergencyResult] = useState<ReturnType<typeof getEmergencyTriage> | null>(null);
  const [copiedBilingual, setCopiedBilingual] = useState(false);

  // Initialize suggestions
  useEffect(() => {
    const list = getTailoredSuggestions(contextInput, currentProfile, lastSentiment || undefined);
    setSuggestions(list);
  }, [contextInput, currentProfile, lastSentiment]);

  // Voice input handling (supports simulated voice transcription + Web Speech API fallback)
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    onShowToast('info', 'Voice Input Active', 'Listening for contextual travel query...');

    // Attempt real Web Speech API if supported in browser, otherwise provide immediate realistic sample
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setContextInput(transcript);
          setIsListening(false);
          onShowToast('success', 'Voice Captured', `Transcribed: "${transcript}"`);
        };
        recognition.onerror = () => {
          fallbackVoiceSimulation();
        };
        recognition.start();
        return;
      } catch {
        fallbackVoiceSimulation();
      }
    } else {
      fallbackVoiceSimulation();
    }
  };

  const fallbackVoiceSimulation = () => {
    setTimeout(() => {
      const voiceSamples = [
        'Kids are getting hungry, need a peanut-safe lunch nearby with step-free entrance',
        'Sudden rain starting outside, need dry indoor rest spot',
        'Looking for a quiet shaded garden to unwind before dinner',
      ];
      const randomSample = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
      setContextInput(randomSample);
      setIsListening(false);
      onShowToast('success', 'Voice Transcribed', `Simulated voice input: "${randomSample}"`);
    }, 1400);
  };

  // Sentiment Strip Click Handlers
  const handleSentimentClick = (sentimentKey: string, toastTitle: string, toastMessage: string) => {
    setLastSentiment(sentimentKey);
    onShowToast('success', toastTitle, `${toastMessage} ${MOCK_NOTICE}`);
  };

  // Calculator trigger
  const handleCalculateAlarms = () => {
    const pace = currentProfile?.members[0]?.pace || 'Slow/Relaxed';
    const hasKids = currentProfile?.members.some((m) => m.role === 'Child') || false;

    const res = calculateAlarmSchedule({
      origin: originLocation,
      destination: destinationLocation,
      targetArrivalTime: targetTime,
      transitMode,
      pace,
      hasKids,
    });
    setAlarmScheduleResult(res);
    onShowToast('info', 'Alarm Schedule Calculated', `${res.summaryNote} ${MOCK_NOTICE}`);
  };

  // Weather scenario trigger
  const handleTriggerWeatherScenario = (scenario: typeof selectedWeatherScenario) => {
    setSelectedWeatherScenario(scenario);
    const res = getWeatherAlternatives(scenario, currentProfile);
    setWeatherResult(res);
  };

  // Emergency assistant trigger
  const handleTriggerEmergency = (issue: typeof selectedEmergencyIssue) => {
    setSelectedEmergencyIssue(issue);
    const res = getEmergencyTriage(issue);
    setEmergencyResult(res);
  };

  // Initial load for sub-tools when opened
  useEffect(() => {
    if (activeSubTool === 'time' && !alarmScheduleResult) {
      handleCalculateAlarms();
    } else if (activeSubTool === 'weather' && !weatherResult) {
      handleTriggerWeatherScenario(selectedWeatherScenario);
    } else if (activeSubTool === 'emergency' && !emergencyResult) {
      handleTriggerEmergency(selectedEmergencyIssue);
    }
  }, [activeSubTool]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Section Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Real-Time Travel Copilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trip Management & Problem Solving
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Active Trip: <strong>{activeTrip?.destination || 'Kyoto, Japan'}</strong> · Party Profile: <strong>{currentProfile?.familyName || 'Family Group'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTool(activeSubTool === 'time' ? 'none' : 'time')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                activeSubTool === 'time'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time Calculator</span>
            </button>

            <button
              onClick={() => setActiveSubTool(activeSubTool === 'weather' ? 'none' : 'weather')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                activeSubTool === 'weather'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Weather Resiliency</span>
            </button>

            <button
              onClick={() => setActiveSubTool(activeSubTool === 'emergency' ? 'none' : 'emergency')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                activeSubTool === 'emergency'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Emergency Triage</span>
            </button>

            {onOpenDownloadModal && (
              <button
                onClick={onOpenDownloadModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                title="Download complete offline trip packet"
              >
                <Download className="w-3.5 h-3.5 text-sky-500" />
                <span>Download Files</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORE SPECIFIED INTERACTION BOX:
          1. ACTION PROMPTS & CONTEXT INPUT
          2. FEEDBACK SENTIMENT STRIP
          3. AI SUGGESTIONS ENGINE
      */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        {/* 1. ACTION PROMPTS & CONTEXT INPUT */}
        <div className="space-y-3">
          {/* Exact required text prompts stacked vertically */}
          <div className="space-y-0.5">
            <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              What are you doing now? or ...
            </p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              What would you like to do next
            </p>
          </div>

          {/* Wide text input field with embedded microphone icon inside right-hand boundary */}
          <div className="relative">
            <input
              type="text"
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              placeholder="e.g. Kids are getting restless, looking for a shaded garden or allergy-safe gelato..."
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base shadow-inner transition-all"
            />
            {/* Embedded microphone icon inside right-hand boundary */}
            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label="Toggle voice input"
              title="Voice Input Support"
              className={`absolute right-2.5 top-2.5 p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                  : 'text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-5 h-5 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>

          {isListening && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Microphone listening... Speak naturally about your current location or needs.</span>
            </div>
          )}

          {/* Quick Context Chips for easy testing */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Context:</span>
            {[
              'Looking for dinner now',
              'Kids are getting tired',
              'Sudden rain starting',
              'Need quiet stroller path',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setContextInput(chip)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 transition-colors"
              >
                {chip}
              </button>
            ))}
            {contextInput && (
              <button
                onClick={() => setContextInput('')}
                className="text-xs text-slate-400 hover:text-slate-600 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 2. FEEDBACK SENTIMENT STRIP
            Single horizontal line of action buttons containing the EXACT text and icons:
            - 👍 Loved it!
            - & Favorite it ⭐
            - 👎 Hated it!
            - 🕑 Try another time
        */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Feedback Sentiment Strip
          </label>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
            <button
              onClick={() =>
                handleSentimentClick(
                  'loved',
                  'Activity Feedback: Loved it!',
                  'Marked as positive experience. AI suggestions updated with similar serene destinations.'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                lastSentiment === 'loved'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <ThumbsUp className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>👍 Loved it!</span>
            </button>

            <button
              onClick={() =>
                handleSentimentClick(
                  'favorite',
                  'Saved to Favorites',
                  'Saved location into your permanent family travel guidebook.'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                lastSentiment === 'favorite'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <Star className="w-4 h-4 shrink-0 text-amber-500 fill-amber-400" />
              <span>& Favorite it ⭐</span>
            </button>

            <button
              onClick={() =>
                handleSentimentClick(
                  'hated',
                  'Activity Feedback: Hated it!',
                  'Filtered this category and noisy venues out of upcoming itinerary suggestions.'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                lastSentiment === 'hated'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
              }`}
            >
              <ThumbsDown className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>👎 Hated it!</span>
            </button>

            <button
              onClick={() =>
                handleSentimentClick(
                  'reschedule',
                  'Rescheduling Request',
                  'Slot deferred. Suggested lower-stress alternative queued for tomorrow morning.'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                lastSentiment === 'reschedule'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0 text-sky-500" />
              <span>🕑 Try another time</span>
            </button>
          </div>
        </div>

        {/* 3. AI SUGGESTIONS ENGINE
            Clear heading titled "Suggestions:"
            Beneath this heading, display dynamically generated list of tailored travel recommendations simulated by JavaScript "AI".
            Adjusts based on active profile restrictions (dietary, pace) or contextual events.
        */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <span>Suggestions:</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dynamically adapted to profile constraints ({currentProfile?.members[0]?.pace || 'Slow/Relaxed'} pace)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-sky-700 transition-all space-y-3 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <span className="shrink-0 text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {item.location}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Profile constraint match justification */}
                <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>{item.matchReason}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/40">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      onShowToast(
                        'success',
                        'Route Queued',
                        `Navigating to ${item.title}. Safe family walking path mapped. ${MOCK_NOTICE}`
                      )
                    }
                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Route Here</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTEXTUAL MODAL / SUB-TOOL 1: Time Management Calculator */}
      {activeSubTool === 'time' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-sky-300 dark:border-sky-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Time Management & Alarm Schedule Calculator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Computes realistic alarm schedules taking your family profile&apos;s pace ({currentProfile?.members[0]?.pace || 'Slow/Relaxed'}) into account.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTool('none')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
            >
              Close &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Current Origin
              </label>
              <input
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Destination
              </label>
              <input
                type="text"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Arrival Time
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Transit Mode
              </label>
              <select
                value={transitMode}
                onChange={(e) => setTransitMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="walking">Walking (Direct)</option>
                <option value="stroller_transit">Stroller-Friendly (Elevators Only)</option>
                <option value="subway">Subway / Metro</option>
                <option value="taxi">Taxi / Rideshare</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCalculateAlarms}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              Recompute Schedule
            </button>
          </div>

          {alarmScheduleResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {alarmScheduleResult.summaryNote}
                </span>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  {alarmScheduleResult.disclaimer}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    1. Morning Wake-Up Alarm
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {alarmScheduleResult.wakeUpAlarm}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gives 65m leisurely breakfast and allergy prep.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    2. Staging & Shoe Check
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                    {alarmScheduleResult.prepAlarm}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    20m buffer for sunscreen, water bottles, and stroller check.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    3. Depart Lobby Prompt
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {alarmScheduleResult.departureTime}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Arrives at target destination comfortably on time.
                  </p>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Calculated Buffer Breakdown:
                </span>
                {alarmScheduleResult.breakdown.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-white/50 dark:bg-slate-900/50"
                  >
                    <span className="text-slate-800 dark:text-slate-200">{b.label}</span>
                    <span className="text-slate-500 font-mono">+{b.minutes} mins ({b.note})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEXTUAL MODAL / SUB-TOOL 2: Weather Resiliency Engine */}
      {activeSubTool === 'weather' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-sky-300 dark:border-sky-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Weather Resiliency Engine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulate adverse microclimates and instantly deploy sheltered, profile-safe indoor alternatives.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTool('none')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
            >
              Close &times;
            </button>
          </div>

          {/* Scenario Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Select Simulated Weather Event:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Heavy Rain', 'Severe Heat Wave', 'Sudden Thunderstorm', 'High UV Alert'] as const).map(
                (sc) => (
                  <button
                    key={sc}
                    onClick={() => handleTriggerWeatherScenario(sc)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedWeatherScenario === sc
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {sc}
                  </button>
                )
              )}
            </div>
          </div>

          {weatherResult && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="font-bold text-amber-900 dark:text-amber-200">
                    {weatherResult.scenarioTitle}:
                  </strong>{' '}
                  <span className="text-amber-800 dark:text-amber-300">
                    {weatherResult.impactAlert}
                  </span>
                  <div className="mt-1 font-mono text-[10px] text-amber-700 dark:text-amber-400">
                    {weatherResult.disclaimer}
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Profile-Adapted Indoor Replacements:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {weatherResult.indoorAlternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      {alt.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {alt.description}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] space-y-1">
                      <div className="text-sky-600 dark:text-sky-400 font-medium">
                        ✓ {alt.whySafe}
                      </div>
                      <div className="text-slate-400">
                        Transit: {alt.transitAdvice}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contingency Gear */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Recommended Weather Contingency Gear:
                </span>
                <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
                  {weatherResult.contingencyKit.map((gear, i) => (
                    <li key={i}>{gear}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEXTUAL MODAL / SUB-TOOL 3: Emergency Crisis Assistant */}
      {activeSubTool === 'emergency' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-rose-300 dark:border-rose-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900 pb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="font-bold text-lg text-rose-950 dark:text-rose-100">
                  Emergency Crisis Assistant & Logistical Triage
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Immediate calm logistical triage flows handling unexpected medical and travel crises.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTool('none')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
            >
              Close &times;
            </button>
          </div>

          {/* Mandatory Critical Notice Banner */}
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 font-mono">
            <strong>CRITICAL NOTICE:</strong> {MOCK_NOTICE} For acute life-threatening emergencies, always dial local emergency dispatch (119 in Japan, 911 in North America, 112 in Europe).
          </div>

          {/* Crisis Scenario Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Select Urgent Crisis Flow:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'child_fever', label: "Child's Sudden Fever (39°C)" },
                { id: 'lost_medication', label: 'Lost Prescription Medication' },
                { id: 'allergic_reaction', label: 'Allergic Reaction Precaution' },
              ].map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => handleTriggerEmergency(flow.id as any)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    selectedEmergencyIssue === flow.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {flow.label}
                </button>
              ))}
            </div>
          </div>

          {emergencyResult && (
            <div className="space-y-6">
              {/* Step-by-Step Triage Guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Step-by-Step Triage Protocol</span>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40">
                    Urgency: {emergencyResult.urgencyLevel}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyResult.triageSteps.map((step) => (
                    <div
                      key={step.step}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                          {step.step}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                          {step.action}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                        {step.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bilingual Translator Card for Taxi / Concierge */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-700 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Show to Driver or Concierge (Bilingual Card)</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(emergencyResult.bilingualCard.localized);
                      setCopiedBilingual(true);
                      setTimeout(() => setCopiedBilingual(false), 2000);
                      onShowToast('info', 'Text Copied', 'Japanese phrase copied to clipboard.');
                    }}
                    className="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {copiedBilingual ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                    <span>{copiedBilingual ? 'Copied' : 'Copy Japanese'}</span>
                  </button>
                </div>

                <div className="text-base sm:text-lg font-bold text-emerald-300 pt-1 leading-relaxed">
                  {emergencyResult.bilingualCard.localized}
                </div>
                <div className="text-xs text-slate-300 italic">
                  Phonetic: &ldquo;{emergencyResult.bilingualCard.phonetic}&rdquo;
                </div>
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                  English meaning: &ldquo;{emergencyResult.bilingualCard.english}&rdquo;
                </div>
              </div>

              {/* Nearest Vetted Medical Facilities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nearest Vetted Medical Facilities (Simulated):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyResult.nearestFacilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between"
                    >
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {fac.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {fac.type} · {fac.address}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {fac.openNow ? '● Open 24/7' : 'Standard Hours'} · {fac.distance}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onShowToast(
                            'info',
                            'Simulated GPS Dispatch',
                            `Direct navigation route generated to ${fac.name}. ${MOCK_NOTICE}`
                          )
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition-colors"
                      >
                        Navigate
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Contacts Hotline */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                  <span>Verified Emergency Numbers:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {emergencyResult.localContacts.map((c, i) => (
                    <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-rose-600 dark:text-rose-400 font-mono font-bold">{c.number}</div>
                      <div className="text-[10px] text-slate-400">{c.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
