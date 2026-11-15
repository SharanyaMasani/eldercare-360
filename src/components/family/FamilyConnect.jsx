import React, { useState } from 'react';
import {
  Heart,
  HeartHandshake,
  MessageSquare,
  Send,
  PhoneCall,
  Calendar,
  Sparkles,
  Smile,
  ShieldCheck,
  CheckCircle,
  Clock,
  User,
  ThumbsUp
} from 'lucide-react';
import {
  getPatientProfile,
  getFamilyMessages,
  addFamilyMessage,
  likeFamilyMessage,
  getAdherenceStats,
  getDailySchedule,
  getMoodLogs,
  getAppointments
} from '../../services/storage';

export default function FamilyConnect({ onRefreshData }) {
  const [newMsgText, setNewMsgText] = useState('');
  const [authorName, setAuthorName] = useState('Rohan Sharma (Son)');

  const profile = getPatientProfile();
  const messages = getFamilyMessages();
  const adherence = getAdherenceStats(7);
  const schedule = getDailySchedule();
  const moods = getMoodLogs();
  const appointments = getAppointments();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    let avatar = '👨‍💼';
    let relation = 'Family Member';
    if (authorName.includes('Kabir')) {
      avatar = '👦';
      relation = 'Grandson';
    } else if (authorName.includes('Priya')) {
      avatar = '👩‍🏫';
      relation = 'Daughter-in-law';
    } else if (authorName.includes('Rohan')) {
      avatar = '👨‍💼';
      relation = 'Son';
    }

    addFamilyMessage({
      author: authorName,
      relation,
      avatar,
      content: newMsgText.trim()
    });

    setNewMsgText('');
    if (onRefreshData) onRefreshData();
  };

  const handleLike = (id) => {
    likeFamilyMessage(id);
    if (onRefreshData) onRefreshData();
  };

  // Generate automated daily plain-English care digest
  const takenCount = schedule.filter((s) => s.status === 'taken').length;
  const totalCount = schedule.length;
  const todayMood = moods.length > 0 ? moods[0] : null;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Hero Family Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0D9488 100%)',
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
              background: '#FFFFFF',
              color: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <HeartHandshake size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Family Circle & Daily Care Digest
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#CCFBF1', margin: '2px 0 0' }}>
              Keeping loved ones informed, reassured, and emotionally connected with {profile.preferredName}.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`tel:${profile.emergencyContact.phone}`}
            className="btn"
            style={{ background: '#FFFFFF', color: '#0F172A', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <PhoneCall size={16} color="#0D9488" /> Call {profile.preferredName}
          </a>
        </div>
      </div>

      {/* Automated Daily Care Digest Card */}
      <div className="card" style={{ background: '#F0FDFA', border: '2px solid #99F6E4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Sparkles size={20} color="#0D9488" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F766E', margin: 0 }}>
            Automated Daily Care Summary (Generated for Family)
          </h3>
          <span className="badge badge-teal" style={{ marginLeft: 'auto' }}>
            Today's Digest
          </span>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#115E59', lineHeight: 1.6, margin: '0 0 14px' }}>
          <strong>Today's Status:</strong> {profile.preferredName} has taken <strong>{takenCount} of {totalCount}</strong> scheduled medication doses on time.
          Vitals are steady (Blood Pressure: <strong>{profile.vitals?.bloodPressure}</strong>, Pulse: <strong>{profile.vitals?.heartRate}</strong>).
          Emotional check-in was logged as <strong style={{ textTransform: 'capitalize' }}>{todayMood ? todayMood.mood : 'Calm'}</strong>
          {todayMood?.note ? ` ("${todayMood.note}")` : ''}.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #CCFBF1' }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748B', textTransform: 'uppercase' }}>7-Day Medication Consistency</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D9488' }}>
              {adherence.overallRate}% Adherence
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748B', textTransform: 'uppercase' }}>Next Doctor Consultation</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
              {appointments[0]?.doctor?.split(',')[0]}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{appointments[0]?.date} at {appointments[0]?.time}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748B', textTransform: 'uppercase' }}>Primary Escort</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
              {appointments[0]?.accompaniedBy}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Family Cheer Wall & Caregiver Contacts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {/* Family Cheer Wall */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#FFF1F2', color: '#E11D48' }}>
                <Heart size={20} />
              </div>
              <div>
                <h3 className="card-title">Family Cheer Wall & Notes</h3>
                <p className="card-subtitle">Encouraging notes and photos from loved ones</p>
              </div>
            </div>
            <span className="badge badge-teal">{messages.length} Notes</span>
          </div>

          {/* New Cheer Note Form */}
          <form onSubmit={handleSendMessage} style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.84rem' }}
              >
                <option value="Rohan Sharma (Son)">Rohan Sharma (Son)</option>
                <option value="Kabir Sharma (Grandson)">Kabir Sharma (Grandson)</option>
                <option value="Priya Sharma (Daughter-in-law)">Priya Sharma (Daughter-in-law)</option>
                <option value="Meera Sharma (Daughter)">Meera Sharma (Daughter)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Write a warm note or update for Margaret..."
                className="form-input"
                style={{ fontSize: '0.9rem', flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 18px', minHeight: '44px' }}>
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Message Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>
                  {msg.avatar || '❤️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{msg.author}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px' }}>({msg.relation})</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{msg.time}</span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0 10px', lineHeight: 1.5 }}>
                    {msg.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleLike(msg.id)}
                      style={{
                        background: '#FFF1F2',
                        border: '1px solid #FECDD3',
                        color: '#E11D48',
                        borderRadius: '16px',
                        padding: '3px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Heart size={13} fill="#E11D48" /> {msg.likes || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caregiver & Physician Contact Cards */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon" style={{ background: '#F0FDFA', color: '#0D9488' }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <h3 className="card-title">Caregiver & Emergency Circle</h3>
                <p className="card-subtitle">One-touch contacts for Margaret</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Primary Caregiver */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {profile.emergencyContact.name}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#0D9488', fontWeight: 700 }}>
                    {profile.emergencyContact.relation}
                  </span>
                </div>
                <span className="badge badge-green">Primary</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 12px' }}>
                Lives 10 mins away. Receives all urgent stock & emergency notifications.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`tel:${profile.emergencyContact.phone}`}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '8px 12px', minHeight: '38px', fontSize: '0.84rem' }}
                >
                  <PhoneCall size={15} /> Call ({profile.emergencyContact.phone})
                </a>
              </div>
            </div>

            {/* Attending Geriatrician */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {profile.primaryDoctor.name}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 700 }}>
                    {profile.primaryDoctor.specialty}
                  </span>
                </div>
                <span className="badge badge-blue">Physician</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 12px' }}>
                {profile.primaryDoctor.clinic}
              </p>
              <a
                href={`tel:${profile.primaryDoctor.phone}`}
                className="btn btn-outline"
                style={{ width: '100%', padding: '8px 12px', minHeight: '38px', fontSize: '0.84rem' }}
              >
                <PhoneCall size={15} /> Call Clinic ({profile.primaryDoctor.phone})
              </a>
            </div>

            {/* Visiting Home Nurse */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {profile.secondaryCaregiver.name}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#7C3AED', fontWeight: 700 }}>
                    {profile.secondaryCaregiver.relation}
                  </span>
                </div>
                <span className="badge badge-teal">Home Care</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 12px' }}>
                Schedule: {profile.secondaryCaregiver.schedule}
              </p>
              <a
                href={`tel:${profile.secondaryCaregiver.phone}`}
                className="btn btn-outline"
                style={{ width: '100%', padding: '8px 12px', minHeight: '38px', fontSize: '0.84rem' }}
              >
                <PhoneCall size={15} /> Call Nurse ({profile.secondaryCaregiver.phone})
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
