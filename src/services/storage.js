// Storage and Data Service for ElderCare 360
// Uses localStorage with automatic schema initialization and cross-module synchronization.

import {
  initialPatientProfile,
  initialMedications,
  initialDoseLogs,
  initialSymptoms,
  initialMoodLogs,
  initialAppointments,
  initialCaregiverAlerts,
  initialFamilyMessages,
  initialAuraConversation
} from '../data/mockData.js';

const KEYS = {
  PROFILE: 'eldercare_patient_profile',
  MEDICATIONS: 'eldercare_medications',
  DOSE_LOGS: 'eldercare_dose_logs',
  SYMPTOMS: 'eldercare_symptoms',
  MOODS: 'eldercare_moods',
  APPOINTMENTS: 'eldercare_appointments',
  ALERTS: 'eldercare_alerts',
  FAMILY_MSGS: 'eldercare_family_messages',
  AURA_CHAT: 'eldercare_aura_chat',
  ACCESSIBILITY: 'eldercare_accessibility'
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error parsing localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for real-time reactivity within the page
    window.dispatchEvent(new CustomEvent('eldercare_storage_update', { detail: { key, value } }));
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}":`, err);
  }
}

// Initialize all storage on app startup if empty
export function initializeStorage() {
  if (!localStorage.getItem(KEYS.PROFILE)) {
    safeSet(KEYS.PROFILE, initialPatientProfile);
  }
  if (!localStorage.getItem(KEYS.MEDICATIONS)) {
    safeSet(KEYS.MEDICATIONS, initialMedications);
  }
  if (!localStorage.getItem(KEYS.DOSE_LOGS)) {
    safeSet(KEYS.DOSE_LOGS, initialDoseLogs);
  }
  if (!localStorage.getItem(KEYS.SYMPTOMS)) {
    safeSet(KEYS.SYMPTOMS, initialSymptoms);
  }
  if (!localStorage.getItem(KEYS.MOODS)) {
    safeSet(KEYS.MOODS, initialMoodLogs);
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    safeSet(KEYS.APPOINTMENTS, initialAppointments);
  }
  if (!localStorage.getItem(KEYS.ALERTS)) {
    safeSet(KEYS.ALERTS, initialCaregiverAlerts);
  }
  if (!localStorage.getItem(KEYS.FAMILY_MSGS)) {
    safeSet(KEYS.FAMILY_MSGS, initialFamilyMessages);
  }
  if (!localStorage.getItem(KEYS.AURA_CHAT)) {
    safeSet(KEYS.AURA_CHAT, initialAuraConversation);
  }
  if (!localStorage.getItem(KEYS.ACCESSIBILITY)) {
    safeSet(KEYS.ACCESSIBILITY, {
      fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
      highContrast: false,
      speechNarration: false
    });
  }
}

// Reset everything to pristine initial mock data
export function resetAllToDemoData() {
  safeSet(KEYS.PROFILE, initialPatientProfile);
  safeSet(KEYS.MEDICATIONS, initialMedications);
  safeSet(KEYS.DOSE_LOGS, initialDoseLogs);
  safeSet(KEYS.SYMPTOMS, initialSymptoms);
  safeSet(KEYS.MOODS, initialMoodLogs);
  safeSet(KEYS.APPOINTMENTS, initialAppointments);
  safeSet(KEYS.ALERTS, initialCaregiverAlerts);
  safeSet(KEYS.FAMILY_MSGS, initialFamilyMessages);
  safeSet(KEYS.AURA_CHAT, initialAuraConversation);
  return true;
}

// Profile API
export function getPatientProfile() {
  return safeGet(KEYS.PROFILE, initialPatientProfile);
}

export function updatePatientProfile(updated) {
  const current = getPatientProfile();
  const merged = { ...current, ...updated };
  if (updated.vitals) {
    const history = Array.isArray(current.vitalsHistory) ? current.vitalsHistory : [];
    merged.vitalsHistory = [{
      ...updated.vitals,
      recordedAt: new Date().toISOString()
    }, ...history].slice(0, 100);
  }
  safeSet(KEYS.PROFILE, merged);
  return merged;
}

export function getVitalsHistory() {
  const profile = getPatientProfile();
  return Array.isArray(profile.vitalsHistory) ? profile.vitalsHistory : [];
}

// Medications API
export function getMedications() {
  return safeGet(KEYS.MEDICATIONS, initialMedications);
}

export function saveMedication(medData) {
  const list = getMedications();
  let updated;
  if (medData.id) {
    // Edit existing
    updated = list.map((m) => (m.id === medData.id ? { ...m, ...medData } : m));
  } else {
    // Create new
    const newMed = {
      ...medData,
      id: `med-${Date.now()}`,
      currentStock: Number(medData.currentStock) || 0,
      tabletsPerDose: Number(medData.tabletsPerDose) || 1,
      reorderThreshold: Number(medData.reorderThreshold) || 10,
      frequencyCount: medData.scheduledTimes ? medData.scheduledTimes.length : 1,
      color: medData.color || '#0D9488'
    };
    updated = [newMed, ...list];
  }
  safeSet(KEYS.MEDICATIONS, updated);
  return updated;
}

export function deleteMedication(medId) {
  const list = getMedications();
  const updated = list.filter((m) => m.id !== medId);
  safeSet(KEYS.MEDICATIONS, updated);
  return updated;
}

// Dose Logs & Inventory Interaction API
export function getDoseLogs() {
  return safeGet(KEYS.DOSE_LOGS, initialDoseLogs);
}

/**
 * Mark a dose as Taken or Skipped with strict inventory controls:
 * - Taken: Deduct prescribed tablets, prevent duplicate deduction
 * - Skipped: Do not deduct stock
 * - Automatic 2-day depletion and low stock alert generation
 */
export function recordDoseAction(dateStr, medicationId, scheduledTime, status, reason = '') {
  const meds = getMedications();
  const logs = getDoseLogs();
  const med = meds.find((m) => m.id === medicationId);

  if (!med) {
    return { success: false, error: 'Medication not found' };
  }

  const logId = `log-${dateStr}-${medicationId}-${scheduledTime}`;
  const existingLogIndex = logs.findIndex((l) => l.id === logId);
  const existingLog = existingLogIndex >= 0 ? logs[existingLogIndex] : null;

  // Prevent duplicate deduction if already marked taken
  if (status === 'taken' && existingLog && existingLog.status === 'taken') {
    return {
      success: false,
      alreadyTaken: true,
      message: 'This dose was already recorded as taken. Stock deduction prevented.'
    };
  }

  let updatedMeds = [...meds];
  let deductedQuantity = 0;

  if (status === 'taken') {
    deductedQuantity = Number(med.tabletsPerDose) || 1;
    // Deduct stock safely (cannot go below 0)
    const newStock = Math.max(0, (med.currentStock || 0) - deductedQuantity);

    updatedMeds = meds.map((m) => {
      if (m.id === medicationId) {
        return { ...m, currentStock: newStock };
      }
      return m;
    });

    safeSet(KEYS.MEDICATIONS, updatedMeds);

    evaluateMedicationStock({ ...med, currentStock: newStock });
  } else if (status === 'skipped' || status === 'missed') {
    // If the dose was previously taken and user changes it to skipped, refund the deducted tablets
    if (existingLog && existingLog.status === 'taken' && existingLog.tabletsDeducted) {
      const restoredStock = (med.currentStock || 0) + existingLog.tabletsDeducted;
      updatedMeds = meds.map((m) => {
        if (m.id === medicationId) {
          return { ...m, currentStock: restoredStock };
        }
        return m;
      });
      safeSet(KEYS.MEDICATIONS, updatedMeds);
    }
    deductedQuantity = 0;
  }

  // Create or update log entry
  const newLogEntry = {
    id: logId,
    date: dateStr,
    medicationId,
    medicationName: med.name,
    dosage: med.dosage,
    scheduledTime,
    status, // 'taken' | 'skipped'
    reason: status === 'skipped' ? reason || 'Skipped by user' : status === 'missed' ? reason || 'Dose window passed without confirmation' : undefined,
    tabletsDeducted: deductedQuantity,
    recordedAt: new Date().toISOString()
  };

  let updatedLogs;
  if (existingLogIndex >= 0) {
    updatedLogs = [...logs];
    updatedLogs[existingLogIndex] = newLogEntry;
  } else {
    updatedLogs = [newLogEntry, ...logs];
  }

  safeSet(KEYS.DOSE_LOGS, updatedLogs);

  return {
    success: true,
    log: newLogEntry,
    updatedMed: updatedMeds.find((m) => m.id === medicationId)
  };
}

// Local calendar date avoids UTC date shifts for users outside UTC.
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Prevent the minute-by-minute reminder checks from creating duplicate alerts.
// Acknowledging an alert does not immediately create a new copy; a fresh reminder
// may be generated after 24 hours if the underlying condition still exists.
function hasActiveAlert(type, relatedId) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return getCaregiverAlerts().some((alert) => {
    if (alert.type !== type || alert.relatedId !== relatedId) return false;
    const created = alert.createdAt ? new Date(alert.createdAt).getTime() : 0;
    return Number.isFinite(created) && created >= cutoff;
  });
}

export function evaluateMedicationStock(medication) {
  const dailyRequirement = (Number(medication.tabletsPerDose) || 1) *
    (medication.scheduledTimes?.length || 1);
  const stock = Math.max(0, Number(medication.currentStock) || 0);
  const daysLeft = dailyRequirement > 0 ? Math.floor(stock / dailyRequirement) : 0;

  if (daysLeft <= 2 && !hasActiveAlert('inventory_critical', medication.id)) {
    addCaregiverAlert({
      type: 'inventory_critical', severity: 'high',
      title: `Restock Reminder: ${medication.name}`,
      message: `${medication.name} (${medication.dosage}) has ${stock} tablets left (approximately ${daysLeft} days of supply).`,
      actionRequired: 'Contact the pharmacy or prescribing clinician to arrange a refill.',
      relatedId: medication.id
    });
  } else if (stock <= (Number(medication.reorderThreshold) || 10) &&
      !hasActiveAlert('inventory_warning', medication.id) && daysLeft > 2) {
    addCaregiverAlert({
      type: 'inventory_warning', severity: 'medium',
      title: `Low Stock Notice: ${medication.name}`,
      message: `${medication.name} stock is ${stock}, at or below its reorder threshold.`,
      actionRequired: 'Plan a medication refill.', relatedId: medication.id
    });
  }
  if (medication.expiryDate) {
    const expiry = new Date(`${medication.expiryDate}T00:00:00`);
    const daysToExpiry = Math.ceil((expiry - new Date()) / 86400000);
    if (daysToExpiry <= 30 && daysToExpiry >= 0 && !hasActiveAlert('expiry_warning', medication.id)) {
      addCaregiverAlert({ type: 'expiry_warning', severity: 'medium', title: `Medication Expiry Warning: ${medication.name}`, message: `${medication.name} is due to expire in ${daysToExpiry} day(s) (${medication.expiryDate}).`, actionRequired: 'Check the packaging and ask the pharmacist or prescriber about replacement.', relatedId: medication.id });
    }
    if (daysToExpiry < 0 && !hasActiveAlert('expiry_critical', medication.id)) {
      addCaregiverAlert({ type: 'expiry_critical', severity: 'high', title: `Expired Medication: ${medication.name}`, message: `${medication.name} has passed its recorded expiry date (${medication.expiryDate}).`, actionRequired: 'Do not use expired medicine; confirm replacement with a pharmacist or clinician.', relatedId: medication.id });
    }
  }
  return { stock, dailyRequirement, daysLeft };
}

export function evaluateAllMedicationStock() {
  return getMedications().map(evaluateMedicationStock);
}

// Mark a dose missed only after a 60-minute grace period. Missed doses never deduct stock.
export function processMissedDoses(now = new Date(), graceMinutes = 60) {
  const dateStr = getLocalDateString(now);
  const logs = getDoseLogs();
  const meds = getMedications();
  const newMissed = [];

  meds.forEach((med) => {
    (med.scheduledTimes || ['08:00']).forEach((time) => {
      const [hour, minute] = String(time).split(':').map(Number);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return;
      const due = new Date(now);
      due.setHours(hour, minute, 0, 0);
      const deadline = new Date(due.getTime() + graceMinutes * 60000);
      if (now < deadline) return;

      const logId = `log-${dateStr}-${med.id}-${time}`;
      const existing = logs.find((log) => log.id === logId);
      if (existing) return;

      const missedLog = {
        id: logId, date: dateStr, medicationId: med.id,
        medicationName: med.name, dosage: med.dosage,
        scheduledTime: time, status: 'missed', reason: 'No confirmation received within the 60-minute grace period',
        tabletsDeducted: 0, recordedAt: now.toISOString()
      };
      logs.unshift(missedLog);
      newMissed.push(missedLog);
      if (!hasActiveAlert('missed_dose', logId)) {
        addCaregiverAlert({
          type: 'missed_dose', severity: 'medium',
          title: `Missed Dose: ${med.name}`,
          message: `${med.name} ${med.dosage}, scheduled for ${time}, was not confirmed within the grace period.`,
          actionRequired: 'Check in with the patient. Do not double a dose; follow the prescription or clinician guidance.',
          relatedId: logId
        });
      }
    });
  });

  if (newMissed.length) safeSet(KEYS.DOSE_LOGS, logs);
  return newMissed;
}

export function evaluateUpcomingAppointments(now = new Date()) {
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcoming = getAppointments().filter((apt) => {
    if (!apt.date) return false;
    const timeMatch = String(apt.time || '09:00').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    let hours = timeMatch ? Number(timeMatch[1]) : 9;
    const minutes = timeMatch ? Number(timeMatch[2]) : 0;
    if (timeMatch?.[3]?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (timeMatch?.[3]?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const date = new Date(`${apt.date}T00:00:00`);
    date.setHours(hours, minutes, 0, 0);
    return date >= now && date <= horizon;
  });
  upcoming.forEach((apt) => {
    if (!hasActiveAlert('appointment_reminder', apt.id)) addCaregiverAlert({
      type: 'appointment_reminder', severity: 'low',
      title: `Upcoming Appointment: ${apt.doctor}`,
      message: `${apt.specialty || 'Medical'} appointment at ${apt.facility} on ${apt.date}, ${apt.time}.`,
      actionRequired: 'Confirm transport and caregiver availability.', relatedId: apt.id
    });
  });
  return upcoming.length;
}

// Manual Stock Adjustment & Restocking
export function adjustMedicationStock(medicationId, addedQuantity, newExpiry = null, reason = 'Manual Restock') {
  const meds = getMedications();
  const med = meds.find((m) => m.id === medicationId);
  if (!med) return null;

  const newStock = Math.max(0, (med.currentStock || 0) + Number(addedQuantity));
  const updatedMeds = meds.map((m) => {
    if (m.id === medicationId) {
      return {
        ...m,
        currentStock: newStock,
        expiryDate: newExpiry || m.expiryDate
      };
    }
    return m;
  });

  safeSet(KEYS.MEDICATIONS, updatedMeds);
  const refreshedAlerts = getCaregiverAlerts().map((alert) => {
    if (alert.relatedId === medicationId && ['inventory_critical', 'inventory_warning'].includes(alert.type) && !alert.acknowledged) {
      return { ...alert, acknowledged: true, acknowledgedAt: 'Resolved by medication restock' };
    }
    return alert;
  });
  safeSet(KEYS.ALERTS, refreshedAlerts);

  // Add confirmation to alerts/activity
  addCaregiverAlert({
    type: 'inventory_restocked',
    severity: 'info',
    title: `Stock Restocked: ${med.name}`,
    message: `Added ${addedQuantity} tablets. New stock total is ${newStock} tablets. (${reason})`,
    actionRequired: 'None',
    acknowledged: true,
    acknowledgedAt: 'Auto-acknowledged'
  });

  return updatedMeds;
}

// Daily Schedule Builder
export function getDailySchedule(dateStr = getLocalDateString()) {
  const meds = getMedications();
  const logs = getDoseLogs();

  const scheduleSlots = [];

  meds.forEach((med) => {
    const times = med.scheduledTimes || ['08:00'];
    times.forEach((timeStr, idx) => {
      const logId = `log-${dateStr}-${med.id}-${timeStr}`;
      const log = logs.find((l) => l.id === logId || (l.date === dateStr && l.medicationId === med.id && l.scheduledTime === timeStr));

      let status = 'pending';
      if (log) {
        status = log.status; // 'taken' | 'skipped'
      }

      // Time category
      const hour = parseInt(timeStr.split(':')[0], 10);
      let period = 'Morning';
      if (hour >= 12 && hour < 17) period = 'Afternoon';
      else if (hour >= 17 && hour < 21) period = 'Evening';
      else if (hour >= 21 || hour < 6) period = 'Night';

      scheduleSlots.push({
        id: `${med.id}-${timeStr}`,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        tabletsPerDose: med.tabletsPerDose || 1,
        time: timeStr,
        period,
        instructions: med.instructions,
        purpose: med.purpose,
        color: med.color,
        currentStock: med.currentStock,
        status,
        recordedAt: log?.recordedAt,
        skipReason: log?.reason
      });
    });
  });

  // Sort by time chronologically
  scheduleSlots.sort((a, b) => a.time.localeCompare(b.time));
  return scheduleSlots;
}

// Adherence Calculation (Last 7 Days)
export function getAdherenceStats(days = 7) {
  const logs = getDoseLogs();
  const meds = getMedications();
  const totalDailyScheduledDoses = meds.reduce((acc, m) => acc + (m.scheduledTimes?.length || 1), 0);

  const dates = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  let totalScheduled = 0;
  let totalTaken = 0;
  let totalSkipped = 0;

  const trendData = dates.map((dateStr) => {
    const dayLogs = logs.filter((l) => l.date === dateStr);
    const taken = dayLogs.filter((l) => l.status === 'taken').length;
    const skipped = dayLogs.filter((l) => l.status === 'skipped' || l.status === 'missed').length;
    const scheduled = Math.max(totalDailyScheduledDoses, taken + skipped);

    totalScheduled += scheduled;
    totalTaken += taken;
    totalSkipped += skipped;

    const rate = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 100;
    const dayLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    return {
      date: dateStr,
      label: dayLabel,
      taken,
      skipped,
      scheduled,
      adherenceRate: rate
    };
  });

  const overallRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

  return {
    overallRate,
    totalScheduled,
    totalTaken,
    totalSkipped,
    trendData
  };
}

// Symptoms API
export function getSymptoms() {
  return safeGet(KEYS.SYMPTOMS, initialSymptoms);
}

export function addSymptom(symptomData) {
  const current = getSymptoms();
  const newEntry = {
    ...symptomData,
    id: `sym-${Date.now()}`,
    loggedAt: new Date().toISOString()
  };
  const updated = [newEntry, ...current];
  safeSet(KEYS.SYMPTOMS, updated);

  // If Moderate or Severe, automatically create a Caregiver Alert
  if (symptomData.severity === 'Severe' || symptomData.severity === 'Moderate') {
    addCaregiverAlert({
      type: 'symptom_alert',
      severity: symptomData.severity === 'Severe' ? 'high' : 'medium',
      title: `${symptomData.severity} Symptom Logged: ${symptomData.name}`,
      message: `Margaret logged "${symptomData.name}" (${symptomData.severity}). Duration: ${symptomData.duration || 'Not specified'}. Description: ${symptomData.description || 'None'}.`,
      actionRequired: symptomData.severity === 'Severe' ? 'Contact elder and evaluate immediately.' : 'Monitor condition.',
      relatedId: newEntry.id
    });
  }

  return newEntry;
}

// Moods API
export function getMoodLogs() {
  return safeGet(KEYS.MOODS, initialMoodLogs);
}

export function addMoodLog(moodData) {
  const current = getMoodLogs();
  const newEntry = {
    ...moodData,
    id: `mood-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    loggedAt: new Date().toISOString()
  };
  const updated = [newEntry, ...current];
  safeSet(KEYS.MOODS, updated);

  // Check for repeated concerning moods (Sad, Anxious, Lonely, Very distressed)
  const concerningList = ['Sad', 'Anxious', 'Lonely', 'Very distressed'];
  const recentThree = updated.slice(0, 3);
  const concerningCount = recentThree.filter((m) => concerningList.includes(m.mood)).length;

  if (concerningCount >= 2) {
    addCaregiverAlert({
      type: 'emotional_wellness',
      severity: 'medium',
      title: 'Emotional Well-Being Alert: Repeated Low Mood',
      message: `Margaret has logged concerning emotional states (${concerningCount} of the last 3 check-ins). Reaching out with a warm phone call or visit is recommended.`,
      actionRequired: 'Call Margaret or schedule a family visit.',
      relatedId: newEntry.id
    });
  }

  return newEntry;
}

// Appointments API
export function getAppointments() {
  return safeGet(KEYS.APPOINTMENTS, initialAppointments);
}

export function addAppointment(aptData) {
  const current = getAppointments();
  const newApt = {
    ...aptData,
    id: `apt-${Date.now()}`,
    status: 'Scheduled'
  };
  const updated = [newApt, ...current];
  safeSet(KEYS.APPOINTMENTS, updated);
  return updated;
}

export function updateAppointment(aptId, updatedData) {
  const updated = getAppointments().map((apt) =>
    apt.id === aptId ? { ...apt, ...updatedData, id: aptId } : apt
  );
  safeSet(KEYS.APPOINTMENTS, updated);
  return updated;
}

export function deleteAppointment(aptId) {
  const updated = getAppointments().filter((apt) => apt.id !== aptId);
  safeSet(KEYS.APPOINTMENTS, updated);
  return updated;
}

// Caregiver Alerts API
export function getCaregiverAlerts() {
  return safeGet(KEYS.ALERTS, initialCaregiverAlerts);
}

export function addCaregiverAlert(alertData) {
  const current = getCaregiverAlerts();
  const duplicate = current.find((alert) =>
    !alert.acknowledged && alert.type === alertData.type &&
    alert.relatedId === alertData.relatedId && alert.title === alertData.title
  );
  if (duplicate) return duplicate;
  const newAlert = {
    ...alertData,
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: 'Just now',
    acknowledged: Boolean(alertData.acknowledged),
    createdAt: new Date().toISOString()
  };
  const updated = [newAlert, ...current];
  safeSet(KEYS.ALERTS, updated);
  return newAlert;
}

export function acknowledgeAlert(alertId, acknowledgedBy = 'Rohan Sharma (Caregiver)', notes = '') {
  const current = getCaregiverAlerts();
  const updated = current.map((a) => {
    if (a.id === alertId) {
      return {
        ...a,
        acknowledged: true,
        acknowledgedAt: `Acknowledged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${acknowledgedBy}`,
        caregiverNotes: notes
      };
    }
    return a;
  });
  safeSet(KEYS.ALERTS, updated);
  return updated;
}

// Family Messages API
export function getFamilyMessages() {
  return safeGet(KEYS.FAMILY_MSGS, initialFamilyMessages);
}

export function addFamilyMessage(msgData) {
  const current = getFamilyMessages();
  const newMsg = {
    ...msgData,
    id: `msg-${Date.now()}`,
    time: 'Just now',
    likes: 0,
    timestamp: new Date().toISOString()
  };
  const updated = [newMsg, ...current];
  safeSet(KEYS.FAMILY_MSGS, updated);
  return updated;
}

export function likeFamilyMessage(msgId) {
  const current = getFamilyMessages();
  const updated = current.map((m) => (m.id === msgId ? { ...m, likes: (m.likes || 0) + 1 } : m));
  safeSet(KEYS.FAMILY_MSGS, updated);
  return updated;
}

// Aura Chat API
export function getAuraMessages() {
  return safeGet(KEYS.AURA_CHAT, initialAuraConversation);
}

export function saveAuraMessage(msg) {
  const current = getAuraMessages();
  const updated = [...current, msg];
  safeSet(KEYS.AURA_CHAT, updated);
  return updated;
}

export function clearAuraMessages() {
  safeSet(KEYS.AURA_CHAT, initialAuraConversation);
  return initialAuraConversation;
}

// Accessibility API
export function getAccessibilitySettings() {
  return safeGet(KEYS.ACCESSIBILITY, {
    fontSize: 'normal',
    highContrast: false,
    speechNarration: false
  });
}

export function updateAccessibilitySettings(settings) {
  const current = getAccessibilitySettings();
  const updated = { ...current, ...settings };
  safeSet(KEYS.ACCESSIBILITY, updated);
  return updated;
}
