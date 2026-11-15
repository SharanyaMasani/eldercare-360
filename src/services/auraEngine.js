// AURA — Emotional AI Companion Engine for ElderCare 360
// Fully local, privacy-first, empathetic conversational assistant with health context awareness and crisis escalation.

import { evaluateCrisisSafety } from './emergencyRules';
import {
  getPatientProfile,
  getMedications,
  getDailySchedule,
  getMoodLogs,
  getAppointments,
  addCaregiverAlert
} from './storage';

// Interactive Wellness Activities that Aura can recommend and guide
export const WELLNESS_ACTIVITIES = [
  {
    id: 'box_breathing',
    title: '4-4-4 Calming Breath',
    duration: '2 minutes',
    description: 'A gentle paced breathing exercise to steady heart rate and calm the nervous system.',
    steps: [
      'Gently inhale through your nose for 4 seconds...',
      'Hold that soft peaceful breath for 4 seconds...',
      'Slowly release and exhale through your mouth for 4 seconds...',
      'Rest quietly for 4 seconds before the next gentle breath.'
    ]
  },
  {
    id: 'gratitude_reflection',
    title: 'Warm Gratitude Moment',
    duration: '1 minute',
    description: 'Reflect on a simple pleasant sensation or memory from today.',
    steps: [
      'Think of one small comfort today — perhaps a warm cup of tea, the breeze by the window, or a loved one’s smile.',
      'Take a deep breath and let that feeling of gratitude warm your chest.'
    ]
  },
  {
    id: 'gentle_stretch',
    title: 'Seated Shoulder & Neck Release',
    duration: '3 minutes',
    description: 'Safe, easy seated upper body stretches for senior relaxation.',
    steps: [
      'Sit tall and comfortably in your chair with feet flat on the floor.',
      'Gently drop your right ear toward your right shoulder for 10 seconds. Breathe softly.',
      'Now gently tilt toward your left shoulder for 10 seconds.',
      'Slowly roll your shoulders backward three times, releasing all tension.'
    ]
  }
];

/**
 * Generate a context-aware response from AURA based on user message and current health records.
 * @param {string} userMessage 
 * @returns {object} { text, isCrisis, crisisData, suggestedActivity, quickReplies }
 */
export function generateAuraResponse(userMessage) {
  const profile = getPatientProfile();
  const todaySchedule = getDailySchedule();
  const moods = getMoodLogs();
  const appointments = getAppointments();
  const todayMood = moods.length > 0 ? moods[0] : null;

  const normalized = (userMessage || '').trim().toLowerCase();

  // 1. CRISIS SAFETY EVALUATION FIRST (Immediate priority, no waiting)
  const crisisCheck = evaluateCrisisSafety(normalized);
  if (crisisCheck) {
    // Automatically trigger caregiver escalation alert
    addCaregiverAlert({
      type: 'crisis_safety',
      severity: 'critical',
      title: 'URGENT: Emotional Crisis Triggered in AURA Chat',
      message: `Margaret entered distress message: "${userMessage}". Immediate crisis safety protocol activated.`,
      actionRequired: 'Call Margaret immediately or dispatch local emergency support.',
      acknowledged: false,
      relatedId: 'aura-crisis'
    });

    return {
      text: `${crisisCheck.message}\n\nPlease know that your life has immense value, and there are caring people who want to listen and help right now. I have alerted your caregiver (${profile.emergencyContact.name}), and our free 24/7 helplines are available right below.`,
      isCrisis: true,
      crisisData: crisisCheck,
      suggestedActivity: null,
      quickReplies: ['Call Caregiver Now', 'Call 112 Emergency', 'I am safe now']
    };
  }

  // 2. HEALTH & MEDICATION CONTEXT QUERIES
  // "Did I take my medicine?" / "What pills do I have left?"
  if (normalized.includes('medicine') || normalized.includes('pill') || normalized.includes('dose') || normalized.includes('medication')) {
    const takenDoses = todaySchedule.filter((s) => s.status === 'taken');
    const pendingDoses = todaySchedule.filter((s) => s.status === 'pending');

    if (normalized.includes('did i take') || normalized.includes('have i taken') || normalized.includes('status')) {
      if (pendingDoses.length === 0) {
        return {
          text: `Yes, ${profile.preferredName}! You have successfully taken all your scheduled medications for today (${takenDoses.map((d) => d.medicationName).join(', ')}). Your discipline with your health is wonderful!`,
          isCrisis: false,
          quickReplies: ['How is my blood pressure?', 'Let’s do a breathing exercise', 'Thank you, Aura']
        };
      } else {
        const nextDose = pendingDoses[0];
        return {
          text: `You have taken ${takenDoses.length} dose${takenDoses.length === 1 ? '' : 's'} today. Your next upcoming medicine is ${nextDose.medicationName} (${nextDose.dosage}) scheduled for ${nextDose.time} (${nextDose.period}). Would you like me to guide you to the schedule?`,
          isCrisis: false,
          quickReplies: ['Open Medication Schedule', 'Remind me later', 'How are my stocks?']
        };
      }
    }

    if (normalized.includes('stock') || normalized.includes('inventory') || normalized.includes('refill')) {
      const meds = getMedications();
      const lowMeds = meds.filter((m) => m.currentStock <= (m.reorderThreshold || 10));
      if (lowMeds.length > 0) {
        const names = lowMeds.map((m) => `${m.name} (${m.currentStock} left)`).join(', ');
        return {
          text: `I checked your medicine cabinet: ${names} are running low. I have already flagged this for ${profile.emergencyContact.name} on the Caregiver Dashboard so you don’t have to worry!`,
          isCrisis: false,
          quickReplies: ['View Inventory', 'Thank you', 'How do I feel today?']
        };
      } else {
        return {
          text: `All your medications have ample supply right now. Everything is well stocked!`,
          isCrisis: false,
          quickReplies: ['Check today’s schedule', 'Talk about something else']
        };
      }
    }
  }

  // 3. APPOINTMENTS QUERY
  if (normalized.includes('doctor') || normalized.includes('appointment') || normalized.includes('clinic') || normalized.includes('hospital')) {
    if (appointments.length > 0) {
      const nextApt = appointments[0];
      return {
        text: `Your next appointment is with ${nextApt.doctor} (${nextApt.specialty}) on ${nextApt.date} at ${nextApt.time} at ${nextApt.facility}. ${nextApt.accompaniedBy ? `Your ${nextApt.accompaniedBy} is scheduled to accompany you.` : ''}`,
        isCrisis: false,
        quickReplies: ['Check instructions', 'Call clinic', 'Thank you']
      };
    }
  }

  // 4. EMOTIONAL / LONELINESS / SADNESS CONVERSATION
  if (
    normalized.includes('lonely') ||
    normalized.includes('alone') ||
    normalized.includes('miss') ||
    normalized.includes('empty') ||
    normalized.includes('nobody')
  ) {
    return {
      text: `I'm right here with you, ${profile.preferredName}. It is completely natural to feel quiet or miss family when the house is still. Your grandson Kabir and son Rohan left some heartwarming messages on your Family Wall earlier. Would you like to view them, or shall we do a calming 2-minute breathing exercise together?`,
      isCrisis: false,
      suggestedActivity: WELLNESS_ACTIVITIES[0],
      quickReplies: ['Start 4-4-4 Breathing', 'Read Family Messages', 'Call Rohan']
    };
  }

  if (
    normalized.includes('sad') ||
    normalized.includes('down') ||
    normalized.includes('unhappy') ||
    normalized.includes('crying') ||
    normalized.includes('heavy')
  ) {
    return {
      text: `I am listening, and I want you to know it is okay to feel this way. You don’t have to carry heavy feelings alone. Would you like to share what feels weighing on your mind today? Or would a gentle shoulder stretch or a cup of warm tea help right now?`,
      isCrisis: false,
      suggestedActivity: WELLNESS_ACTIVITIES[2],
      quickReplies: ['I want to talk', 'Gentle Shoulder Stretch', 'Call Caregiver']
    };
  }

  if (
    normalized.includes('anxious') ||
    normalized.includes('worried') ||
    normalized.includes('nervous') ||
    normalized.includes('fear') ||
    normalized.includes('scared')
  ) {
    return {
      text: `Let's take a slow, gentle breath together right now. Inhale softly... and release. You are safe here in your home. Remember that whatever is on your mind, you have managed many challenges with grace. Let’s do our 4-4-4 calming breath together.`,
      isCrisis: false,
      suggestedActivity: WELLNESS_ACTIVITIES[0],
      quickReplies: ['Start Breathing Exercise', 'Check my vitals', 'I feel a bit better']
    };
  }

  if (
    normalized.includes('happy') ||
    normalized.includes('good') ||
    normalized.includes('great') ||
    normalized.includes('wonderful') ||
    normalized.includes('peaceful') ||
    normalized.includes('fine')
  ) {
    return {
      text: `That brings such joy to hear, ${profile.preferredName}! Cherishing peaceful, happy days is the finest medicine for the soul. What brought a smile to your face today?`,
      isCrisis: false,
      suggestedActivity: WELLNESS_ACTIVITIES[1],
      quickReplies: ['Morning garden stroll', 'Chatted with family', 'Log this in my mood']
    };
  }

  // 5. WELLNESS ACTIVITY REQUESTS
  if (normalized.includes('breathe') || normalized.includes('breathing') || normalized.includes('relax') || normalized.includes('calm down')) {
    return {
      text: `Splendid idea. The 4-4-4 Calming Breath is gentle on the heart and wonderful for settling the mind. Here is our guide:`,
      isCrisis: false,
      suggestedActivity: WELLNESS_ACTIVITIES[0],
      quickReplies: ['Inhale', 'Exhale', 'Done with exercise']
    };
  }

  if (normalized.includes('stretch') || normalized.includes('exercise') || normalized.includes('stiff') || normalized.includes('joint')) {
    return {
      text: `Gentle movement keeps our joints limber. Here is a seated neck and shoulder release you can do comfortably from your armchair:`,
      isCrisis: false,
      suggestedActivity: WELLNESS_ACTIVITIES[2],
      quickReplies: ['Started stretch', 'Feels good', 'Thank you']
    };
  }

  if (normalized.includes('summary') || normalized.includes('report') || normalized.includes('how am i doing')) {
    const adherence = todaySchedule.filter((s) => s.status === 'taken').length;
    const total = todaySchedule.length;
    return {
      text: `Here is your day at a glance, ${profile.preferredName}:\n• Medication adherence today: ${adherence} of ${total} doses taken.\n• Current logged mood: ${todayMood ? todayMood.mood : 'Not logged yet'}.\n• Vitals: BP ${profile.vitals.bloodPressure}, Pulse ${profile.vitals.heartRate}.\n• Inventory: Atorvastatin restock reminder has been sent to ${profile.emergencyContact.name}.\n\nYou are doing remarkably well!`,
      isCrisis: false,
      quickReplies: ['Log my mood', 'View daily schedule', 'Talk to family']
    };
  }

  // 6. GREETINGS & INTRODUCTIONS
  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('namaste') || normalized.includes('good morning') || normalized.includes('good afternoon')) {
    return {
      text: `Namaste ${profile.preferredName}! It is always a pleasure to spend time with you. How is your day going so far? I can help you check your medications, guide a relaxing breathing exercise, or simply chat.`,
      isCrisis: false,
      quickReplies: ['How are my medications today?', 'Suggest a wellness exercise', 'I feel lonely']
    };
  }

  // 7. DEFAULT CONVERSATIONAL EMPATHETIC FALLBACK
  return {
    text: `Thank you for sharing that with me, ${profile.preferredName}. I am here to listen with patience and care. Is there anything specific on your mind today, or would you like to review your health schedule or try a relaxing activity?`,
    isCrisis: false,
    suggestedActivity: null,
    quickReplies: ['Check today’s medications', 'Try a calming exercise', 'View family messages']
  };
}
