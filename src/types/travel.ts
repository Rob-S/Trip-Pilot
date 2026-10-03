export type DietaryRestriction = 
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Nut Allergy'
  | 'Halal'
  | 'Kosher';

export type TravelPace = 
  | 'Slow/Relaxed'
  | 'Moderate'
  | 'Fast/Packed';

export type InterestOption = 
  | 'History/Culture'
  | 'Outdoor Adventure'
  | 'Foodie'
  | 'Budget-Friendly'
  | 'Luxury'
  | 'Kid-Friendly';

export type MemberRole = 
  | 'Self'
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Friend'
  | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  dietary: string[];
  pace: TravelPace;
  interests: string[];
  customPreferences: string[];
}

export interface FamilyProfile {
  id: string;
  familyName: string;
  members: FamilyMember[];
  updatedAt: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetLevel: 'Budget-Friendly' | 'Moderate' | 'Luxury';
  isSkipped?: boolean;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  category: 'Sightseeing' | 'Dining' | 'Culture' | 'Leisure' | 'Rest';
  description: string;
  paceNote: string;
  dietaryNote?: string;
  location: string;
  estimatedDuration: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dateStr: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface SuggestionItem {
  id: string;
  category: 'Dining' | 'Activity' | 'Break' | 'Logistics' | 'Transit';
  title: string;
  description: string;
  location: string;
  matchReason: string;
  tags: string[];
  crowdLevel?: 'Low' | 'Moderate' | 'High';
  estimatedTime?: string;
}

export type AppTab = 'onboarding' | 'planning' | 'management';
