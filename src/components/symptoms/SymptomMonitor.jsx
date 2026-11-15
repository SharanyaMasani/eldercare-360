import { useState } from 'react';
import {
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  Info,
  Search
} from 'lucide-react';
import {
  getSymptoms,
  addSymptom
} from '../../services/storage';
import { evaluateSymptomSafety } from '../../services/emergencyRules';

export default function SymptomMonitor({ onOpenEmergency, onRefreshData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('all');

  // Add Symptom Form State
  const PRESET_SYMPTOMS = [
    'Knee / Joint Stiffness',
    'Dizziness / Lightheadedness',
    'Fatigue / Low Energy',
    'Mild Headache',
    'Nausea / Stomach Upset',
    'Shortness of Breath',
    'Chest Pain / Discomfort',
    'Ankle / Leg Swelling',
    'Hand Tremor / Shakiness',
    'Sleep Disturbance / Insomnia'
  ];

  const defaultForm = {
    selectedPreset: '',
    customName: '',
    severity: 'Mild', // 'Mild' | 'Moderate' | 'Severe'
    duration: 'About 1 hour',
    onsetDate: new Date().toISOString().slice(0, 16),
    description: ''
  };

  const [formData, setFormData] = useState(defaultForm);

  const symptoms = getSymptoms();

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handlePresetClick = (preset) => {
    setFormData({
      ...formData,
      selectedPreset: preset,
      customName: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = formData.selectedPreset === 'Other (Custom)' || !formData.selectedPreset
      ? formData.customName.trim()
      : formData.selectedPreset;

    if (!finalName) {
      alert('Please select or specify a symptom name.');
      return;
    }

    // 1. Conservative Emergency Safety Rule Check (100% Local, no API needed)
    const safetyCheck = evaluateSymptomSafety(finalName, formData.description, formData.severity);

    // Save symptom to persistent local storage
    addSymptom({
      name: finalName,
      severity: formData.severity,
      duration: formData.duration,
      onsetDate: formData.onsetDate,
      description: formData.description,
      flaggedForCaregiver: formData.severity === 'Moderate' || formData.severity === 'Severe' || !!safetyCheck,
      safetyFlag: safetyCheck ? safetyCheck.reason : null
    });

    setIsModalOpen(false);
    if (onRefreshData) onRefreshData();

    // If conservative safety rule triggered, surface emergency modal immediately!
    if (safetyCheck) {
      onOpenEmergency(safetyCheck);
    }
  };

  // Filter symptoms
  const filteredSymptoms = symptoms.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverityFilter === 'all' || s.severity.toLowerCase() === selectedSeverityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Senior Symptom & Health Logger
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
            Proactive tracking with conservative, transparent safety warnings.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ minHeight: '46px', fontSize: '0.95rem' }}>
          <Plus size={18} /> Record New Symptom
        </button>
      </div>

      {/* Conservative Clinical Transparency Disclaimer Banner */}
      <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Info size={20} color="#0D9488" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
          <strong>Clinical Transparency Notice:</strong> ElderCare 360 uses local, conservative safety rules to detect potentially serious symptoms (such as chest pain or sudden difficulty breathing) and promptly suggest emergency services. It does not provide medical diagnoses or replace direct consultation with a qualified physician.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', padding: '6px 12px', borderRadius: '10px', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Search symptoms or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0F172A' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter Severity:</span>
          {['all', 'mild', 'moderate', 'severe'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverityFilter(sev)}
              className="btn"
              style={{
                padding: '4px 12px',
                minHeight: '32px',
                fontSize: '0.8rem',
                textTransform: 'capitalize',
                background: selectedSeverityFilter === sev ? '#0D9488' : '#F1F5F9',
                color: selectedSeverityFilter === sev ? '#FFFFFF' : '#334155'
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Symptom History List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredSymptoms.map((sym) => {
          const isSevere = sym.severity === 'Severe';
          const isModerate = sym.severity === 'Moderate';

          return (
            <div
              key={sym.id}
              className="card"
              style={{
                borderLeft: `5px solid ${isSevere ? '#DC2626' : isModerate ? '#D97706' : '#0D9488'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {sym.name}
                  </h4>
                  <span className={`badge ${isSevere ? 'badge-red' : isModerate ? 'badge-amber' : 'badge-teal'}`}>
                    {sym.severity} Severity
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0 12px' }}>
                  {sym.description || 'No additional description entered.'}
                </p>

                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#0D9488" />
                    <span>Duration: <strong>{sym.duration || 'Not noted'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#0D9488" />
                    <span>Onset: <strong>{new Date(sym.onsetDate || sym.loggedAt).toLocaleString()}</strong></span>
                  </div>
                </div>

                {sym.caregiverNote && (
                  <div style={{ marginTop: '10px', background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '8px 10px', fontSize: '0.78rem', color: '#0F766E' }}>
                    <strong>Caregiver Note:</strong> {sym.caregiverNote}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Logged {new Date(sym.loggedAt).toLocaleDateString()}
                </span>
                {sym.flaggedForCaregiver && (
                  <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> Caregiver Alerted
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD SYMPTOM */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3>Log a Symptom or Bodily Discomfort</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn" aria-label="Close modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Popular Presets */}
                <div>
                  <label className="form-label">Select Common Symptom or Type Custom Below</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {PRESET_SYMPTOMS.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => handlePresetClick(preset)}
                        className="btn"
                        style={{
                          padding: '6px 12px',
                          minHeight: '34px',
                          fontSize: '0.82rem',
                          background: formData.selectedPreset === preset ? '#0D9488' : '#F1F5F9',
                          color: formData.selectedPreset === preset ? '#FFFFFF' : '#334155',
                          borderRadius: '20px'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handlePresetClick('Other (Custom)')}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        minHeight: '34px',
                        fontSize: '0.82rem',
                        background: formData.selectedPreset === 'Other (Custom)' ? '#0D9488' : '#F1F5F9',
                        color: formData.selectedPreset === 'Other (Custom)' ? '#FFFFFF' : '#334155',
                        borderRadius: '20px'
                      }}
                    >
                      + Other (Type Custom)
                    </button>
                  </div>
                </div>

                {/* Custom Symptom Name if chosen */}
                {(formData.selectedPreset === 'Other (Custom)' || !formData.selectedPreset) && (
                  <div className="form-group">
                    <label className="form-label">Custom Symptom Name *</label>
                    <input
                      type="text"
                      required={!formData.selectedPreset || formData.selectedPreset === 'Other (Custom)'}
                      value={formData.customName}
                      onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                      className="form-input"
                      placeholder="e.g. Tingling in left fingers, Ear pressure"
                    />
                  </div>
                )}

                {/* Severity Picker */}
                <div>
                  <label className="form-label">Severity Level *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { level: 'Mild', color: '#0D9488', bg: '#F0FDFA', desc: 'Noticeable but does not disrupt routine' },
                      { level: 'Moderate', color: '#D97706', bg: '#FFFBEB', desc: 'Discomfort affects daily tasks' },
                      { level: 'Severe', color: '#DC2626', bg: '#FEF2F2', desc: 'Intense or disabling discomfort' }
                    ].map((s) => (
                      <button
                        type="button"
                        key={s.level}
                        onClick={() => setFormData({ ...formData, severity: s.level })}
                        style={{
                          border: `2px solid ${formData.severity === s.level ? s.color : '#CBD5E1'}`,
                          background: formData.severity === s.level ? s.bg : '#FFFFFF',
                          padding: '12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: s.color, fontSize: '0.95rem' }}>{s.level}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Estimated Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="form-select"
                    >
                      <option value="Under 15 minutes">Under 15 minutes</option>
                      <option value="About 30 minutes">About 30 minutes</option>
                      <option value="About 1 hour">About 1 hour</option>
                      <option value="A few hours">A few hours</option>
                      <option value="All day">All day</option>
                      <option value="Past 2-3 days">Past 2-3 days</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Onset Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.onsetDate}
                      onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Describe how it started, what helps or makes it worse..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Symptom Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
