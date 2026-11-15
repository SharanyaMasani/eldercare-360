import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, Heart, Building, CheckCircle, BellRing } from 'lucide-react';
import { getPatientProfile, addCaregiverAlert } from '../../services/storage';

export default function EmergencyModal({ isOpen, onClose, symptomTrigger = null }) {
  const [sosSent, setSosSent] = useState(false);
  const profile = getPatientProfile();

  if (!isOpen) return null;

  const handleSendCaregiverSos = () => {
    addCaregiverAlert({
      type: 'manual_sos',
      severity: 'critical',
      title: 'CRITICAL: Manual SOS Alert Triggered',
      message: `Margaret Sharma pressed the Emergency SOS button at ${new Date().toLocaleTimeString()}. ${symptomTrigger ? `Triggered with concern: ${symptomTrigger.title || symptomTrigger.reason}` : 'Immediate caregiver check-in requested.'}`,
      actionRequired: 'Reach out to Margaret or dispatch emergency services immediately.',
      acknowledged: false,
      relatedId: 'manual-sos'
    });
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '640px', border: '3px solid #DC2626' }}>
        {/* Urgent Header */}
        <div style={{ background: '#DC2626', color: '#FFFFFF', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#FFFFFF', color: '#DC2626', padding: '8px', borderRadius: '50%' }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 800 }}>
                {symptomTrigger ? 'URGENT HEALTH SAFETY ALERT' : 'EMERGENCY SOS & CONTACTS'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#FEE2E2' }}>
                Quick emergency response assistance for {profile.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFFFFF', cursor: 'pointer', borderRadius: '50%', padding: '6px' }}
            aria-label="Close emergency modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* If triggered by symptom evaluation */}
          {symptomTrigger && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#991B1B', fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                    {symptomTrigger.trigger?.title || 'Potentially Serious Symptom Detected'}
                  </h4>
                  <p style={{ color: '#7F1D1D', fontSize: '0.9rem', marginBottom: '8px' }}>
                    {symptomTrigger.trigger?.advice || symptomTrigger.reason}
                  </p>
                  <span style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: 600 }}>
                    Rule: {symptomTrigger.reason}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Immediate Call Banner (India 112) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <a
              href="tel:112"
              style={{
                textDecoration: 'none',
                background: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                transition: 'transform 0.15s ease'
              }}
            >
              <PhoneCall size={28} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FEE2E2', fontWeight: 700 }}>
                  National Emergency (India)
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>DIAL 112</div>
                <span style={{ fontSize: '0.75rem', color: '#FEE2E2' }}>Police / Fire / Ambulance</span>
              </div>
            </a>

            <a
              href="tel:108"
              style={{
                textDecoration: 'none',
                background: '#B91C1C',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Heart size={28} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FEE2E2', fontWeight: 700 }}>
                  Emergency Ambulance
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>DIAL 108</div>
                <span style={{ fontSize: '0.75rem', color: '#FEE2E2' }}>Direct Medical Dispatch</span>
              </div>
            </a>
          </div>

          {/* Quick SOS Trigger to Caregiver */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  Caregiver Fast-Alert Escalation
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Sends an immediate high-priority alert to {profile.emergencyContact.name} ({profile.emergencyContact.relation}).
                </p>
              </div>
              <button
                onClick={handleSendCaregiverSos}
                className="btn btn-danger"
                style={{ minHeight: '44px', whiteSpace: 'nowrap', padding: '10px 18px' }}
              >
                {sosSent ? (
                  <>
                    <CheckCircle size={18} /> Alert Dispatched!
                  </>
                ) : (
                  <>
                    <BellRing size={18} /> Alert Caregiver
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Key Emergency Contacts List */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Assigned Personal Contacts
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{profile.emergencyContact.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{profile.emergencyContact.relation}</div>
              </div>
              <a
                href={`tel:${profile.emergencyContact.phone}`}
                className="btn btn-outline"
                style={{ padding: '6px 14px', minHeight: '36px', fontSize: '0.85rem' }}
              >
                <PhoneCall size={16} /> {profile.emergencyContact.phone}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{profile.primaryDoctor.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{profile.primaryDoctor.specialty} • {profile.primaryDoctor.clinic}</div>
              </div>
              <a
                href={`tel:${profile.primaryDoctor.phone}`}
                className="btn btn-outline"
                style={{ padding: '6px 14px', minHeight: '36px', fontSize: '0.85rem' }}
              >
                <PhoneCall size={16} /> {profile.primaryDoctor.phone}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>Tele-MANAS Mental Health Support</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Govt of India 24/7 Free Confidential Psychological Help</div>
              </div>
              <a
                href="tel:14416"
                className="btn btn-outline"
                style={{ padding: '6px 14px', minHeight: '36px', fontSize: '0.85rem', color: '#0D9488', borderColor: '#0D9488' }}
              >
                <PhoneCall size={16} /> 14416
              </a>
            </div>
          </div>

          {/* Conservative Medical Safety Notice */}
          <div style={{ marginTop: '20px', padding: '10px 14px', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
            <strong>Transparent Safety Notice:</strong> ElderCare 360 is a supportive wellness ecosystem and does not provide clinical diagnoses or medical treatment advice. In any acute or life-threatening situation, please seek emergency hospital medical care immediately.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
