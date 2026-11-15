import React, { useMemo, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, CheckCheck } from 'lucide-react';
import { getCaregiverAlerts, acknowledgeAlert } from '../../services/storage';

export default function NotificationCenter({ onRefreshData }) {
  const [filter, setFilter] = useState('all');
  const alerts = getCaregiverAlerts();
  const visible = useMemo(() => alerts.filter((alert) => {
    if (filter === 'pending') return !alert.acknowledged;
    if (filter === 'reviewed') return alert.acknowledged;
    return true;
  }), [alerts, filter]);
  const pendingCount = alerts.filter((alert) => !alert.acknowledged).length;
  const review = (id) => {
    acknowledgeAlert(id, 'Primary Caregiver', 'Reviewed in Notification Center');
    onRefreshData?.();
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: '#CCFBF1', color: '#0F766E', display: 'grid', placeItems: 'center' }}><Bell size={23} /></div>
            <div><h2 style={{ margin: 0, color: '#0F172A' }}>Notification Center</h2><p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>Medication, safety, wellness and appointment alerts</p></div>
          </div>
          <span className={`badge ${pendingCount ? 'badge-red' : 'badge-green'}`}>{pendingCount} pending review</span>
        </div>
      </section>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['all', 'All alerts'], ['pending', 'Needs review'], ['reviewed', 'Reviewed']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={filter === key ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '8px 14px' }}>{label}</button>
        ))}
      </div>
      {visible.length === 0 ? <div className="card" style={{ padding: 30, textAlign: 'center', color: '#64748B' }}><CheckCircle2 size={30} color="#059669" /><h3>No alerts in this view</h3><p>You're all caught up.</p></div> : visible.map((alert) => {
        const critical = alert.severity === 'critical' || alert.severity === 'high';
        const Icon = critical ? AlertTriangle : alert.severity === 'info' ? Info : Bell;
        return <article key={alert.id} className="card" style={{ padding: 18, borderLeft: `4px solid ${critical ? '#DC2626' : alert.acknowledged ? '#94A3B8' : '#0D9488'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
              <div style={{ color: critical ? '#DC2626' : '#0D9488', paddingTop: 2 }}><Icon size={20} /></div>
              <div><h3 style={{ margin: '0 0 5px', color: '#0F172A', fontSize: 15 }}>{alert.title}</h3><p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.55 }}>{alert.message}</p>
                {alert.actionRequired && <p style={{ margin: '8px 0 0', color: '#334155', fontSize: 12 }}><strong>Suggested action:</strong> {alert.actionRequired}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', fontSize: 11, marginTop: 9 }}><Clock size={12} /> {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : alert.time || 'Previously logged'}</div>
                {alert.acknowledged && <p style={{ color: '#059669', fontSize: 12, margin: '7px 0 0' }}><CheckCircle2 size={13} style={{ verticalAlign: 'middle' }} /> Reviewed {alert.acknowledgedAt ? `— ${alert.acknowledgedAt}` : ''}</p>}
              </div>
            </div>
            {!alert.acknowledged && <button onClick={() => review(alert.id)} className="btn btn-outline" style={{ flexShrink: 0, padding: '7px 10px', fontSize: 12 }}><CheckCheck size={14} /> Review</button>}
          </div>
        </article>;
      })}
      <p style={{ color: '#94A3B8', fontSize: 11, margin: 0 }}>Demo notifications are stored in this browser on this device. They are not push notifications to another caregiver device.</p>
    </div>
  );
}
