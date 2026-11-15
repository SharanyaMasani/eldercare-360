import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import {
  getMedications,
  adjustMedicationStock,
  getCaregiverAlerts
} from '../../services/storage';

export default function InventoryManager({ onRefreshData }) {
  const [restockModalMed, setRestockModalMed] = useState(null);
  const [restockQty, setRestockQty] = useState(30);
  const [restockExpiry, setRestockExpiry] = useState('');
  const [restockNote, setRestockNote] = useState('Standard Pharmacy Refill');

  const meds = getMedications();
  const alerts = getCaregiverAlerts();

  const handleOpenRestock = (med) => {
    setRestockModalMed(med);
    setRestockQty(30);
    setRestockExpiry(med.expiryDate || '');
    setRestockNote('Standard Apollo Pharmacy Refill');
  };

  const handleConfirmRestock = (e) => {
    e.preventDefault();
    if (!restockModalMed) return;

    adjustMedicationStock(
      restockModalMed.id,
      Number(restockQty) || 0,
      restockExpiry || null,
      restockNote
    );

    setRestockModalMed(null);
    if (onRefreshData) onRefreshData();
  };

  // Inventory calculations
  const inventoryItems = meds.map((med) => {
    const tabletsPerDay = (Number(med.tabletsPerDose) || 1) * (med.scheduledTimes?.length || 1);
    const daysRemaining = tabletsPerDay > 0 ? Math.floor((med.currentStock || 0) / tabletsPerDay) : 999;
    const isCritical = daysRemaining <= 2;
    const isLow = (med.currentStock || 0) <= (med.reorderThreshold || 10);

    // Expiry check
    let expiryStatus = 'valid';
    if (med.expiryDate) {
      const expDate = new Date(med.expiryDate);
      const today = new Date();
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) expiryStatus = 'expired';
      else if (diffDays <= 45) expiryStatus = 'expiring_soon';
    }

    return {
      ...med,
      tabletsPerDay,
      daysRemaining,
      isCritical,
      isLow,
      expiryStatus
    };
  });

  const criticalCount = inventoryItems.filter((i) => i.isCritical).length;
  const lowCount = inventoryItems.filter((i) => i.isLow && !i.isCritical).length;
  const adequateCount = inventoryItems.filter((i) => !i.isLow && !i.isCritical).length;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Inventory Status Metric Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ borderLeft: '5px solid #DC2626', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Critical (≤ 2 Days Left)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626', margin: '4px 0' }}>
            {criticalCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#991B1B' }}>
            Immediate restock required
          </span>
        </div>

        <div className="card" style={{ borderLeft: '5px solid #D97706', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Low Stock (≤ Threshold)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', margin: '4px 0' }}>
            {lowCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#92400E' }}>
            Order refilling soon
          </span>
        </div>

        <div className="card" style={{ borderLeft: '5px solid #059669', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Adequate Supply
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
            {adequateCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#047857' }}>
            Sufficient stock on hand
          </span>
        </div>

        <div className="card" style={{ borderLeft: '5px solid #0D9488', padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Consumption Rule
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D9488', margin: '4px 0' }}>
            Active & Synced
          </div>
          <span style={{ fontSize: '0.78rem', color: '#0F766E' }}>
            Deduct on Taken • Skip protected
          </span>
        </div>
      </div>

      {/* 2-Day Depletion Warning Alert Banner */}
      {criticalCount > 0 && (
        <div style={{ background: '#FEF2F2', border: '2px solid #F87171', borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#DC2626', color: '#FFFFFF', padding: '10px', borderRadius: '12px' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ color: '#991B1B', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px' }}>
                Automated 2-Day Depletion Warning Active
              </h4>
              <p style={{ color: '#7F1D1D', fontSize: '0.88rem', margin: 0 }}>
                One or more essential medications will run out within 48 hours. Caregiver alert has been triggered automatically.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="https://www.apollopharmacy.in"
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.85rem' }}
            >
              <ShoppingBag size={16} /> Reorder from Pharmacy
            </a>
          </div>
        </div>
      )}

      {/* Inventory Table Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Medication Stock & Depletion Forecast</h3>
            <p className="card-subtitle">
              Dynamic tracking linked to daily consumption. Deducts only confirmed taken doses.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #CBD5E1', color: '#334155' }}>
                <th style={{ padding: '14px 16px' }}>Medicine & Dosage</th>
                <th style={{ padding: '14px 16px' }}>Daily Consumption</th>
                <th style={{ padding: '14px 16px' }}>Current Stock</th>
                <th style={{ padding: '14px 16px' }}>Estimated Supply</th>
                <th style={{ padding: '14px 16px' }}>Stock Status</th>
                <th style={{ padding: '14px 16px' }}>Expiry Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#0D9488', fontWeight: 600 }}>{item.dosage}</div>
                  </td>

                  <td style={{ padding: '14px 16px', color: '#475569' }}>
                    <strong>{item.tabletsPerDay}</strong> tablet(s) / day
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>({item.frequency})</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: item.isCritical ? '#DC2626' : item.isLow ? '#D97706' : '#0F172A' }}>
                      {item.currentStock}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '4px' }}>tablets</span>
                    <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>Threshold: {item.reorderThreshold}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color={item.isCritical ? '#DC2626' : '#64748B'} />
                      <strong style={{ fontSize: '0.95rem', color: item.isCritical ? '#DC2626' : '#334155' }}>
                        ~{item.daysRemaining} days
                      </strong>
                    </div>
                    {item.isCritical && (
                      <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, display: 'block' }}>
                        ⚠️ Depletes in ≤ 48 hrs!
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {item.isCritical ? (
                      <span className="badge badge-red">Critical (≤ 2 Days)</span>
                    ) : item.isLow ? (
                      <span className="badge badge-amber">Low Stock Alert</span>
                    ) : (
                      <span className="badge badge-green">Healthy Supply</span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: item.expiryStatus === 'expired' ? '#DC2626' : item.expiryStatus === 'expiring_soon' ? '#D97706' : '#334155' }}>
                      {item.expiryDate || 'N/A'}
                    </div>
                    {item.expiryStatus === 'expiring_soon' && (
                      <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>
                        Expiring Soon (&lt; 45d)
                      </span>
                    )}
                    {item.expiryStatus === 'expired' && (
                      <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700 }}>
                        Expired! Replace Now
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenRestock(item)}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', minHeight: '38px', fontSize: '0.84rem' }}
                    >
                      <PlusCircle size={15} /> Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restocking Explanatory Box */}
      <div className="card" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#0D9488" /> Smart Inventory Guarantees
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>
            <strong>Dose Deduction:</strong> Tablets are deducted immediately when a dose is marked <em>Taken</em> in the Medication Schedule.
          </li>
          <li>
            <strong>Duplicate Prevention:</strong> If a dose has already been marked <em>Taken</em> for today's time slot, clicking again is prevented so stock is never double-deducted.
          </li>
          <li>
            <strong>Skipped Doses:</strong> Skipped or unconfirmed doses do not deduct any stock. If a dose was marked taken and subsequently edited to skipped, the tablet is safely refunded to inventory.
          </li>
          <li>
            <strong>2-Day Depletion Notification:</strong> When estimated days of remaining supply drop to 2 or fewer days, an alert is automatically escalated to the Caregiver Portal.
          </li>
        </ul>
      </div>

      {/* MODAL: MANUAL RESTOCK */}
      {restockModalMed && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Restock {restockModalMed.name}</h3>
              <button onClick={() => setRestockModalMed(null)} className="modal-close-btn" aria-label="Close modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRestock}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '0.84rem', color: '#0F766E' }}>
                    Current Stock: <strong>{restockModalMed.currentStock} tablets</strong>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#0F766E' }}>
                    Reorder Threshold: <strong>{restockModalMed.reorderThreshold} tablets</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tablets Added *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="form-input"
                    placeholder="30"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Expiry Date</label>
                  <input
                    type="date"
                    value={restockExpiry}
                    onChange={(e) => setRestockExpiry(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pharmacy / Supplier Note</label>
                  <input
                    type="text"
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                    className="form-input"
                    placeholder="e.g., Apollo Pharmacy refill strip #402"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setRestockModalMed(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Restock (+{restockQty} tablets)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
