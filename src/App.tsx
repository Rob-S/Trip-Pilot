import React, { useState, useEffect } from 'react';
import { AppTab, FamilyProfile, TripPlan } from './types/travel';
import { 
  getStoredProfile, 
  getStoredTrip, 
  getSavedTheme, 
  saveSavedTheme 
} from './utils/storage';
import { SafetyBanner } from './components/SafetyBanner';
import { Navigation } from './components/Navigation';
import { OnboardingSection } from './components/OnboardingSection';
import { TripPlanningSection } from './components/TripPlanningSection';
import { TripManagementSection } from './components/TripManagementSection';
import { AdminToolsTray } from './components/AdminToolsTray';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DownloadFilesModal } from './components/DownloadFilesModal';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return getSavedTheme() === 'dark';
  });

  // Stored state
  const [profile, setProfile] = useState<FamilyProfile | null>(() => getStoredProfile());
  const [activeTrip, setActiveTrip] = useState<TripPlan | null>(() => getStoredTrip());

  // Download modal state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Navigation tab state: "Onboarding & Profiles" must load as the default active tab if no profile exists in localStorage
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    const existing = getStoredProfile();
    return existing ? 'management' : 'onboarding';
  });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      saveSavedTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      saveSavedTheme('light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Reset counter to force remount of all components with fresh initial state
  const [resetKey, setResetKey] = useState<number>(0);

  const handleDataReset = () => {
    setProfile(null);
    setActiveTrip(null);
    setCurrentTab('onboarding');
    setResetKey((prev) => prev + 1);
    handleShowToast(
      'info',
      'App Reset Complete',
      'All local traveler profiles and trips have been erased. Ready for fresh onboarding.'
    );
  };

  const handlePresetLoaded = () => {
    const loadedProfile = getStoredProfile();
    const loadedTrip = getStoredTrip();
    setProfile(loadedProfile);
    setActiveTrip(loadedTrip);
    setCurrentTab('management');
    setResetKey((prev) => prev + 1);
    handleShowToast(
      'success',
      'Preset Profile Loaded',
      'Loaded The Miller Family with 3 members, allergies, and slow pace.'
    );
  };

  const handleShowToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50/50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. CRITICAL SAFETY & SANDBOX SYSTEM STATE: Persistent Simulation Banner */}
      <SafetyBanner />

      {/* 2. TAB NAVIGATION: Prominent modern glassmorphic bar at the top */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        profile={profile}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main Content Area */}
      <main key={resetKey} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28">
        {/* TAB 1: Onboarding & Profile Management */}
        {currentTab === 'onboarding' && (
          <div className="transition-opacity duration-200">
            <OnboardingSection
              currentProfile={profile}
              onProfileUpdated={(updated) => {
                setProfile(updated);
              }}
              onComplete={() => {
                setCurrentTab('planning');
              }}
              onShowToast={handleShowToast}
            />
          </div>
        )}

        {/* TAB 2: Trip Planning */}
        {currentTab === 'planning' && (
          <div className="transition-opacity duration-200">
            <TripPlanningSection
              currentProfile={profile}
              activeTrip={activeTrip}
              onTripUpdated={(updatedTrip) => {
                setActiveTrip(updatedTrip);
              }}
              onNavigateToDashboard={() => {
                setCurrentTab('management');
              }}
              onShowToast={handleShowToast}
            />
          </div>
        )}

        {/* TAB 3: Real-Time Trip Management & Problem Solving Dashboard */}
        {currentTab === 'management' && (
          <div className="transition-opacity duration-200">
            <TripManagementSection
              currentProfile={profile}
              activeTrip={activeTrip}
              onShowToast={handleShowToast}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* 3. PERSISTENT DEVELOPER ADMIN TOOLS TRAY: Bottom-aligned footer tray with single-click reset */}
      <AdminToolsTray
        hasProfile={!!profile}
        hasTrip={!!activeTrip}
        onDataReset={handleDataReset}
        onPresetLoaded={handlePresetLoaded}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Download Travel Files Modal */}
      <DownloadFilesModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        profile={profile}
        trip={activeTrip}
        onShowToast={handleShowToast}
      />
    </div>
  );
}
