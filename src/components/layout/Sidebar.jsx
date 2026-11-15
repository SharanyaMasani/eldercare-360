import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Package,
  Activity,
  Smile,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  AlertOctagon,
  Bell,
  X
} from 'lucide-react';
import { getPatientProfile, getCaregiverAlerts } from '../../services/storage';

export default function Sidebar({ currentTab, onSelectTab, isOpen, onClose, onOpenEmergency }) {
  const profile = getPatientProfile();
  const alerts = getCaregiverAlerts();
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell, alertCount: unreadAlertsCount },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'inventory', label: 'Smart Inventory', icon: Package },
    { id: 'symptoms', label: 'Symptom Monitor', icon: Activity },
    { id: 'wellness', label: 'Emotional Wellness', icon: Smile },
    { id: 'aura', label: 'AURA AI Companion', icon: Sparkles, badge: 'AI' },
    { id: 'caregiver', label: 'Caregiver Portal', icon: ShieldCheck, alertCount: unreadAlertsCount },
    { id: 'family', label: 'Family Connect', icon: HeartHandshake }
  ];

  return (
    <>
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-badge">
            <HeartHandshake size={24} />
          </div>
          <div className="brand-info">
            <h1>ElderCare 360</h1>
            <span>Senior Healthcare</span>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#CBD5E1',
                cursor: 'pointer'
              }}
              className="mobile-close-btn"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Patient Profile Card */}
        <div className="sidebar-patient-pill">
          <img
            src={profile.photo}
            alt={profile.name}
            className="patient-avatar"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256';
            }}
          />
          <div className="patient-meta">
            <h4>{profile.name}</h4>
            <p>Age {profile.age} • {profile.bloodGroup}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="nav-item-content">
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
                {item.alertCount > 0 && (
                  <span className="nav-badge" title={`${item.alertCount} unread caregiver alerts`}>
                    {item.alertCount}
                  </span>
                )}
                {item.badge && !item.alertCount && (
                  <span
                    style={{
                      background: 'rgba(20, 184, 166, 0.25)',
                      color: '#2DD4BF',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer with Immediate SOS */}
        <div className="sidebar-footer">
          <button
            onClick={() => {
              onOpenEmergency();
              if (onClose) onClose();
            }}
            className="sos-sidebar-btn"
          >
            <AlertOctagon size={20} />
            <span>EMERGENCY SOS (112)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
