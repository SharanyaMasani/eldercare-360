import React, { useState } from 'react';
import {
  Smile,
  Heart,
  TrendingUp,
  MessageCircle,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  getMoodLogs,
  addMoodLog
} from '../../services/storage';

export default function EmotionalWellness({ onNavigate, onRefreshData }) {
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [moodDescription, setMoodDescription] = useState('');
  const [savedToday, setSavedToday] = useState(false);

  const moods = getMoodLogs();

  const MOOD_OPTIONS = [
    { name: 'Happy', emoji: '😊', score: 7, color: '#059669', bg: '#ECFDF5', desc: 'Joyful, uplifted, energetic' },
    { name: 'Calm', emoji: '🌿', score: 6, color: '#0D9488', bg: '#F0FDFA', desc: 'Peaceful, content, relaxed' },
    { name: 'Okay', emoji: '🙂', score: 5, color: '#0284C7', bg: '#F0F9FF', desc: 'Balanced, ordinary, fine' },
    { name: 'Sad', emoji: '😔', score: 4, color: '#D97706', bg: '#FFFBEB', desc: 'Downcast, gloomy, low spirit' },
    { name: 'Anxious', emoji: '😟', score: 3, color: '#EA580C', bg: '#FFF7ED', desc: 'Worried, restless, tense' },
    { name: 'Lonely', emoji: '💜', score: 2, color: '#7C3AED', bg: '#F5F3FF', desc: 'Isolated, missing companions' },
    { name: 'Very distressed', emoji: '💔', score: 1, color: '#DC2626', bg: '#FEF2F2', desc: 'Overwhelmed, deeply upset' }
  ];

  const handleCheckIn = (e) => {
    e.preventDefault();
    const moodMeta = MOOD_OPTIONS.find((m) => m.name === selectedMood) || MOOD_OPTIONS[1];

    addMoodLog({
      mood: selectedMood,
      score: moodMeta.score,
      note: moodDescription || `Feeling ${selectedMood} today.`
    });

    setSavedToday(true);
    setMoodDescription('');
    if (onRefreshData) onRefreshData();
    setTimeout(() => setSavedToday(false), 4000);
  };

  // Check for repeated concerning moods (Sad, Anxious, Lonely, Very distressed)
  const concerningMoods = ['Sad', 'Anxious', 'Lonely', 'Very distressed'];
  const recentThree = moods.slice(0, 3);
  const concerningCount = recentThree.filter((m) => concerningMoods.includes(m.mood)).length;
  const showSupportiveNotice = concerningCount >= 2;

  // Chart Data preparation: Chronological order for line chart
  const trendData = [...moods].reverse().map((m) => ({
    date: m.date.slice(5),
    mood: m.mood,
    score: m.score,
    note: m.note
  }));

  // Distribution Data for Bar Chart
  const distributionData = MOOD_OPTIONS.map((opt) => {
    const count = moods.filter((m) => m.mood === opt.name).length;
    return {
      name: opt.name,
      count,
      color: opt.color
    };
  });

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Supportive Notice if repeated low mood detected */}
      {showSupportiveNotice && (
        <div style={{ background: '#FAF5FF', border: '2px solid #C084FC', borderRadius: '16px', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#7C3AED', color: '#FFFFFF', padding: '10px', borderRadius: '12px' }}>
              <Heart size={24} />
            </div>
            <div>
              <h4 style={{ color: '#581C87', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px' }}>
                We're Thinking of You, Margaret 💜
              </h4>
              <p style={{ color: '#6B21A8', fontSize: '0.88rem', margin: 0 }}>
                We noticed you have reported feeling down or anxious recently. It can be comforting to talk to someone who cares.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigate('aura')}
              className="btn btn-primary"
              style={{ background: '#7C3AED', borderColor: '#7C3AED', fontSize: '0.9rem' }}
            >
              <Sparkles size={16} /> Chat with AURA
            </button>
            <button
              onClick={() => onNavigate('family')}
              className="btn btn-outline"
              style={{ borderColor: '#A855F7', color: '#6B21A8', fontSize: '0.9rem' }}
            >
              Family Messages
            </button>
          </div>
        </div>
      )}

      {/* Main Check-In Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Daily Emotional Check-In</h3>
            <p className="card-subtitle">
              How are you feeling right now? Taking a moment for self-reflection supports holistic well-being.
            </p>
          </div>
          {savedToday && (
            <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <CheckCircle2 size={16} /> Check-In Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleCheckIn}>
          {/* 7 Expressive Mood Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = selectedMood === opt.name;
              return (
                <button
                  type="button"
                  key={opt.name}
                  onClick={() => setSelectedMood(opt.name)}
                  style={{
                    background: isSelected ? opt.bg : '#FFFFFF',
                    border: `2px solid ${isSelected ? opt.color : '#CBD5E1'}`,
                    borderRadius: '14px',
                    padding: '16px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 4px 12px ${opt.color}25` : 'none'
                  }}
                >
                  <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{opt.emoji}</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isSelected ? opt.color : '#1E293B' }}>
                    {opt.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'center', lineHeight: 1.2 }}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="form-group">
            <label className="form-label">
              What is bringing you this feeling today? (Optional journal note)
            </label>
            <textarea
              rows={2}
              value={moodDescription}
              onChange={(e) => setMoodDescription(e.target.value)}
              className="form-textarea"
              placeholder="e.g., Had a lovely morning tea on the balcony, but felt a bit lonely in the afternoon..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Records are saved locally to your personal care diary.
            </span>
            <button type="submit" className="btn btn-primary" style={{ minHeight: '48px', padding: '12px 28px', fontSize: '1rem', fontWeight: 700 }}>
              Save Today's Check-In
            </button>
          </div>
        </form>
      </div>

      {/* Mood Trends & Analytics Visualizer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Trend Line Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Emotional Trajectory (Recent Days)</h3>
              <p className="card-subtitle">Score from 1 (Distressed) to 7 (Happy)</p>
            </div>
            <span className="badge badge-teal">History</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                <YAxis domain={[1, 7]} ticks={[1, 3, 5, 7]} stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '0.85rem' }}
                  formatter={(val, name, item) => [`${item.payload.mood} (Score: ${val}/7)`, 'Mood']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Mood Distribution Summary</h3>
              <p className="card-subtitle">Frequency of logged emotions</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} interval={0} angle={-25} textAnchor="end" height={45} />
                <YAxis allowDecimals={false} stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '0.85rem' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mood History Log Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Emotional History Log</h3>
            <p className="card-subtitle">Past journal notes and check-ins</p>
          </div>
          <span className="badge badge-teal">{moods.length} Check-ins</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {moods.map((log) => {
            const meta = MOOD_OPTIONS.find((m) => m.name === log.mood) || MOOD_OPTIONS[1];
            return (
              <div
                key={log.id}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '1.8rem' }}>{meta.emoji}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{log.mood}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>({log.date} at {log.time})</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '2px 0 0' }}>
                      "{log.note}"
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    background: meta.bg,
                    color: meta.color,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: `1px solid ${meta.color}40`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Score {log.score}/7
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Diagnostic Clinical Transparency Box */}
      <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Info size={20} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
          <strong>Clinical Disclaimer:</strong> Emotional wellness tracking in ElderCare 360 is intended for personal emotional self-awareness, mood reflection, and caregiver communication. It does not provide clinical psychiatric diagnoses, depression assessments, or medical evaluations. If you or a loved one are experiencing persistent distress, please seek support from a healthcare professional or contact Tele-MANAS (14416).
        </div>
      </div>
    </div>
  );
}
