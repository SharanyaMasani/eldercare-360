// Initial Realistic Mock Data for ElderCare 360
// All data is stored in localStorage and fully customizable/resettable.

export const initialPatientProfile = {
  id: 'patient-01',
  name: 'Margaret Sharma',
  preferredName: 'Margaret',
  age: 74,
  gender: 'Female',
  bloodGroup: 'O+',
  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  address: 'Flat 402, Lotus Greens, Sector 45, Gurugram, India',
  emergencyContact: {
    name: 'Rohan Sharma',
    relation: 'Son (Primary Caregiver)',
    phone: '+91 98765 43210',
    email: 'rohan.sharma@eldercare-demo.org',
    whatsapp: '+919876543210'
  },
  secondaryCaregiver: {
    name: 'Sister Mary Joseph',
    relation: 'Visiting Home Nurse',
    phone: '+91 98100 87654',
    schedule: 'Mon / Wed / Fri 10:00 AM - 1:00 PM'
  },
  primaryDoctor: {
    name: 'Dr. Anita Rao, MD',
    specialty: 'Geriatric Medicine & Cardiology',
    clinic: 'Apex Senior Health Clinic, Gurugram',
    phone: '+91 98111 22334',
    nextFollowup: '2026-11-18'
  },
  conditions: [
    'Hypertension (Well managed)',
    'Type 2 Diabetes (Diet & oral meds)',
    'Mild Osteoarthritis (Bilateral knees)'
  ],
  allergies: ['Penicillin', 'Sulfa antibiotics'],
  vitals: {
    bloodPressure: '126/80 mmHg',
    bpStatus: 'Optimal',
    heartRate: '72 bpm',
    bloodGlucose: '116 mg/dL',
    glucoseStatus: 'Fasting Normal',
    oxygenSaturation: '98%',
    temperature: '98.4°F',
    lastRecorded: 'Today, 08:30 AM'
  }
};

export const initialMedications = [
  {
    id: 'med-1',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    tabletsPerDose: 1,
    frequency: 'Twice daily',
    frequencyCount: 2,
    scheduledTimes: ['08:00', '20:00'],
    timeLabels: ['Morning (After breakfast)', 'Night (After dinner)'],
    purpose: 'Blood sugar regulation & insulin sensitivity',
    instructions: 'Take strictly with or right after food with plenty of water',
    startDate: '2026-01-10',
    endDate: '2027-01-10',
    currentStock: 18,
    reorderThreshold: 10,
    expiryDate: '2027-08-30',
    color: '#0D9488', // soft teal
    prescribedBy: 'Dr. Anita Rao'
  },
  {
    id: 'med-2',
    name: 'Amlodipine Besylate',
    dosage: '5 mg',
    tabletsPerDose: 1,
    frequency: 'Once daily',
    frequencyCount: 1,
    scheduledTimes: ['08:00'],
    timeLabels: ['Morning (With breakfast)'],
    purpose: 'Blood pressure stabilization',
    instructions: 'Take every morning at the same hour',
    startDate: '2026-02-01',
    endDate: '2027-02-01',
    currentStock: 4, // 4 days remaining -> approaching low stock
    reorderThreshold: 8,
    expiryDate: '2027-11-15',
    color: '#1E3A8A', // navy blue
    prescribedBy: 'Dr. Anita Rao'
  },
  {
    id: 'med-3',
    name: 'Atorvastatin Calcium',
    dosage: '10 mg',
    tabletsPerDose: 1,
    frequency: 'Once daily',
    frequencyCount: 1,
    scheduledTimes: ['21:00'],
    timeLabels: ['Bedtime (9:00 PM)'],
    purpose: 'Cardiovascular lipid protection',
    instructions: 'Take at bedtime for optimum cholesterol synthesis control',
    startDate: '2026-03-01',
    endDate: '2027-03-01',
    currentStock: 2, // Exactly 2 days remaining -> Critical Restock Alert Trigger!
    reorderThreshold: 7,
    expiryDate: '2027-09-20',
    color: '#7C3AED', // soft purple
    prescribedBy: 'Dr. Anita Rao'
  },
  {
    id: 'med-4',
    name: 'Calcium Citrate + Vitamin D3',
    dosage: '500 mg / 400 IU',
    tabletsPerDose: 1,
    frequency: 'Once daily',
    frequencyCount: 1,
    scheduledTimes: ['13:00'],
    timeLabels: ['Afternoon (After lunch)'],
    purpose: 'Bone mineral density & joint support',
    instructions: 'Take after your afternoon lunch',
    startDate: '2026-01-15',
    endDate: '2027-01-15',
    currentStock: 28,
    reorderThreshold: 10,
    expiryDate: '2027-12-01',
    color: '#059669', // emerald
    prescribedBy: 'Dr. R. K. Singhal (Orthopedics)'
  }
];

// Helper to get formatted date string for today and previous days
const getDayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialDoseLogs = [
  // Today's doses
  {
    id: `log-${getDayString(0)}-med-1-08:00`,
    date: getDayString(0),
    medicationId: 'med-1',
    medicationName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    scheduledTime: '08:00',
    status: 'taken',
    recordedAt: `${getDayString(0)}T08:22:00`,
    tabletsDeducted: 1
  },
  {
    id: `log-${getDayString(0)}-med-2-08:00`,
    date: getDayString(0),
    medicationId: 'med-2',
    medicationName: 'Amlodipine Besylate',
    dosage: '5 mg',
    scheduledTime: '08:00',
    status: 'taken',
    recordedAt: `${getDayString(0)}T08:23:00`,
    tabletsDeducted: 1
  },
  {
    id: `log-${getDayString(0)}-med-4-13:00`,
    date: getDayString(0),
    medicationId: 'med-4',
    medicationName: 'Calcium Citrate + Vitamin D3',
    dosage: '500 mg / 400 IU',
    scheduledTime: '13:00',
    status: 'taken',
    recordedAt: `${getDayString(0)}T13:35:00`,
    tabletsDeducted: 1
  },
  // Past days history for rich adherence tracking
  // Yesterday (Day -1): All 5 taken
  { id: `log-${getDayString(1)}-1`, date: getDayString(1), medicationId: 'med-1', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(1)}-2`, date: getDayString(1), medicationId: 'med-2', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(1)}-3`, date: getDayString(1), medicationId: 'med-4', scheduledTime: '13:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(1)}-4`, date: getDayString(1), medicationId: 'med-1', scheduledTime: '20:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(1)}-5`, date: getDayString(1), medicationId: 'med-3', scheduledTime: '21:00', status: 'taken', tabletsDeducted: 1 },

  // Day -2: 4 taken, 1 skipped (calcium)
  { id: `log-${getDayString(2)}-1`, date: getDayString(2), medicationId: 'med-1', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(2)}-2`, date: getDayString(2), medicationId: 'med-2', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(2)}-3`, date: getDayString(2), medicationId: 'med-4', scheduledTime: '13:00', status: 'skipped', tabletsDeducted: 0, reason: 'Out visiting temple with family' },
  { id: `log-${getDayString(2)}-4`, date: getDayString(2), medicationId: 'med-1', scheduledTime: '20:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(2)}-5`, date: getDayString(2), medicationId: 'med-3', scheduledTime: '21:00', status: 'taken', tabletsDeducted: 1 },

  // Day -3: All taken
  { id: `log-${getDayString(3)}-1`, date: getDayString(3), medicationId: 'med-1', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(3)}-2`, date: getDayString(3), medicationId: 'med-2', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(3)}-3`, date: getDayString(3), medicationId: 'med-4', scheduledTime: '13:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(3)}-4`, date: getDayString(3), medicationId: 'med-1', scheduledTime: '20:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(3)}-5`, date: getDayString(3), medicationId: 'med-3', scheduledTime: '21:00', status: 'taken', tabletsDeducted: 1 },

  // Day -4: All taken
  { id: `log-${getDayString(4)}-1`, date: getDayString(4), medicationId: 'med-1', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(4)}-2`, date: getDayString(4), medicationId: 'med-2', scheduledTime: '08:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(4)}-3`, date: getDayString(4), medicationId: 'med-4', scheduledTime: '13:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(4)}-4`, date: getDayString(4), medicationId: 'med-1', scheduledTime: '20:00', status: 'taken', tabletsDeducted: 1 },
  { id: `log-${getDayString(4)}-5`, date: getDayString(4), medicationId: 'med-3', scheduledTime: '21:00', status: 'taken', tabletsDeducted: 1 }
];

export const initialSymptoms = [
  {
    id: 'sym-01',
    name: 'Knee Joint Stiffness',
    severity: 'Mild',
    duration: 'About 45 minutes',
    onsetDate: `${getDayString(0)}T07:15`,
    description: 'Mild stiffness upon waking up. Resolved comfortably after warm water bath and light veranda stroll.',
    flaggedForCaregiver: false,
    loggedAt: `${getDayString(0)}T08:45:00`
  },
  {
    id: 'sym-02',
    name: 'Dizziness / Lightheadedness',
    severity: 'Mild',
    duration: '20 minutes',
    onsetDate: `${getDayString(2)}T14:30`,
    description: 'Felt slight postural spin when standing up quickly from sofa. Drank a glass of water and rested.',
    flaggedForCaregiver: true,
    caregiverNote: 'Rohan Sharma verified BP (124/80); advised standing slowly.',
    loggedAt: `${getDayString(2)}T15:10:00`
  },
  {
    id: 'sym-03',
    name: 'Mild Ankle Swelling',
    severity: 'Moderate',
    duration: 'Past evening',
    onsetDate: `${getDayString(4)}T18:00`,
    description: 'Bilateral ankle puffiness after sitting through a family wedding reception.',
    flaggedForCaregiver: true,
    caregiverNote: 'Elevated feet with pillow overnight. Swelling subsided by morning.',
    loggedAt: `${getDayString(4)}T19:30:00`
  }
];

export const initialMoodLogs = [
  {
    id: 'mood-today',
    date: getDayString(0),
    time: '11:15 AM',
    mood: 'Calm',
    score: 5, // 1 to 7 scale
    note: 'Listened to classical bhajans, enjoyed morning chamomile tea, and chatted with granddaughter Kabir.',
    loggedAt: `${getDayString(0)}T11:15:00`
  },
  {
    id: `mood-${getDayString(1)}`,
    date: getDayString(1),
    time: '04:30 PM',
    mood: 'Happy',
    score: 6,
    note: 'Rohan visited for lunch. We looked through old family photo albums from Shimla trip.',
    loggedAt: `${getDayString(1)}T16:30:00`
  },
  {
    id: `mood-${getDayString(2)}`,
    date: getDayString(2),
    time: '06:00 PM',
    mood: 'Okay',
    score: 4,
    note: 'Quiet afternoon. A bit tired from the heat, rested in bed with a novel.',
    loggedAt: `${getDayString(2)}T18:00:00`
  },
  {
    id: `mood-${getDayString(3)}`,
    date: getDayString(3),
    time: '03:15 PM',
    mood: 'Lonely',
    score: 2,
    note: 'Felt a little isolated in the afternoon when everyone was busy at work. Talked to AURA for a quick chat.',
    loggedAt: `${getDayString(3)}T15:15:00`
  },
  {
    id: `mood-${getDayString(4)}`,
    date: getDayString(4),
    time: '05:00 PM',
    mood: 'Calm',
    score: 5,
    note: 'Spent time tending to balcony plants (tulsi & jasmine). Feeling peaceful.',
    loggedAt: `${getDayString(4)}T17:00:00`
  },
  {
    id: `mood-${getDayString(5)}`,
    date: getDayString(5),
    time: '02:00 PM',
    mood: 'Happy',
    score: 6,
    note: 'Enjoyed making handmade suji halwa with Priya. Good energy today.',
    loggedAt: `${getDayString(5)}T14:00:00`
  },
  {
    id: `mood-${getDayString(6)}`,
    date: getDayString(6),
    time: '08:00 PM',
    mood: 'Calm',
    score: 5,
    note: 'Relaxing evening prayer followed by soothing warm milk.',
    loggedAt: `${getDayString(6)}T20:00:00`
  }
];

export const initialAppointments = [
  {
    id: 'apt-01',
    doctor: 'Dr. Anita Rao, MD',
    specialty: 'Geriatric Medicine',
    facility: 'Apex Senior Health Clinic, Suite 304',
    date: '2026-11-18',
    time: '10:30 AM',
    purpose: 'Routine 3-month comprehensive senior check-up & BP medication review',
    status: 'Upcoming',
    accompaniedBy: 'Rohan Sharma (Son)',
    notes: 'Bring updated BP log and empty medication boxes.'
  },
  {
    id: 'apt-02',
    doctor: 'Dr. Manan Joshi',
    specialty: 'Ophthalmology (Eye Specialist)',
    facility: 'Drishti Eye & Cataract Care Center',
    date: '2026-11-26',
    time: '03:00 PM',
    purpose: 'Annual diabetic retinopathy screening & reading glasses refraction',
    status: 'Scheduled',
    accompaniedBy: 'Priya Sharma (Daughter-in-law)',
    notes: 'Pupil dilation planned; sunglasses recommended for return journey.'
  },
  {
    id: 'apt-03',
    doctor: 'Max Lab Diagnostics (Home Visit)',
    specialty: 'Diagnostic Pathology',
    facility: 'At Home Collection',
    date: '2026-12-02',
    time: '07:30 AM',
    purpose: 'Fasting Blood Glucose, HbA1c & Lipid Profile sample pickup',
    status: 'Scheduled',
    accompaniedBy: 'Sister Mary Joseph',
    notes: 'Requires 10-12 hours overnight fasting.'
  }
];

export const initialCaregiverAlerts = [
  {
    id: 'alert-01',
    type: 'inventory_critical',
    severity: 'high',
    title: 'Critical Inventory Alert: Atorvastatin (10mg)',
    message: 'Atorvastatin Calcium has only 2 tablets remaining (estimated 2 days supply). Depletion expected by Nov 17, 2026.',
    time: 'Today, 09:15 AM',
    acknowledged: false,
    actionRequired: 'Order restock from Apollo Pharmacy or local chemist.',
    relatedId: 'med-3'
  },
  {
    id: 'alert-02',
    type: 'inventory_warning',
    severity: 'medium',
    title: 'Low Stock Alert: Amlodipine (5mg)',
    message: 'Amlodipine Besylate has 4 tablets remaining (threshold is 8). 4 days supply remaining.',
    time: 'Today, 08:30 AM',
    acknowledged: false,
    actionRequired: 'Approve prescription refill.',
    relatedId: 'med-2'
  },
  {
    id: 'alert-03',
    type: 'adherence_praise',
    severity: 'info',
    title: 'Excellent Morning Adherence',
    message: 'Margaret confirmed all morning doses (Metformin & Amlodipine) on schedule at 08:23 AM.',
    time: 'Today, 08:25 AM',
    acknowledged: true,
    actionRequired: 'None',
    acknowledgedAt: 'Today, 08:40 AM by Rohan Sharma'
  }
];

export const initialFamilyMessages = [
  {
    id: 'msg-01',
    author: 'Rohan Sharma',
    relation: 'Son',
    avatar: '👨‍💼',
    content: 'Good morning Maa! Saw you completed your morning walk and took your medicines on time. I have cleared my calendar for Wednesday morning to drive you to Dr. Anita’s clinic.',
    time: 'Today, 09:40 AM',
    likes: 2
  },
  {
    id: 'msg-02',
    author: 'Kabir Sharma',
    relation: 'Grandson (Age 14)',
    avatar: '👦',
    content: 'Dadi! I scored 94% in my Science quiz today, just like we practiced! Can we solve the Sunday Sudoku puzzle together when I come over this weekend? Love you! ❤️',
    time: 'Yesterday, 06:15 PM',
    likes: 3
  },
  {
    id: 'msg-03',
    author: 'Priya Sharma',
    relation: 'Daughter-in-law',
    avatar: '👩‍🏫',
    content: 'Maa, I prepared fresh bottle gourd (lauki) soup and baked multigrain khakhra for your evening snack. Rohan will drop the container on his way back from work.',
    time: 'Yesterday, 01:20 PM',
    likes: 2
  }
];

export const initialAuraConversation = [
  {
    id: 'aura-msg-1',
    sender: 'aura',
    text: "Namaste Margaret! It's lovely to be with you today. How are you feeling in your heart and body this afternoon?",
    timestamp: '12:00 PM',
    category: 'greeting'
  },
  {
    id: 'aura-msg-2',
    sender: 'user',
    text: "I am feeling quite peaceful today, thank you Aura. Just had my afternoon calcium tablet.",
    timestamp: '12:02 PM',
    category: 'user_reply'
  },
  {
    id: 'aura-msg-3',
    sender: 'aura',
    text: "That is wonderful to hear! I see your calcium dose is safely logged. Staying regular with it keeps your joints resilient. Would you like to do a gentle 2-minute seated breathing exercise together, or perhaps hear a pleasant thought for the day?",
    timestamp: '12:03 PM',
    category: 'wellness_prompt'
  }
];
