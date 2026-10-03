import { FamilyProfile, TripPlan } from '../types/travel';

const PROFILE_KEY = 'aegis_traveler_profile';
const TRIP_KEY = 'aegis_active_trip';
const THEME_KEY = 'aegis_theme_mode';

export const MOCK_NOTICE = '[MOCK DEMO DATA: Not medical/legal advice]';

export const PRESET_DEMO_PROFILE: FamilyProfile = {
  id: 'preset-demo-miller-family',
  familyName: 'The Miller Family',
  updatedAt: new Date().toISOString(),
  members: [
    {
      id: 'member-1',
      name: 'Robert Miller',
      role: 'Self',
      dietary: ['Nut Allergy', 'Vegetarian'],
      pace: 'Slow/Relaxed',
      interests: ['History/Culture', 'Foodie', 'Kid-Friendly'],
      customPreferences: ['Prefers morning walks before 10 AM', 'Requires step-free walking routes'],
    },
    {
      id: 'member-2',
      name: 'Sarah Miller',
      role: 'Spouse',
      dietary: ['Gluten-Free'],
      pace: 'Slow/Relaxed',
      interests: ['Outdoor Adventure', 'History/Culture'],
      customPreferences: ['Mild heat intolerance — needs shaded transit'],
    },
    {
      id: 'member-3',
      name: 'Leo Miller (Age 6)',
      role: 'Child',
      dietary: ['Nut Allergy'],
      pace: 'Slow/Relaxed',
      interests: ['Kid-Friendly', 'Outdoor Adventure'],
      customPreferences: ['Afternoon quiet hour needed between 2 PM - 3:30 PM'],
    },
  ],
};

export const PRESET_DEMO_TRIP: TripPlan = {
  id: 'trip-kyoto-japan',
  destination: 'Kyoto & Nara, Japan',
  startDate: '2026-10-15',
  endDate: '2026-10-20',
  budgetLevel: 'Moderate',
};

export function getStoredProfile(): FamilyProfile | null {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return null;
    return JSON.parse(data) as FamilyProfile;
  } catch (err) {
    console.error('Failed to parse stored profile:', err);
    return null;
  }
}

export function saveStoredProfile(profile: FamilyProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function getStoredTrip(): TripPlan | null {
  try {
    const data = localStorage.getItem(TRIP_KEY);
    if (!data) return null;
    return JSON.parse(data) as TripPlan;
  } catch (err) {
    console.error('Failed to parse trip:', err);
    return null;
  }
}

export function saveStoredTrip(trip: TripPlan): void {
  try {
    localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
  } catch (err) {
    console.error('Failed to save trip:', err);
  }
}

export function clearAllDemoData(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TRIP_KEY);
    localStorage.removeItem(THEME_KEY);
    localStorage.clear();
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}

export function loadDemoPreset(): void {
  saveStoredProfile(PRESET_DEMO_PROFILE);
  saveStoredTrip(PRESET_DEMO_TRIP);
}

export function getSavedTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function saveSavedTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
