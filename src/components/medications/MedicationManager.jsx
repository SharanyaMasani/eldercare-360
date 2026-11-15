import React, { useState } from 'react';
import {
  Pill,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  History,
  Check,
  X,
  Filter
} from 'lucide-react';
import {
  getMedications,
  saveMedication,
  deleteMedication,
  getDailySchedule,
  recordDoseAction,
  getDoseLogs,
  getLocalDateString
} from '../../services/storage';

export default function MedicationManager({ onRefreshData }) {
  const [activeSubTab, setActiveSubTab] = useState('schedule'); // 'schedule' | 'all_meds' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [skipModalDose, setSkipModalDose] = useState(null);
  const [skipReason, setSkipReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  // Form State for Add / Edit
  const defaultFormData = {
    name: '',
    dosage: '',
    tabletsPerDose: 1,
    frequency: 'Once daily',
    scheduledTimes: ['08:00'],
    timeLabels: ['Morning'],
    purpose: '',
    instructions: '',
    startDate: getLocalDateString(),
    endDate: '2027-01-01',
    currentStock: 30,
    reorderThreshold: 10,
    expiryDate: '2027-12-31',
    color: '#0D9488'
  };
  const [formData, setFormData] = useState(defaultFormData);

  const meds = getMedications();
  const schedule = getDailySchedule(selectedDate);
  const historyLogs = getDoseLogs();

  const handleOpenAdd = () => {
    setEditingMed(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setFormData({
      ...med,
      scheduledTimes: med.scheduledTimes || ['08:00']
    });
    setIsModalOpen(true);
  };

  const handleDelete = (medId, medName) => {
    if (window.confirm(`Are you sure you want to remove "${medName}" from Margaret's prescriptions?`)) {
      deleteMedication(medId);
      if (onRefreshData) onRefreshData();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      alert('Please provide medication name and dosage.');
      return;
    }

    saveMedication({
      ...formData,
      id: editingMed ? editingMed.id : undefined,
      currentStock: Number(formData.currentStock) || 0,
      tabletsPerDose: Number(formData.tabletsPerDose) || 1,
      reorderThreshold: Number(formData.reorderThreshold) || 10
    });

    setIsModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const handleMarkTaken = (dose) => {
    const res = recordDoseAction(selectedDate, dose.medicationId, dose.time, 'taken');
    if (res.alreadyTaken) {
      alert('This dose was already recorded as taken. Stock deduction was prevented.');
    }
    if (onRefreshData) onRefreshData();
  };

  const handleOpenSkipModal = (dose) => {
    setSkipModalDose(dose);
    setSkipReason('');
  };

  const handleConfirmSkip = () => {
    if (!skipModalDose) return;
    recordDoseAction(selectedDate, skipModalDose.medicationId, skipModalDose.time, 'skipped', skipReason);
    setSkipModalDose(null);
    if (onRefreshData) onRefreshData();
  };

  // Group daily schedule by period
  const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const groupedSchedule = periods.reduce((acc, p) => {
    acc[p] = schedule.filter((d) => d.period === p);
    return acc;
  }, {});

  const takenCount = schedule.filter((d) => d.status === 'taken').length;
  const skippedCount = schedule.filter((d) => d.status === 'skipped' || d.status === 'missed').length;
  const pendingCount = schedule.filter((d) => d.status === 'pending').length;
  const totalCount = schedule.length;
  const dailyRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', background: '#E2E8F0', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`btn ${activeSubTab === 'schedule' ? 'btn-primary' : ''}`}
            style={{
              background: activeSubTab === 'schedule' ? '#0D9488' : 'transparent',
              color: activeSubTab === 'schedule' ? '#FFFFFF' : '#334155',
              padding: '8px 16px',
              minHeight: '38px',
              fontSize: '0.9rem'
            }}
          >
            <Clock size={16} /> Daily Schedule
          </button>
          <button
            onClick={() => setActiveSubTab('all_meds')}
            className={`btn ${activeSubTab === 'all_meds' ? 'btn-primary' : ''}`}
            style={{
              background: activeSubTab === 'all_meds' ? '#0D9488' : 'transparent',
              color: activeSubTab === 'all_meds' ? '#FFFFFF' : '#334155',
              padding: '8px 16px',
              minHeight: '38px',
              fontSize: '0.9rem'
            }}
          >
            <Pill size={16} /> All Prescriptions ({meds.length})
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`btn ${activeSubTab === 'history' ? 'btn-primary' : ''}`}
            style={{
              background: activeSubTab === 'history' ? '#0D9488' : 'transparent',
              color: activeSubTab === 'history' ? '#FFFFFF' : '#334155',
              padding: '8px 16px',
              minHeight: '38px',
              fontSize: '0.9rem'
            }}
          >
            <History size={16} /> Medication History
          </button>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ minHeight: '44px' }}>
          <Plus size={18} /> Add New Medication
        </button>
      </div>

      {/* VIEW 1: DAILY SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Daily Summary & Date Bar */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={22} color="#0D9488" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Schedule for {selectedDate === getLocalDateString() ? 'Today' : selectedDate}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                    Confirm doses to automatically sync with inventory records.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.88rem' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Adherence:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: dailyRate >= 80 ? '#059669' : '#D97706' }}>
                    {dailyRate}%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    ({takenCount}/{totalCount} Taken)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Time Periods */}
          {periods.map((period) => {
            const doses = groupedSchedule[period];
            if (doses.length === 0) return null;

            return (
              <div key={period} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0D9488' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {period} Doses
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>({doses.length} scheduled)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
                  {doses.map((dose) => {
                    const isTaken = dose.status === 'taken';
                    const isSkipped = dose.status === 'skipped' || dose.status === 'missed';

                    return (
                      <div
                        key={dose.id}
                        className="card"
                        style={{
                          borderLeft: `6px solid ${isTaken ? '#059669' : isSkipped ? '#DC2626' : '#0D9488'}`,
                          background: isTaken ? '#F0FDF4' : isSkipped ? '#FFF1F2' : '#FFFFFF',
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div>
                              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                                {dose.medicationName}
                              </h4>
                              <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                                {dose.dosage} • {dose.tabletsPerDose} tablet{dose.tabletsPerDose > 1 ? 's' : ''}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                              <Clock size={16} color="#0D9488" />
                              <span>{dose.time}</span>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 10px' }}>
                            🎯 {dose.purpose}
                          </p>
                          <p style={{ fontSize: '0.82rem', color: '#0F766E', margin: '0 0 10px', background: '#F0FDFA', padding: '6px 10px', borderRadius: '6px' }}>
                            💡 {dose.instructions}
                          </p>
                        </div>

                        {/* Dose Action Buttons */}
                        <div>
                          {isTaken ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#DCFCE7', padding: '10px 14px', borderRadius: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.92rem' }}>
                                <CheckCircle size={20} />
                                <span>Dose Confirmed Taken</span>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#15803D' }}>
                                {dose.recordedAt ? new Date(dose.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged'}
                              </span>
                            </div>
                          ) : isSkipped ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFE4E6', padding: '10px 14px', borderRadius: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9F1239', fontWeight: 700, fontSize: '0.92rem' }}>
                                <XCircle size={20} />
                                <span>{dose.status === 'missed' ? 'Missed dose: ' : 'Skipped: '}{dose.skipReason || 'Recorded by user'}</span>
                              </div>
                              <button
                                onClick={() => handleMarkTaken(dose)}
                                className="btn btn-outline"
                                style={{ padding: '4px 10px', minHeight: '32px', fontSize: '0.76rem', background: '#FFFFFF' }}
                              >
                                Mark Taken Instead
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => handleMarkTaken(dose)}
                                className="btn btn-primary"
                                style={{ flex: 1, minHeight: '48px', fontSize: '1rem', fontWeight: 700 }}
                              >
                                <Check size={18} />
                                <span>Taken</span>
                              </button>
                              <button
                                onClick={() => handleOpenSkipModal(dose)}
                                className="btn btn-outline"
                                style={{ minHeight: '48px', color: '#DC2626', borderColor: '#FCA5A5' }}
                              >
                                <X size={18} />
                                <span>Skip</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ALL PRESCRIPTIONS (CRUD) */}
      {activeSubTab === 'all_meds' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {meds.map((med) => {
            const dailyReq = (Number(med.tabletsPerDose) || 1) * (med.scheduledTimes?.length || 1);
            const daysLeft = Math.floor((med.currentStock || 0) / (dailyReq || 1));
            const isCritical = daysLeft <= 2;
            const isLow = med.currentStock <= (med.reorderThreshold || 10);

            return (
              <div key={med.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                        {med.name}
                      </h4>
                      <span style={{ fontSize: '0.9rem', color: '#0D9488', fontWeight: 700 }}>
                        {med.dosage}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(med)}
                        className="btn btn-outline"
                        style={{ padding: '6px 10px', minHeight: '34px' }}
                        title="Edit Prescription"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id, med.name)}
                        className="btn btn-outline"
                        style={{ padding: '6px 10px', minHeight: '34px', color: '#DC2626' }}
                        title="Remove Prescription"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '4px 0 10px' }}>
                    🎯 <strong>Purpose:</strong> {med.purpose || 'Prescribed by doctor'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#F8FAFC', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', color: '#475569', marginBottom: '14px' }}>
                    <div>⏰ <strong>Frequency:</strong> {med.frequency} ({med.scheduledTimes?.join(', ')})</div>
                    <div>💊 <strong>Dose:</strong> {med.tabletsPerDose} tablet(s) per intake</div>
                    <div>📅 <strong>Prescription Period:</strong> {med.startDate} to {med.endDate}</div>
                    <div>⏳ <strong>Expiry Date:</strong> {med.expiryDate || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Current Stock</span>
                    <strong style={{ fontSize: '1.15rem', color: isCritical ? '#DC2626' : isLow ? '#D97706' : '#059669' }}>
                      {med.currentStock} tablets
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '6px' }}>
                      (~{daysLeft} days)
                    </span>
                  </div>

                  <span className={`badge ${isCritical ? 'badge-red' : isLow ? 'badge-amber' : 'badge-green'}`}>
                    {isCritical ? '2-Day Refill' : isLow ? 'Low Stock' : 'Adequate'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: MEDICATION HISTORY AUDIT */}
      {activeSubTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Medication Consumption & Adherence Log</h3>
              <p className="card-subtitle">Complete chronological record with stock deductions</p>
            </div>
            <span className="badge badge-teal">{historyLogs.length} Records</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#334155' }}>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Time</th>
                  <th style={{ padding: '12px 14px' }}>Medication</th>
                  <th style={{ padding: '12px 14px' }}>Dose</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Stock Deducted</th>
                  <th style={{ padding: '12px 14px' }}>Notes / Skip Reason</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{log.date}</td>
                      <td style={{ padding: '12px 14px', color: '#0D9488', fontWeight: 700 }}>{log.scheduledTime}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{log.medicationName || 'Prescription Dose'}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{log.dosage || '1 dose'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${isTaken ? 'badge-green' : 'badge-red'}`}>
                          {isTaken ? 'Taken' : 'Skipped'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {isTaken ? `-${log.tabletsDeducted || 1} tablet` : '0 (No deduction)'}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>
                        {log.reason || (isTaken ? 'Confirmed by patient' : 'None')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MEDICATION */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingMed ? 'Edit Medication Prescription' : 'Add New Prescription'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Metformin Hydrochloride"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Dosage (e.g., 500 mg) *</label>
                    <input
                      type="text"
                      required
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      className="form-input"
                      placeholder="e.g. 500 mg"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tablets Per Dose *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.tabletsPerDose}
                      onChange={(e) => setFormData({ ...formData, tabletsPerDose: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Frequency *</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => {
                        const freq = e.target.value;
                        let times = ['08:00'];
                        if (freq === 'Twice daily') times = ['08:00', '20:00'];
                        else if (freq === 'Three times daily') times = ['08:00', '13:00', '20:00'];
                        setFormData({ ...formData, frequency: freq, scheduledTimes: times });
                      }}
                      className="form-select"
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Bedtime only">Bedtime only</option>
                      <option value="As needed (SOS)">As needed (SOS)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scheduled Time(s) (comma separated)</label>
                    <input
                      type="text"
                      value={formData.scheduledTimes ? formData.scheduledTimes.join(', ') : '08:00'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledTimes: e.target.value.split(',').map((t) => t.trim())
                        })
                      }
                      className="form-input"
                      placeholder="08:00, 20:00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Purpose / Condition</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Blood sugar control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Instructions for Senior</label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Take with food to avoid nausea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Current Stock (Tablets)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reorder Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.reorderThreshold}
                      onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMed ? 'Save Changes' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SKIP REASON */}
      {skipModalDose && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Record Skipped Dose</h3>
              <button onClick={() => setSkipModalDose(null)} className="modal-close-btn" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '14px' }}>
                Skipping <strong>{skipModalDose.medicationName} ({skipModalDose.dosage})</strong> scheduled for {skipModalDose.time}.
                <br />
                <span style={{ fontSize: '0.82rem', color: '#0D9488' }}>
                  Notice: Stock will NOT be deducted for skipped doses.
                </span>
              </p>
              <div className="form-group">
                <label className="form-label">Reason for skipping (Optional):</label>
                <input
                  type="text"
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Stomach upset, Fasting, Doctor advised pause"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSkipModalDose(null)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleConfirmSkip} className="btn btn-danger">
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
