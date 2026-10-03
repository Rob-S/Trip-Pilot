import { FamilyProfile, TripPlan, ItineraryDay, SuggestionItem } from '../types/travel';
import { MOCK_NOTICE } from './storage';

/**
 * Generates an interactive AI Itinerary that explicitly honors dietary restrictions and pace.
 */
export function generateAIItinerary(trip: TripPlan, profile: FamilyProfile | null): {
  days: ItineraryDay[];
  appliedConstraints: {
    paceExplanation: string;
    dietaryFilters: string[];
    familyConsiderations: string[];
  };
  disclaimer: string;
} {
  const allDietary = Array.from(
    new Set(profile?.members.flatMap((m) => m.dietary) || ['Nut Allergy', 'Vegetarian'])
  );
  const primaryPace = profile?.members[0]?.pace || 'Slow/Relaxed';
  const customNotes = Array.from(
    new Set(profile?.members.flatMap((m) => m.customPreferences) || [])
  );

  const hasKids = profile?.members.some((m) => m.role === 'Child') || false;

  const paceExplanation = 
    primaryPace === 'Slow/Relaxed'
      ? 'Slow/Relaxed pace applied: +45-minute family buffer scheduled between major activities, late 9:45 AM morning start, single primary attraction per half-day to prevent fatigue.'
      : primaryPace === 'Fast/Packed'
      ? 'Fast/Packed pace applied: Efficient transit routing, back-to-back timed entries, express passes prioritized.'
      : 'Moderate pace applied: Balanced 20-minute buffers, 9:00 AM start time, alternating active exploration with relaxed tea breaks.';

  const destination = trip.destination || 'Kyoto, Japan';

  const days: ItineraryDay[] = [
    {
      dayNumber: 1,
      dateStr: trip.startDate || 'Day 1',
      theme: 'Historic Arrival & Peaceful Garden Exploration',
      activities: [
        {
          time: primaryPace === 'Slow/Relaxed' ? '09:45 AM' : '08:30 AM',
          title: 'Morning Arrival & Gentle Stroll through Nanzen-ji Temple Grounds',
          category: 'Sightseeing',
          location: 'Sakyo Ward, ' + destination,
          estimatedDuration: primaryPace === 'Slow/Relaxed' ? '2.5 hrs (includes rest benches)' : '1.5 hrs',
          description: 'Spacious flat stone paths, accessible aqueduct views, and quiet moss gardens allowing family members to decompress.',
          paceNote: `Pace buffer: ${primaryPace === 'Slow/Relaxed' ? '45 min' : '15 min'} scheduled for stroller maneuvering and photo stops.`,
          dietaryNote: allDietary.length > 0 ? `Nearby morning refreshment stand vetted for ${allDietary.join(', ')}.` : undefined,
        },
        {
          time: '12:30 PM',
          title: 'Curated Lunch at Tosuiro (Tofu & Traditional Kaiseki)',
          category: 'Dining',
          location: 'Kiyamachi Corridor',
          estimatedDuration: '1.5 hrs',
          description: 'Private tatami room reserved. Dedicated allergen protocol confirmed for the whole party.',
          paceNote: 'Unrushed dining slot with shoes-off relaxing space.',
          dietaryNote: `Strict allergen protocol active: Chef prepares isolated cookware verified free of ${allDietary.join(' & ')}.`,
        },
        {
          time: primaryPace === 'Slow/Relaxed' ? '02:30 PM' : '02:00 PM',
          title: hasKids ? 'Kyoto Railway Museum & Interactive Train Pavilion' : 'Heian Shrine Garden & Tea Pavilion',
          category: hasKids ? 'Culture' : 'Sightseeing',
          location: 'Shimogyo Ward',
          estimatedDuration: '2.0 hrs',
          description: hasKids
            ? 'Fully climate-controlled, wide step-free aisles, interactive driving simulators for children, and abundant seating.'
            : 'Stunning weeping cherry trees, serene pond reflections, and quiet covered wooden bridges.',
          paceNote: 'Flexible self-paced walkthrough with designated quiet rest corners.',
        },
        {
          time: '06:00 PM',
          title: 'Safe Family Dinner at Biotei Organic Kitchen',
          category: 'Dining',
          location: 'Sanjo-dori',
          estimatedDuration: '1.5 hrs',
          description: 'Specializes in clear dietary labeling, organic local vegetable broths, and allergen-segregated prep tables.',
          paceNote: 'Early dinner reservation to ensure comfortable bedtime routine.',
          dietaryNote: `Confirmed: 100% compliant with ${allDietary.join(', ')}. English & Japanese ingredient cards supplied.`,
        },
      ],
    },
    {
      dayNumber: 2,
      dateStr: trip.endDate ? 'Day 2' : 'Day 2',
      theme: 'Bridges, Bamboo Groves & Afternoon Heritage Rest',
      activities: [
        {
          time: primaryPace === 'Slow/Relaxed' ? '10:00 AM' : '08:45 AM',
          title: 'Arashiyama Bamboo Grove & Tenryu-ji Zen Sanctuary',
          category: 'Sightseeing',
          location: 'Ukyo Ward',
          estimatedDuration: '2.5 hrs',
          description: 'Iconic towering bamboo canopies with flat accessible walking routes and gentle river breezes.',
          paceNote: 'Calculated with extra buffer for slow walking and family photo moments.',
        },
        {
          time: '01:00 PM',
          title: 'Gluten-Free & Allergy-Conscious Lunch at Shigetsu',
          category: 'Dining',
          location: 'Tenryu-ji Temple Grounds',
          estimatedDuration: '1.5 hrs',
          description: 'Traditional temple Shojin Ryori cuisine cooked without animal products or nuts.',
          paceNote: 'Serene dining hall looking out into the pine forest.',
          dietaryNote: `Specially customized for ${allDietary.join(', ')}.`,
        },
        {
          time: '03:15 PM',
          title: 'Okochi Sanso Villa & Shaded Hilltop Tea Break',
          category: 'Leisure',
          location: 'Arashiyama Ridge',
          estimatedDuration: '1.5 hrs',
          description: 'Quiet historic villa away from tour crowds. Includes complimentary green tea and allergen-safe rice crackers in open pavilion.',
          paceNote: 'Built-in 45-minute family decompression break before evening.',
        },
      ],
    },
  ];

  return {
    days,
    appliedConstraints: {
      paceExplanation,
      dietaryFilters: allDietary,
      familyConsiderations: customNotes,
    },
    disclaimer: MOCK_NOTICE,
  };
}

/**
 * Dynamic AI Suggestions Engine reacting to real-time prompt or sentiment context.
 */
export function getTailoredSuggestions(
  currentContext: string,
  profile: FamilyProfile | null,
  activeFeedback?: string
): SuggestionItem[] {
  const dietary = profile?.members.flatMap((m) => m.dietary) || [];
  const pace = profile?.members[0]?.pace || 'Slow/Relaxed';
  const hasKids = profile?.members.some((m) => m.role === 'Child');

  const contextLower = currentContext.toLowerCase();

  // Baseline contextual recommendations
  let items: SuggestionItem[] = [
    {
      id: 'sug-1',
      category: 'Dining',
      title: 'Kiyomizu Organic Tea & Allergen-Safe Soba House',
      description: 'Zero cross-contamination kitchen offering 100% buckwheat soba with clear nut-free certificates.',
      location: '120m away · 4 min walk',
      matchReason: dietary.length > 0 
        ? `Matched your profile's [${dietary.join(', ')}] dietary filters.` 
        : 'Top rated quiet dining spot nearby.',
      tags: ['Allergen-Safe', 'Quiet Ambience', 'Step-Free'],
      crowdLevel: 'Low',
      estimatedTime: '45 mins',
    },
    {
      id: 'sug-2',
      category: 'Break',
      title: 'Shoryu Shaded Zen Garden & Sensory Rest Alcove',
      description: 'Quiet sanctuary with cushioned benches, clean family restrooms, and free cold water refill station.',
      location: '250m away · 6 min walk',
      matchReason: pace === 'Slow/Relaxed'
        ? 'Selected to satisfy your family Slow/Relaxed pacing schedule.'
        : 'Ideal midday hydration and recharge spot.',
      tags: ['Rest Stop', 'Family Restrooms', 'Shaded'],
      crowdLevel: 'Low',
      estimatedTime: '25 mins',
    },
    {
      id: 'sug-3',
      category: 'Activity',
      title: hasKids ? 'Traditional Handcrafted Fan Painting Workshop' : 'Private Raku Pottery Studio & Tea Ceremony',
      description: hasKids
        ? 'Engaging 40-minute craft for children and adults; gentle, seated, and indoors away from direct heat.'
        : 'Intimate hands-on tactile craft with master artisan. Seated experience.',
      location: '400m away · 8 min walk',
      matchReason: hasKids 
        ? 'Kid-friendly pace match based on family members in your profile.'
        : 'High-character cultural interest match.',
      tags: ['Indoor', 'Hands-On', 'Reservation-Free'],
      crowdLevel: 'Moderate',
      estimatedTime: '50 mins',
    },
    {
      id: 'sug-4',
      category: 'Logistics',
      title: 'Stroller & Wheelchair-Accessible Transit Exit (Gate 3 North)',
      description: 'Avoids the crowded 48-step main staircase; dedicated high-speed elevator to street taxi stand.',
      location: 'Karasuma Station · 180m',
      matchReason: 'Optimized for family mobility and relaxed transit transfers.',
      tags: ['Accessibility', 'Elevator', 'Air-Conditioned'],
      crowdLevel: 'Low',
      estimatedTime: '5 mins',
    },
  ];

  // If user typed context (e.g. coffee, dinner, tired, rain, museum, kid)
  if (contextLower.includes('dinner') || contextLower.includes('food') || contextLower.includes('eat') || contextLower.includes('hungry')) {
    items.unshift({
      id: 'sug-food-custom',
      category: 'Dining',
      title: 'Sanjo Hearth & Gluten-Free / Halal Vetted Robata',
      description: 'Tableside grilled heirloom vegetables and skewers with completely separate fryer and prep line.',
      location: '300m away',
      matchReason: `Customized for your search query & verified safe for: ${dietary.join(', ') || 'all diets'}.`,
      tags: ['Dinner', 'Allergen Protocol', 'English Menu'],
      crowdLevel: 'Moderate',
      estimatedTime: '1 hr 15 min',
    });
  } else if (contextLower.includes('tired') || contextLower.includes('rest') || contextLower.includes('break') || contextLower.includes('sleepy')) {
    items.unshift({
      id: 'sug-rest-custom',
      category: 'Break',
      title: 'Gion Serenity Footbath Cafe & Botanical Lounge',
      description: 'Warm cedar footbaths with organic herbal teas. Soft ambient acoustics and recliners.',
      location: '190m away',
      matchReason: 'Instant energy recovery prioritized for Slow/Relaxed family rhythm.',
      tags: ['Footbath', 'Quiet Zone', 'Kid-Friendly'],
      crowdLevel: 'Low',
      estimatedTime: '40 mins',
    });
  } else if (contextLower.includes('rain') || contextLower.includes('indoor') || contextLower.includes('cold') || contextLower.includes('weather')) {
    items.unshift({
      id: 'sug-rain-custom',
      category: 'Activity',
      title: 'Teramachi Covered Glass-Arcade & Artisan Market',
      description: 'Over 1.2km of fully covered walkways with independent craft shops, tea boutiques, and zero puddles.',
      location: '150m away',
      matchReason: 'Weather-resilient dry routing protecting your scheduled outing.',
      tags: ['100% Covered', 'Dry Walkways', 'Rain-Safe'],
      crowdLevel: 'Moderate',
      estimatedTime: '1.5 hrs',
    });
  }

  if (activeFeedback === 'loved') {
    items.unshift({
      id: 'sug-feedback-loved',
      category: 'Activity',
      title: 'Recommended Extension: Twilight Lantern Canal Promenade',
      description: 'Since you loved your recent stop, this nearby lantern-lit canal offers similar tranquil aesthetics with low foot traffic.',
      location: '220m away',
      matchReason: 'Adapted in real-time based on your "👍 Loved it!" rating.',
      tags: ['Personalized Continuation', 'Scenic', 'Relaxed'],
      crowdLevel: 'Low',
    });
  }

  return items;
}

/**
 * Time Management Calculator taking profile pace into account
 */
export function calculateAlarmSchedule(params: {
  origin: string;
  destination: string;
  targetArrivalTime: string; // e.g. "14:30"
  transitMode: 'walking' | 'subway' | 'taxi' | 'stroller_transit';
  pace: string;
  hasKids: boolean;
}): {
  departureTime: string;
  wakeUpAlarm: string;
  prepAlarm: string;
  transitMinutes: number;
  familyBufferMinutes: number;
  breakdown: { label: string; minutes: number; note: string }[];
  summaryNote: string;
  disclaimer: string;
} {
  // Parse target arrival time
  const [targetH, targetM] = params.targetArrivalTime.split(':').map(Number);
  const targetDate = new Date();
  targetDate.setHours(targetH, targetM, 0, 0);

  // Baseline transit times
  let baseTransit = 25;
  if (params.transitMode === 'walking') baseTransit = 35;
  if (params.transitMode === 'subway') baseTransit = 22;
  if (params.transitMode === 'taxi') baseTransit = 15;
  if (params.transitMode === 'stroller_transit') baseTransit = 30;

  // Pace buffer calculations
  let familyBuffer = 15;
  if (params.pace === 'Slow/Relaxed') familyBuffer += 20;
  if (params.hasKids) familyBuffer += 15;

  const morningPrepMinutes = params.pace === 'Slow/Relaxed' ? 65 : 45;

  const totalTransitBufferMinutes = baseTransit + familyBuffer;

  const departureDate = new Date(targetDate.getTime() - totalTransitBufferMinutes * 60000);
  const prepDate = new Date(departureDate.getTime() - 20 * 60000); // 20 min shoes & bag check
  const wakeUpDate = new Date(departureDate.getTime() - morningPrepMinutes * 60000);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return {
    departureTime: formatTime(departureDate),
    wakeUpAlarm: formatTime(wakeUpDate),
    prepAlarm: formatTime(prepDate),
    transitMinutes: baseTransit,
    familyBufferMinutes: familyBuffer,
    breakdown: [
      {
        label: 'Base Transit Time',
        minutes: baseTransit,
        note: `Simulated direct transit via ${params.transitMode.replace('_', ' ')}.`,
      },
      {
        label: 'Family Pacing Buffer',
        minutes: familyBuffer,
        note: `Tailored for ${params.pace} pace + ${params.hasKids ? 'children mobility allowances' : 'standard margin'}.`,
      },
      {
        label: 'Morning Routine & Breakfast',
        minutes: morningPrepMinutes,
        note: 'Includes allergen check, sunscreen, water packing, and relaxed staging.',
      },
    ],
    summaryNote: `Recommended departure is ${formatTime(departureDate)} to comfortably arrive at ${params.targetArrivalTime} without rushing.`,
    disclaimer: MOCK_NOTICE,
  };
}

/**
 * Weather Resiliency Engine
 */
export function getWeatherAlternatives(
  scenario: 'Heavy Rain' | 'Severe Heat Wave' | 'Sudden Thunderstorm' | 'High UV Alert',
  profile: FamilyProfile | null
): {
  scenarioTitle: string;
  impactAlert: string;
  indoorAlternatives: {
    title: string;
    description: string;
    location: string;
    whySafe: string;
    transitAdvice: string;
  }[];
  contingencyKit: string[];
  disclaimer: string;
} {
  const dietary = profile?.members.flatMap((m) => m.dietary) || [];
  const hasKids = profile?.members.some((m) => m.role === 'Child');

  if (scenario === 'Heavy Rain') {
    return {
      scenarioTitle: 'Heavy Rain Simulation Protocol',
      impactAlert: 'High precipitation forecast (18mm/hr). Outdoor temples and moss garden stone steps become slippery.',
      indoorAlternatives: [
        {
          title: 'Kyoto International Manga Museum & Heritage Reading Hall',
          description: 'Historic elementary school converted into 300,000+ volumes, featuring multilingual cozy reading corners.',
          location: 'Karasuma-Oike (Direct indoor underground subway connection)',
          whySafe: '100% enclosed, temperature-regulated, carpeted reading spaces.',
          transitAdvice: 'Take Karasuma Line Exit 2 — zero outdoor exposure required.',
        },
        {
          title: 'Nishiki Covered Market & Artisan Culinary Hall',
          description: 'Five-block glass-canopy arcade with traditional crafts, tea demonstrations, and sheltered tasting counters.',
          location: 'Central Shijo Arcade',
          whySafe: 'Completely weather-tight overhead arch canopy spanning 400 meters.',
          transitAdvice: dietary.length > 0 ? `Selected stalls clearly marked for ${dietary.join(', ')}.` : 'Direct taxi drop-off at West Canopy Entrance.',
        },
        {
          title: hasKids ? 'Kyoto Aquarium & Penguin Sanctuary' : 'The Museum of Kyoto (Craft & Textile Galleries)',
          description: 'Spacious indoor exhibits with hands-on discovery touch-tanks and family changing suites.',
          location: 'Umekoji Park Quarter',
          whySafe: 'Dry indoor concourses and gentle ramp navigation throughout.',
          transitAdvice: 'Subway to Umekoji-Kyotonishi Station, underpass sheltered walkway.',
        },
      ],
      contingencyKit: [
        'Automatic compact umbrellas and waterproof shoe covers',
        'Ziplock bags for phones and passport documents',
        'Pack dry spare socks for younger family members',
      ],
      disclaimer: MOCK_NOTICE,
    };
  }

  if (scenario === 'Severe Heat Wave') {
    return {
      scenarioTitle: 'Severe Heat Wave Contingency',
      impactAlert: 'Simulated ambient temperature: 38°C (100°F) with 78% humidity. Direct sun exposure hazardous between 11 AM - 3 PM.',
      indoorAlternatives: [
        {
          title: 'Kyoto National Museum Climate-Controlled Masterpiece Wing',
          description: 'State-of-the-art Japanese art galleries maintained at a crisp 22°C (71°F) with low ambient lighting.',
          location: 'Higashiyama Ward',
          whySafe: 'Immediate heat relief, filtered cool air, water refilling stations every 50 meters.',
          transitAdvice: 'Recommend air-conditioned taxi direct to shaded portico.',
        },
        {
          title: 'Subterranean Porta Shopping & Culinary Avenue',
          description: 'Extensive climate-controlled underground avenue with dozens of vetted rest spots and tea cafes.',
          location: 'Kyoto Station Concourse B1F',
          whySafe: 'Full heat shielding with subterranean microclimate and clean family lounges.',
          transitAdvice: 'Direct descent from hotel or train lobby without stepping into direct sun.',
        },
      ],
      contingencyKit: [
        'Electrolyte drink packets (Pocari Sweat / OS-1 equivalents)',
        'UV-blocking parasol with UPF 50+ rating',
        'Cooling neck wraps and misting fans',
      ],
      disclaimer: MOCK_NOTICE,
    };
  }

  // Thunderstorm or UV default
  return {
    scenarioTitle: `${scenario} Simulation Protocol`,
    impactAlert: 'Rapid weather flux detected. Outdoor activity risks elevated.',
    indoorAlternatives: [
      {
        title: 'Heian Jingu Cultural Hall & Sheltered Tea Gallery',
        description: 'Spacious covered veranda overlooking pond gardens while shielded from electrical storms.',
        location: 'Okazaki Park',
        whySafe: 'Covered seating with 360-degree storm viewing without exposure.',
        transitAdvice: 'Direct sheltered bus connection or rideshare drop-off.',
      },
    ],
    contingencyKit: ['Emergency contact sheet', 'Power bank (10,000mAh) for mobile devices'],
    disclaimer: MOCK_NOTICE,
  };
}

/**
 * Emergency Crisis Assistant
 */
export function getEmergencyTriage(issueType: 'child_fever' | 'lost_medication' | 'allergic_reaction' | 'lost_passport'): {
  issueTitle: string;
  urgencyLevel: 'Immediate Attention' | 'Urgent Care' | 'Standard Administrative';
  triageSteps: { step: number; action: string; details: string }[];
  localContacts: { name: string; number: string; notes: string }[];
  bilingualCard: { english: string; localized: string; phonetic: string };
  nearestFacilities: { name: string; type: string; distance: string; address: string; openNow: boolean }[];
  disclaimer: string;
} {
  if (issueType === 'child_fever') {
    return {
      issueTitle: "Pediatric Sudden Fever & Triage Support",
      urgencyLevel: 'Urgent Care',
      triageSteps: [
        {
          step: 1,
          action: 'Calm Assessment & Temperature Log',
          details: 'Check child for alert responsiveness, breathing comfort, and skin hydration. Record temperature in °C and °F.',
        },
        {
          step: 2,
          action: 'Immediate Physical Comfort & Hydration',
          details: 'Dress in breathable loose cotton clothing. Offer small, frequent sips of water or electrolyte solution. Place lukewarm damp cloth on forehead.',
        },
        {
          step: 3,
          action: 'Locate 24/7 International Pediatric Clinic',
          details: 'Present the bilingual phrase card below to hotel concierge or taxi driver for immediate direct transit.',
        },
        {
          step: 4,
          action: 'Contact Travel Insurance Medical Hotline',
          details: 'Notify your overseas travel insurance policy provider to open a case file and obtain guarantee of direct hospital billing.',
        },
      ],
      localContacts: [
        { name: 'Emergency Ambulance & Medical', number: '119 (Japan) / 911 (US) / 112 (EU)', notes: 'Direct medical dispatch. Free call.' },
        { name: 'Japan Helpline (24/7 Multilingual Emergency)', number: '0570-000-911', notes: 'English, Chinese, Spanish emergency interpretation.' },
        { name: 'Kyoto Health & Medical Consultation Center', number: '+81-75-681-5580', notes: 'English triage nurse on call.' },
      ],
      bilingualCard: {
        english: 'My child has a sudden high fever (39°C). Please take us to the nearest pediatric emergency hospital with English-speaking staff.',
        localized: '子供が急な高熱（39度）を出しています。英語対応が可能な最寄りの小児救急病院へ連れて行ってください。',
        phonetic: 'Kodomo ga kyu-na konetsu o dashite imasu. Eigo taio ga kanona shoni kyukyu byoin e tsurete itte kudasai.',
      },
      nearestFacilities: [
        {
          name: 'Kyoto University Hospital Pediatric Emergency Wing',
          type: 'Tertiary Medical Center (24/7)',
          distance: '1.8 km · 7 min taxi',
          address: '54 Kawahara-cho, Shogoin, Sakyo-ku',
          openNow: true,
        },
        {
          name: 'Matsubara International Pharmacy & Medical Dispensary',
          type: '24-Hour Dispensary',
          distance: '450 m · 6 min walk',
          address: 'Kawaramachi-dori, Shimogyo-ku',
          openNow: true,
        },
      ],
      disclaimer: MOCK_NOTICE,
    };
  }

  if (issueType === 'lost_medication') {
    return {
      issueTitle: 'Lost or Damaged Prescription Medication',
      urgencyLevel: 'Urgent Care',
      triageSteps: [
        {
          step: 1,
          action: 'Gather Prescription Details & Generic Names',
          details: 'Locate photo of original prescription bottle showing generic chemical compound name (brand names often differ overseas).',
        },
        {
          step: 2,
          action: 'Visit International Clinic for Local Prescription Script',
          details: 'Foreign prescriptions cannot be dispensed directly by local pharmacies; an in-person local doctor consultation is legally required to issue a domestic prescription.',
        },
        {
          step: 3,
          action: 'Obtain Itemized Receipt for Insurance Reimbursement',
          details: 'Request an English-language itemized medical certificate (shindansho) and pharmacy receipt.',
        },
      ],
      localContacts: [
        { name: 'Medical Information Hotline', number: '050-3816-2787', notes: 'Guidance to clinics stocking specific medications.' },
        { name: 'US Embassy Citizen Services', number: '+81-3-3224-5000', notes: 'Emergency assistance with physician referral.' },
      ],
      bilingualCard: {
        english: 'I have lost my essential daily prescription medication. I need to see a doctor for a replacement prescription.',
        localized: '常備薬（処方薬）を紛失してしまいました。代替の処方箋を発行してもらうため医師の診察を受けたいです。',
        phonetic: 'Jobiyaku o funshitsu shite shimaimashita. Daitai no shohosen o hakko shite morau tame ishi no shinsatsu o uketai desu.',
      },
      nearestFacilities: [
        {
          name: 'Kyoto Station International Clinic',
          type: 'Outpatient & Travel Medicine',
          distance: '850 m · 10 min walk',
          address: 'Kyoto Station Central Gate Bldg 4F',
          openNow: true,
        },
      ],
      disclaimer: MOCK_NOTICE,
    };
  }

  // Allergic Reaction Precaution
  return {
    issueTitle: 'Severe Allergic Reaction Precaution & Epinephrine Access',
    urgencyLevel: 'Immediate Attention',
    triageSteps: [
      {
        step: 1,
        action: 'Assess Airway & Breathing Immediately',
        details: 'If swelling of lips, throat tightness, or wheezing occurs, administer autoinjector (EpiPen) immediately into outer mid-thigh.',
      },
      {
        step: 2,
        action: 'Call Emergency Medical Services (119)',
        details: 'State: "Anaphylaxis. Emergency ambulance required." Present current GPS location.',
      },
      {
        step: 3,
        action: 'Position Flat with Legs Elevated',
        details: 'Do not allow the patient to stand or walk abruptly, even if feeling better.',
      },
    ],
    localContacts: [
      { name: 'Ambulance Emergency Dispatch', number: '119', notes: 'Immediate emergency rescue.' },
      { name: 'Tokyo/Kyoto Emergency Interpretation', number: '03-5285-8181', notes: 'Live phone translation for EMTs.' },
    ],
    bilingualCard: {
      english: 'Emergency! Anaphylactic allergic reaction. Please dispatch an ambulance immediately with epinephrine.',
      localized: '緊急事態です！アナフィラキシーのアレルギー発作です。至急、救急車の手配をお願いします。',
      phonetic: 'Kinkyu jitai desu! Anafirakishi no arerugi hotta desu. Shikyu, kyukyusha no tehai o onegaishimasu.',
    },
    nearestFacilities: [
      {
        name: 'Kyoto Municipal Emergency Medical Center',
        type: 'Level 1 Trauma & Emergency Wing (24/7)',
        distance: '1.2 km · 5 min ambulance',
        address: '1-2 Minamitsuda-cho, Nakagyo-ku',
        openNow: true,
      },
    ],
    disclaimer: MOCK_NOTICE,
  };
}
