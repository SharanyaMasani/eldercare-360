import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Activity,
  Heart,
  Pill,
  User,
  Plus,
  Check,
  X,
  FileText,
  PhoneCall,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  getPatientProfile,
  updatePatientProfile,
  getCaregiverAlerts,
  acknowledgeAlert,
  getDailySchedule,
  getSymptoms,
  getMedications,
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getLocalDateString
} from '../../services/storage';

export default function CaregiverPortal({ onRefreshData, onOpenEmergency }) {
  const [selectedCaregiver, setSelectedCaregiver] = useState('Rohan Sharma (Primary)');
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState(null);
  const [ackNotes, setAckNotes] = useState('');
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  const profile = getPatientProfile();
  const alerts = getCaregiverAlerts();
  const schedule = getDailySchedule();
  const symptoms = getSymptoms();
  const meds = getMedications();
  const appointments = getAppointments();

  // Vitals form
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: profile.vitals?.bloodPressure || '126/80 mmHg',
    bpStatus: 'Optimal',
    heartRate: profile.vitals?.heartRate || '72 bpm',
    bloodGlucose: profile.vitals?.bloodGlucose || '116 mg/dL',
    glucoseStatus: 'Fasting Normal',
    oxygenSaturation: profile.vitals?.oxygenSaturation || '98%',
    temperature: profile.vitals?.temperature || '98.4°F'
  });

  // Appointment Form
  const [aptForm, setAptForm] = useState({
    doctor: '',
    specialty: 'Geriatric Medicine',
    facility: '',
    date: getLocalDateString(),
    time: '10:00 AM',
    purpose: '',
    accompaniedBy: 'Rohan Sharma (Son)',
    notes: ''
  });

  const handleAcknowledge = (alertId) => {
    acknowledgeAlert(alertId, selectedCaregiver, ackNotes || 'Verified and reviewed by caregiver');
    setAcknowledgingAlertId(null);
    setAckNotes('');
    if (onRefreshData) onRefreshData();
  };

  const handleSaveVitals = (e) => {
    e.preventDefault();
    updatePatientProfile({
      vitals: {
        ...vitalsForm,
        lastRecorded: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }
    });
    setIsVitalsModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const resetAppointmentForm = () => {
    setAptForm({
      doctor: '', specialty: 'Geriatric Medicine', facility: '',
      date: getLocalDateString(), time: '10:00 AM',
      purpose: '', accompaniedBy: 'Rohan Sharma (Son)', notes: ''
    });
    setEditingAppointmentId(null);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!aptForm.doctor.trim() || !aptForm.facility.trim()) {
      alert('Please fill in doctor and facility details.');
      return;
    }
    if (editingAppointmentId) updateAppointment(editingAppointmentId, aptForm);
    else addAppointment(aptForm);
    setIsAptModalOpen(false);
    resetAppointmentForm();
    if (onRefreshData) onRefreshData();
  };

  const handleEditAppointment = (apt) => {
    setAptForm({
      doctor: apt.doctor || '', specialty: apt.specialty || 'Geriatric Medicine',
      facility: apt.facility || '', date: apt.date || '', time: apt.time || '10:00 AM',
      purpose: apt.purpose || '', accompaniedBy: apt.accompaniedBy || '', notes: apt.notes || ''
    });
    setEditingAppointmentId(apt.id);
    setIsAptModalOpen(true);
  };

  const handleDeleteAppointment = (aptId) => {
    if (!window.confirm('Delete this appointment?')) return;
    deleteAppointment(aptId);
    if (onRefreshData) onRefreshData();
  };

  // Unconfirmed / Pending / Skipped doses
  const pendingOrSkippedDoses = schedule.filter((d) => d.status !== 'taken');
  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Caregiver Portal Hero & Identity Switcher */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0D9488, #0F766E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <ShieldCheck size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Caregiver Monitoring Console
              </h2>
              <span className="badge badge-teal" style={{ background: 'rgba(45, 212, 191, 0.2)', color: '#2DD4BF' }}>
                LIVE OVERSIGHT
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#CBD5E1', margin: '2px 0 0' }}>
              Monitoring: <strong>{profile.name} (Age {profile.age})</strong> • Gurugram, India
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>Active Caregiver Identity</span>
            <select
              value={selectedCaregiver}
              onChange={(e) => setSelectedCaregiver(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.85rem'
              }}
            >
              <option value="Rohan Sharma (Primary Caregiver)" style={{ background: '#0F172A', color: '#FFF' }}>
                Rohan Sharma (Son)
              </option>
              <option value="Sister Mary Joseph (Visiting Nurse)" style={{ background: '#0F172A', color: '#FFF' }}>
                Sister Mary Joseph (Visiting Nurse)
              </option>
              <option value="Dr. Anita Rao (Attending Doctor)" style={{ background: '#0F172A', color: '#FFF' }}>
                Dr. Anita Rao (Physician)
              </option>
            </select>
          </div>

          <button
            onClick={() => onOpenEmergency()}
            className="btn btn-danger"
            style={{ fontSize: '0.85rem', padding: '8px 14px', minHeight: '38px' }}
          >
            Emergency SOS Panel
          </button>
        </div>
      </div>

      {/* Patient Vitals Telemetry Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-title-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
              <Heart size={20} />
            </div>
            <div>
              <h3 className="card-title">Senior Vitals Telemetry</h3>
              <p className="card-subtitle">Last recorded: {profile.vitals?.lastRecorded || 'Today'}</p>
            </div>
          </div>
          <button onClick={() => setIsVitalsModalOpen(true)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '6px 14px', minHeight: '34px' }}>
            + Update Vitals
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Blood Pressure</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
              {profile.vitals?.bloodPressure}
            </div>
            <span className="badge badge-green">{profile.vitals?.bpStatus || 'Normal Target'}</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Heart Rate / Pulse</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
              {profile.vitals?.heartRate}
            </div>
            <span className="badge badge-teal">Resting Steady</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Blood Glucose</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
              {profile.vitals?.bloodGlucose}
            </div>
            <span className="badge badge-green">{profile.vitals?.glucoseStatus || 'Fasting Normal'}</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Oxygen Saturation (SpO2)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
              {profile.vitals?.oxygenSaturation}
            </div>
            <span className="badge badge-blue">Optimal</span>
          </div>
        </div>
      </div>

      {/* High-Priority Caregiver Alerts Requiring Acknowledgement */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-title-icon" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 className="card-title">Caregiver Escalation & Safety Alerts</h3>
              <p className="card-subtitle">
                Alerts generated by 2-day depletion, severe symptoms, or crisis events.
              </p>
            </div>
          </div>
          <span className={`badge ${unreadAlerts.length > 0 ? 'badge-red' : 'badge-green'}`}>
            {unreadAlerts.length} Action Required
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isHigh = alert.severity === 'high';

            return (
              <div
                key={alert.id}
                style={{
                  background: alert.acknowledged ? '#F8FAFC' : isCritical ? '#FEF2F2' : isHigh ? '#FFFBEB' : '#F0FDFA',
                  border: `1px solid ${alert.acknowledged ? '#E2E8F0' : isCritical ? '#F87171' : isHigh ? '#FCD34D' : '#99F6E4'}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: alert.acknowledged ? '#64748B' : isCritical ? '#DC2626' : '#D97706' }}>
                      {alert.acknowledged ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {alert.title}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Logged: {alert.time} • Action: <strong>{alert.actionRequired || 'Check on senior'}</strong>
                      </span>
                    </div>
                  </div>

                  <span className={`badge ${alert.acknowledged ? 'badge-green' : isCritical ? 'badge-red' : 'badge-amber'}`}>
                    {alert.acknowledged ? 'Acknowledged' : 'Pending Caregiver Review'}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, paddingLeft: '30px' }}>
                  {alert.message}
                </p>

                {alert.acknowledged ? (
                  <div style={{ paddingLeft: '30px', fontSize: '0.78rem', color: '#0D9488', fontWeight: 600 }}>
                    ✓ {alert.acknowledgedAt}
                    {alert.caregiverNotes && ` — Note: "${alert.caregiverNotes}"`}
                  </div>
                ) : (
                  <div style={{ paddingLeft: '30px', paddingTop: '6px' }}>
                    {acknowledgingAlertId === alert.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                          Add Caregiver Review Notes:
                        </label>
                        <input
                          type="text"
                          value={ackNotes}
                          onChange={(e) => setAckNotes(e.target.value)}
                          placeholder="e.g., Called Margaret at 14:10, verified resting and stable."
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', minHeight: '34px', fontSize: '0.82rem' }}
                          >
                            Confirm Acknowledgment
                          </button>
                          <button
                            onClick={() => setAcknowledgingAlertId(null)}
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', minHeight: '34px', fontSize: '0.82rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAcknowledgingAlertId(alert.id);
                          setAckNotes('');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 16px', minHeight: '36px', fontSize: '0.82rem' }}
                      >
                        <Check size={16} /> Acknowledge Alert as {selectedCaregiver.split(' ')[0]}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed / Unconfirmed Doses & Doctor Appointments Dual Column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Unconfirmed / Missed Doses */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 className="card-title">Pending, Skipped & Missed Doses</h3>
                <p className="card-subtitle">Today's doses awaiting confirmation</p>
              </div>
            </div>
            <span className="badge badge-amber">{pendingOrSkippedDoses.length} Items</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingOrSkippedDoses.length > 0 ? (
              pendingOrSkippedDoses.map((dose) => (
                <div
                  key={dose.id}
                  style={{
                    background: dose.status === 'skipped' || dose.status === 'missed' ? '#FEF2F2' : '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h5 style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem', margin: 0 }}>
                      {dose.medicationName} ({dose.dosage})
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Scheduled for <strong>{dose.time}</strong> ({dose.period})
                      {dose.skipReason && ` • Reason: ${dose.skipReason}`}
                    </span>
                  </div>
                  <span className={`badge ${dose.status === 'skipped' || dose.status === 'missed' ? 'badge-red' : 'badge-amber'}`}>
                    {dose.status === 'missed' ? 'Missed' : dose.status === 'skipped' ? 'Skipped' : 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#059669', fontSize: '0.88rem', padding: '12px 0' }}>
                ✓ All scheduled doses for today have been taken on time.
              </p>
            )}
          </div>
        </div>

        {/* Doctor Consultations & Appointments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="card-title">Doctor Consultations</h3>
                <p className="card-subtitle">Upcoming medical appointments</p>
              </div>
            </div>
            <button
              onClick={() => { resetAppointmentForm(); setIsAptModalOpen(true); }}
              className="btn btn-primary"
              style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.82rem' }}
            >
              + Schedule Visit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {appointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{apt.doctor}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 600 }}>{apt.specialty}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{apt.date}</div>
                    <span style={{ fontSize: '0.76rem', color: '#64748B' }}>{apt.time}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  📍 {apt.facility} • Accompanied by: {apt.accompaniedBy}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', background: '#FFFFFF', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  {apt.purpose}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button type="button" className="btn btn-primary" onClick={() => handleEditAppointment(apt)} style={{ padding: '6px 11px', fontSize: '0.78rem' }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button type="button" onClick={() => handleDeleteAppointment(apt.id)} style={{ padding: '6px 11px', fontSize: '0.78rem', border: '1px solid #FECACA', borderRadius: '8px', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: UPDATE VITALS */}
      {isVitalsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Record Daily Senior Vitals</h3>
              <button onClick={() => setIsVitalsModalOpen(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleSaveVitals}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    required
                    value={vitalsForm.bloodPressure}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                    className="form-input"
                    placeholder="e.g., 126/80 mmHg"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="text"
                      required
                      value={vitalsForm.heartRate}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 72 bpm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Glucose</label>
                    <input
                      type="text"
                      required
                      value={vitalsForm.bloodGlucose}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bloodGlucose: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 116 mg/dL"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Oxygen Saturation (%)</label>
                    <input
                      type="text"
                      required
                      value={vitalsForm.oxygenSaturation}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, oxygenSaturation: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 98%"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Temperature</label>
                    <input
                      type="text"
                      required
                      value={vitalsForm.temperature}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 98.4°F"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsVitalsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD APPOINTMENT */}
      {isAptModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingAppointmentId ? 'Edit Doctor Consultation' : 'Schedule Doctor Consultation'}</h3>
              <button onClick={() => { setIsAptModalOpen(false); resetAppointmentForm(); }} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleCreateAppointment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={aptForm.doctor}
                    onChange={(e) => setAptForm({ ...aptForm, doctor: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Dr. Anita Rao, MD"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Specialty</label>
                    <input
                      type="text"
                      value={aptForm.specialty}
                      onChange={(e) => setAptForm({ ...aptForm, specialty: e.target.value })}
                      className="form-input"
                      placeholder="e.g., Geriatrics"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital / Clinic *</label>
                    <input
                      type="text"
                      required
                      value={aptForm.facility}
                      onChange={(e) => setAptForm({ ...aptForm, facility: e.target.value })}
                      className="form-input"
                      placeholder="e.g., Apex Senior Clinic"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={aptForm.date}
                      onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="text"
                      required
                      value={aptForm.time}
                      onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 10:30 AM"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose / Clinical Note</label>
                  <input
                    type="text"
                    value={aptForm.purpose}
                    onChange={(e) => setAptForm({ ...aptForm, purpose: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Quarterly BP review & fasting blood test"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setIsAptModalOpen(false); resetAppointmentForm(); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingAppointmentId ? 'Save Changes' : 'Schedule Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
