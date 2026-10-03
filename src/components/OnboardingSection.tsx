import React, { useState } from 'react';
import { 
  User, Plus, Trash2, Check, Sparkles, HeartHandshake, ArrowRight, 
  ShieldAlert, Clock, Compass, Edit3, Save, Info
} from 'lucide-react';
import { 
  FamilyMember, FamilyProfile, MemberRole, TravelPace, DietaryRestriction, InterestOption 
} from '../types/travel';
import { saveStoredProfile } from '../utils/storage';

interface OnboardingSectionProps {
  currentProfile: FamilyProfile | null;
  onProfileUpdated: (profile: FamilyProfile) => void;
  onComplete: () => void;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
}

const DIET_OPTIONS: DietaryRestriction[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut Allergy',
  'Halal',
  'Kosher',
];

const PACE_OPTIONS: { id: TravelPace; label: string; desc: string }[] = [
  { id: 'Slow/Relaxed', label: 'Slow/Relaxed', desc: 'Frequent rest stops, late mornings, +45m buffers' },
  { id: 'Moderate', label: 'Moderate', desc: 'Balanced sight-seeing, standard 20m transition buffers' },
  { id: 'Fast/Packed', label: 'Fast/Packed', desc: 'Maximized itineraries, early starts, rapid transit' },
];

const INTEREST_OPTIONS: InterestOption[] = [
  'History/Culture',
  'Outdoor Adventure',
  'Foodie',
  'Budget-Friendly',
  'Luxury',
  'Kid-Friendly',
];

const ROLE_OPTIONS: MemberRole[] = ['Self', 'Spouse', 'Child', 'Parent', 'Friend', 'Other'];

export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  currentProfile,
  onProfileUpdated,
  onComplete,
  onShowToast,
}) => {
  const [step, setStep] = useState<number>(currentProfile ? 3 : 1);
  const [familyName, setFamilyName] = useState<string>(
    currentProfile?.familyName || 'The Traveler Family'
  );
  
  // List of members
  const [members, setMembers] = useState<FamilyMember[]>(
    currentProfile?.members || [
      {
        id: 'member-self',
        name: 'Alex Morgan',
        role: 'Self',
        dietary: ['Vegetarian'],
        pace: 'Slow/Relaxed',
        interests: ['History/Culture', 'Foodie'],
        customPreferences: ['Prefers step-free walking paths'],
      },
    ]
  );

  // Active member being edited in wizard or edit modal
  const [activeMemberIndex, setActiveMemberIndex] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');

  const currentMember = members[activeMemberIndex] || members[0];

  const updateCurrentMember = (updater: (prev: FamilyMember) => FamilyMember) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[activeMemberIndex] = updater(copy[activeMemberIndex]);
      return copy;
    });
  };

  const handleToggleDiet = (diet: DietaryRestriction) => {
    updateCurrentMember((m) => {
      const exists = m.dietary.includes(diet);
      return {
        ...m,
        dietary: exists ? m.dietary.filter((d) => d !== diet) : [...m.dietary, diet],
      };
    });
  };

  const handleToggleInterest = (interest: InterestOption) => {
    updateCurrentMember((m) => {
      const exists = m.interests.includes(interest);
      return {
        ...m,
        interests: exists ? m.interests.filter((i) => i !== interest) : [...m.interests, interest],
      };
    });
  };

  const handleAddCustomPreference = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    updateCurrentMember((m) => {
      if (m.customPreferences.includes(trimmed)) return m;
      return {
        ...m,
        customPreferences: [...m.customPreferences, trimmed],
      };
    });
    setCustomInput('');
  };

  const handleRemoveCustomPreference = (item: string) => {
    updateCurrentMember((m) => ({
      ...m,
      customPreferences: m.customPreferences.filter((p) => p !== item),
    }));
  };

  const handleAddNewMember = () => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: `Family Member ${members.length + 1}`,
      role: 'Child',
      dietary: [],
      pace: members[0]?.pace || 'Slow/Relaxed',
      interests: ['Kid-Friendly'],
      customPreferences: [],
    };
    setMembers((prev) => [...prev, newMember]);
    setActiveMemberIndex(members.length);
    onShowToast('info', 'Companion Added', 'Configure preferences for your new family member.');
  };

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) {
      onShowToast('warning', 'Minimum 1 Traveler', 'Your profile must have at least one primary traveler.');
      return;
    }
    const filtered = members.filter((_, i) => i !== index);
    setMembers(filtered);
    setActiveMemberIndex(Math.max(0, index - 1));
    onShowToast('info', 'Member Removed', 'Family member removed from the active profile.');
  };

  const handleSaveFullProfile = () => {
    const newProfile: FamilyProfile = {
      id: currentProfile?.id || `profile-${Date.now()}`,
      familyName: familyName.trim() || 'My Family Profile',
      members,
      updatedAt: new Date().toISOString(),
    };

    saveStoredProfile(newProfile);
    onProfileUpdated(newProfile);
    onShowToast('success', 'Profile Saved', `Family profile for ${newProfile.familyName} updated with ${members.length} members.`);
    setStep(3);
  };

  // Aggregated dietary and custom tags for summary
  const aggregatedDietary = Array.from(new Set(members.flatMap((m) => m.dietary)));
  const aggregatedCustom = Array.from(new Set(members.flatMap((m) => m.customPreferences)));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Traveler Onboarding Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Traveler Profile & Family Accommodations
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Configure personal dietary restrictions, mobility needs, and daily pacing. Trip Pilot dynamically adjusts transit buffers, restaurant recommendations, and crisis protocols to match everyone in your party.
            </p>
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                step === 1
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              1. Family Name & Group
            </button>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                step === 2
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2. Accommodations
            </button>
            <button
              onClick={() => setStep(3)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                step === 3
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3. Profile Summary
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Family Name & Member Roster */}
      {step === 1 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Group or Family Profile Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. The Miller Family or European Voyage Party"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Travelers in Party ({members.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add everyone joining this journey so allergies and pacing are collectively honored.
                </p>
              </div>

              <button
                onClick={handleAddNewMember}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-xl hover:bg-sky-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Companion</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  onClick={() => setActiveMemberIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeMemberIndex === idx
                      ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-md ring-1 ring-sky-400/50'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        {member.name.charAt(0) || 'T'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {member.name}
                        </h4>
                        <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    {members.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(idx);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Pace: {member.pace}
                    </span>
                    {member.dietary.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {member.dietary.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Next: Set Accommodations & Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Accommodations & Preferences for Selected Member */}
      {step === 2 && currentMember && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-8">
          {/* Member Switcher Strip */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Configuring Member:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {members.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMemberIndex(idx)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeMemberIndex === idx
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {m.name} ({m.role})
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddNewMember}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another</span>
            </button>
          </div>

          {/* Member Name & Role Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Member Full Name
              </label>
              <input
                type="text"
                value={currentMember.name}
                onChange={(e) =>
                  updateCurrentMember((m) => ({ ...m, name: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Family Role
              </label>
              <select
                value={currentMember.role}
                onChange={(e) =>
                  updateCurrentMember((m) => ({
                    ...m,
                    role: e.target.value as MemberRole,
                  }))
                }
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION A: Dietary Restrictions Quick Toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Dietary Restrictions & Allergies
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select all that apply for {currentMember.name}. The AI itinerary and dining radar will automatically exclude risky kitchens and highlight allergy-certified alternatives.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {DIET_OPTIONS.map((diet) => {
                const isSelected = currentMember.dietary.includes(diet);
                return (
                  <button
                    key={diet}
                    onClick={() => handleToggleDiet(diet)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-semibold shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    <span>{diet}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION B: Pacing Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Travel Pacing & Energy Rhythm
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Determines alarm calculations, transfer buffers, and recommended daily stop counts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PACE_OPTIONS.map((pace) => {
                const isSelected = currentMember.pace === pace.id;
                return (
                  <button
                    key={pace.id}
                    onClick={() =>
                      updateCurrentMember((m) => ({ ...m, pace: pace.id }))
                    }
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-slate-900 dark:text-white ring-1 ring-sky-500/30'
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{pace.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {pace.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION C: Interests Quick Select */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Core Travel Interests
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = currentMember.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION D: Dynamic "Add Custom Preference" (Other category) */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Add Custom Preference or Medical / Mobility Needs
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Input less common restrictions (e.g. &ldquo;Requires wheelchair accessibility&rdquo;, &ldquo;Severe motion sickness&rdquo;, or &ldquo;Sensitive to strong incense&rdquo;).
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPreference();
                  }
                }}
                placeholder="e.g. Requires stroller-accessible routes, no steep hills"
                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomPreference}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Add Preference
              </button>
            </div>

            {/* Render added custom preferences */}
            {currentMember.customPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentMember.customPreferences.map((pref) => (
                  <span
                    key={pref}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{pref}</span>
                    <button
                      onClick={() => handleRemoveCustomPreference(pref)}
                      className="text-slate-400 hover:text-rose-500 ml-1"
                      aria-label="Remove preference"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              &larr; Back to Member List
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveFullProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile & Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Summary Card of Saved Family Profile */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Active Verified Profile
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {familyName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{members.length} Traveler{members.length === 1 ? '' : 's'} Registered</span>
                  <span>·</span>
                  <span>Governing Pace: {members[0]?.pace || 'Slow/Relaxed'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <span>Continue to Trip Planning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collective Family Directives */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-xl border">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Collective Dietary Shield</span>
                </div>
                {aggregatedDietary.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {aggregatedDietary.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/20"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No dietary restrictions reported. Standard safety filters active.
                  </p>
                )}
              </div>

              <div className="glass-card p-4 rounded-xl border">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Pacing & Transit Buffers</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {members[0]?.pace === 'Slow/Relaxed'
                    ? '45-minute family decompression buffers enforced between all major itinerary items.'
                    : members[0]?.pace === 'Fast/Packed'
                    ? 'Expedited 10-minute turnaround with express pass and direct rapid transit priority.'
                    : 'Balanced 20-minute transition buffers with midday tea/rest interval.'}
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Special Accommodations</span>
                </div>
                {aggregatedCustom.length > 0 ? (
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {aggregatedCustom.map((c) => (
                      <li key={c} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Standard walking and mobility routing applied.
                  </p>
                )}
              </div>
            </div>

            {/* Individual Traveler Cards */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Registered Travelers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.name}
                          </h4>
                          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                            {m.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        {m.pace}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      {m.dietary.length > 0 && (
                        <div>
                          <span className="text-slate-500">Diet: </span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {m.dietary.join(', ')}
                          </span>
                        </div>
                      )}
                      {m.interests.length > 0 && (
                        <div>
                          <span className="text-slate-500">Interests: </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {m.interests.join(', ')}
                          </span>
                        </div>
                      )}
                      {m.customPreferences.length > 0 && (
                        <div>
                          <span className="text-slate-500">Notes: </span>
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {m.customPreferences.join(' · ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
