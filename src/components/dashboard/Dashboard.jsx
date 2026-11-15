import React from 'react';
import {
  Calendar,
  Clock,
  Pill,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Smile,
  Activity,
  Package,
  ChevronRight,
  ShieldCheck,
  Bell,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import {
  getPatientProfile,
  getMedications,
  getDailySchedule,
  getAdherenceStats,
  getSymptoms,
  getMoodLogs,
  getAppointments,
  getCaregiverAlerts,
  recordDoseAction,
  getLocalDateString
} from '../../services/storage';

export default function Dashboard({ onNavigate, onOpenEmergency, onRefreshData }) {
  const profile = getPatientProfile();
  const todaySchedule = getDailySchedule();
  const adherence = getAdherenceStats(7);
  const symptoms = getSymptoms();
  const moods = getMoodLogs();
  const appointments = getAppointments();
  const alerts = getCaregiverAlerts();
  const meds = getMedications();

  // Next upcoming pending dose
  const pendingDoses = todaySchedule.filter((d) => d.status === 'pending');
  const nextDose = pendingDoses.length > 0 ? pendingDoses[0] : null;

  // Counts for today
  const takenCount = todaySchedule.filter((d) => d.status === 'taken').length;
  const skippedCount = todaySchedule.filter((d) => d.status === 'skipped' || d.status === 'missed').length;
  const totalToday = todaySchedule.length;

  // Stock alerts (less than or equal to 2 days supply OR below reorder threshold)
  const lowStockMeds = meds.filter((m) => {
    const daily = (m.tabletsPerDose || 1) * (m.scheduledTimes?.length || 1);
    const daysLeft = Math.floor((m.currentStock || 0) / (daily || 1));
    return daysLeft <= 2 || m.currentStock <= (m.reorderThreshold || 10);
  });

  // Recent activity feed combining recent dose logs, symptoms, and moods
  const todayMood = moods.length > 0 ? moods[0] : null;
  const recentSymptom = symptoms.length > 0 ? symptoms[0] : null;
  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  // Handler for quick one-click dose taken from dashboard
  const handleQuickTake = (dose) => {
    const dateStr = getLocalDateString();
    const res = recordDoseAction(dateStr, dose.medicationId, dose.time, 'taken');
    if (res.success) {
      if (onRefreshData) onRefreshData();
    }
  };

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Welcome Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #0D9488 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '28px 32px',
          boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ color: '#CCFBF1', fontSize: '0.85rem' }}>• Apex Senior Health Care</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
              {getGreeting()}, {profile.preferredName}! 👋
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', maxWidth: '640px' }}>
              Your vitals are steady at BP {profile.vitals.bloodPressure} and Pulse {profile.vitals.heartRate}.
              You have completed <strong style={{ color: '#2DD4BF' }}>{takenCount} of {totalToday}</strong> scheduled doses today.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onNavigate('aura')}
              className="btn"
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Sparkles size={18} color="#0D9488" />
              <span>Talk with AURA</span>
            </button>
            <button
              onClick={() => onNavigate('medications')}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600
              }}
            >
              <Pill size={18} />
              <span>Medication Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Caregiver Notifications Banner if there are unacknowledged high-priority alerts */}
      {alerts.filter((a) => !a.acknowledged && (a.severity === 'high' || a.severity === 'critical')).length > 0 && (
        <div
          style={{
            background: '#FFFBEB',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#F59E0B', color: '#FFFFFF', padding: '10px', borderRadius: '12px' }}>
              <Bell size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.98rem' }}>
                Important Caregiver Notification
              </div>
              <div style={{ color: '#B45309', fontSize: '0.88rem' }}>
                {alerts.find((a) => !a.acknowledged && (a.severity === 'high' || a.severity === 'critical'))?.message}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('caregiver')}
            className="btn btn-outline"
            style={{
              borderColor: '#D97706',
              color: '#92400E',
              background: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            Review in Caregiver Portal <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 3. Top Metrics Row: Next Dose Card & Adherence Rate Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Next Medication Dose Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: '#F0FDFA', color: '#0D9488' }}>
                  <Pill size={20} />
                </div>
                <div>
                  <h3 className="card-title">Next Scheduled Dose</h3>
                  <p className="card-subtitle">Timely medication reminder</p>
                </div>
              </div>
              <span className="badge badge-teal">Today's Schedule</span>
            </div>

            {nextDose ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                      {nextDose.medicationName}
                    </h4>
                    <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                      Dosage: {nextDose.dosage} ({nextDose.tabletsPerDose} tablet)
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0D9488', fontWeight: 800, fontSize: '1.15rem' }}>
                      <Clock size={18} />
                      <span>{nextDose.time}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{nextDose.period}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 14px' }}>
                  💡 {nextDose.instructions || 'Take with water'}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleQuickTake(nextDose)}
                    className="btn btn-primary"
                    style={{ flex: 1, minHeight: '48px', fontSize: '1rem', fontWeight: 700 }}
                  >
                    <Check size={20} />
                    <span>Mark as Taken Now</span>
                  </button>
                  <button
                    onClick={() => onNavigate('medications')}
                    className="btn btn-outline"
                    style={{ minHeight: '48px' }}
                    title="View full schedule"
                  >
                    Details
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 16px', background: '#ECFDF5', borderRadius: '12px', color: '#065F46', marginBottom: '16px' }}>
                <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>All Scheduled Doses Completed!</h4>
                <p style={{ fontSize: '0.85rem', color: '#047857' }}>
                  You have safely taken all prescribed medicines for today. Rest well!
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '12px', fontSize: '0.85rem', color: '#64748B' }}>
            <span>Today's Total: <strong>{totalToday} doses</strong></span>
            <span style={{ color: '#059669', fontWeight: 600 }}>Taken: {takenCount}</span>
            <span style={{ color: '#D97706', fontWeight: 600 }}>Pending: {pendingDoses.length}</span>
            {skippedCount > 0 && <span style={{ color: '#DC2626', fontWeight: 600 }}>Skipped / Missed: {skippedCount}</span>}
          </div>
        </div>

        {/* Medication Adherence Metric Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="card-title">Medication Adherence</h3>
                  <p className="card-subtitle">7-Day Consistency Rate</p>
                </div>
              </div>
              <span className="badge badge-green">Last 7 Days</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '14px 0 20px' }}>
              <div
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  background: `conic-gradient(#0D9488 ${adherence.overallRate * 3.6}deg, #E2E8F0 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
                }}
              >
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                    {adherence.overallRate}%
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 600 }}>ADHERENCE</span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  {adherence.overallRate >= 85 ? 'Outstanding Health Discipline!' : 'Good Effort, Keep Tracking!'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {adherence.totalTaken} of {adherence.totalScheduled} doses confirmed on time. Consistent adherence helps stabilize your blood pressure and sugar levels.
                </p>
              </div>
            </div>

            {/* Daily adherence mini-bars */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
              {adherence.trendData.slice(-7).map((day) => (
                <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <div
                    style={{
                      width: '100%',
                      height: '36px',
                      background: '#E2E8F0',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${day.adherenceRate}%`,
                        background: day.adherenceRate >= 80 ? '#0D9488' : '#F59E0B',
                        borderRadius: '4px'
                      }}
                      title={`${day.label}: ${day.adherenceRate}% adherence`}
                    />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                    {day.label.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onNavigate('medications')}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '6px 14px', minHeight: '36px' }}
            >
              Full Medication History <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Second Row: Symptoms, Emotional Well-being, and Inventory Stock Warnings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Symptoms Reported Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#FFF1F2', color: '#E11D48' }}>
                <Activity size={20} />
              </div>
              <div>
                <h3 className="card-title">Symptoms Reported</h3>
                <p className="card-subtitle">Active bodily logs</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('symptoms')}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
            >
              + Log Symptom
            </button>
          </div>

          {recentSymptom ? (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A' }}>
                  {recentSymptom.name}
                </h4>
                <span className={`badge ${recentSymptom.severity === 'Severe' ? 'badge-red' : recentSymptom.severity === 'Moderate' ? 'badge-amber' : 'badge-teal'}`}>
                  {recentSymptom.severity}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '8px' }}>
                {recentSymptom.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94A3B8' }}>
                <span>Duration: {recentSymptom.duration}</span>
                <span>{new Date(recentSymptom.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.9rem', padding: '16px 0' }}>No active symptoms logged today. Feeling well!</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Conservative emergency rules active
            </span>
            <button
              onClick={() => onNavigate('symptoms')}
              style={{ background: 'none', border: 'none', color: '#0D9488', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View all ({symptoms.length}) →
            </button>
          </div>
        </div>

        {/* Current Mood & Wellness Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <Smile size={20} />
              </div>
              <div>
                <h3 className="card-title">Emotional Well-Being</h3>
                <p className="card-subtitle">Daily mood check-in</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('wellness')}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
            >
              Check-In
            </button>
          </div>

          {todayMood ? (
            <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <div style={{ fontSize: '2rem' }}>
                  {todayMood.mood === 'Happy' ? '😊' : todayMood.mood === 'Calm' ? '🌿' : todayMood.mood === 'Okay' ? '🙂' : todayMood.mood === 'Sad' ? '😔' : todayMood.mood === 'Anxious' ? '😟' : '💜'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#581C87' }}>
                    Feeling {todayMood.mood}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#7E22CE' }}>
                    Logged today at {todayMood.time}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6B21A8', margin: '6px 0 0' }}>
                "{todayMood.note}"
              </p>
            </div>
          ) : (
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '12px' }}>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '10px' }}>
                How is your heart feeling today, Margaret?
              </p>
              <button
                onClick={() => onNavigate('wellness')}
                className="btn btn-primary"
                style={{ fontSize: '0.88rem' }}
              >
                Log Today's Mood
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              AURA companion available 24/7
            </span>
            <button
              onClick={() => onNavigate('wellness')}
              style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Mood Trends →
            </button>
          </div>
        </div>

        {/* Medicine Stock Alerts Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Package size={20} />
              </div>
              <div>
                <h3 className="card-title">Inventory Alerts</h3>
                <p className="card-subtitle">Depletion & refill reminders</p>
              </div>
            </div>
            <span className="badge badge-amber">{lowStockMeds.length} Notices</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {lowStockMeds.map((med) => {
              const daily = (med.tabletsPerDose || 1) * (med.scheduledTimes?.length || 1);
              const daysLeft = Math.floor((med.currentStock || 0) / (daily || 1));
              const isCritical = daysLeft <= 2;

              return (
                <div
                  key={med.id}
                  style={{
                    background: isCritical ? '#FEF2F2' : '#FFFBEB',
                    border: `1px solid ${isCritical ? '#FCA5A5' : '#FDE68A'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h5 style={{ fontWeight: 700, color: isCritical ? '#991B1B' : '#92400E', fontSize: '0.92rem' }}>
                      {med.name}
                    </h5>
                    <div style={{ fontSize: '0.78rem', color: isCritical ? '#B91C1C' : '#B45309' }}>
                      {med.currentStock} tablets remaining (~{daysLeft} days supply)
                    </div>
                  </div>
                  <span className={`badge ${isCritical ? 'badge-red' : 'badge-amber'}`}>
                    {isCritical ? '2-Day Refill Alert' : 'Low Stock'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Connected to medication consumption
            </span>
            <button
              onClick={() => onNavigate('inventory')}
              style={{ background: 'none', border: 'none', color: '#D97706', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Manage Inventory →
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Upcoming Appointments & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Upcoming Appointments Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="card-title">Upcoming Appointments</h3>
                <p className="card-subtitle">Doctor consultations & check-ups</p>
              </div>
            </div>
            <span className="badge badge-green">Scheduled</span>
          </div>

          {nextAppointment ? (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                    {nextAppointment.doctor}
                  </h4>
                  <span style={{ fontSize: '0.84rem', color: '#0D9488', fontWeight: 600 }}>
                    {nextAppointment.specialty}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    {nextAppointment.date}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{nextAppointment.time}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '8px' }}>
                📍 {nextAppointment.facility}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#64748B', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <strong>Purpose:</strong> {nextAppointment.purpose}
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No upcoming doctor appointments scheduled.</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onNavigate('caregiver')}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '6px 14px', minHeight: '36px' }}
            >
              All Appointments ({appointments.length}) →
            </button>
          </div>
        </div>

        {/* Quick Family & Caregiver Touchpoint Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#F1F5F9', color: '#0F172A' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="card-title">Caregiver & Family Sync</h3>
                <p className="card-subtitle">Active circle of care</p>
              </div>
            </div>
            <span className="badge badge-blue">Connected</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                  {profile.emergencyContact.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {profile.emergencyContact.relation} • Last checked dashboard at 08:40 AM
                </div>
              </div>
              <a
                href={`tel:${profile.emergencyContact.phone}`}
                className="btn btn-outline"
                style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem' }}
              >
                Call Son
              </a>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
              "Maa, saw you completed your morning walk and took your medicines on time. Looking forward to Wednesday's clinic visit!"
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => onNavigate('family')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', minHeight: '38px', flex: 1, marginRight: '10px' }}
            >
              Open Family Connect Wall
            </button>
            <button
              onClick={() => onNavigate('caregiver')}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', minHeight: '38px' }}
            >
              Caregiver Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
