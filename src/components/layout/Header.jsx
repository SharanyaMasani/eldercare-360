import React from 'react';
import {
  Menu,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Contrast,
  Type
} from 'lucide-react';
import { resetAllToDemoData } from '../../services/storage';

export default function Header({
  currentTab,
  onOpenMobileMenu,
  onOpenEmergency,
  accessibility,
  onUpdateAccessibility,
  onRefreshData
}) {
  const titles = {
    dashboard: { title: 'Health Overview', subtitle: 'Proactive daily wellness and vitals summary' },
    notifications: { title: 'Notification Center', subtitle: 'Review medication, safety, wellness and appointment alerts' },
    medications: { title: 'Medication Management', subtitle: 'Prescriptions, scheduled daily doses & adherence' },
    inventory: { title: 'Smart Inventory & Stock', subtitle: 'Automated depletion tracking & restock alerts' },
    symptoms: { title: 'Symptom Monitoring', subtitle: 'Log bodily changes with conservative safety alerts' },
    wellness: { title: 'Emotional Wellness', subtitle: 'Daily emotional check-ins, mood history & trends' },
    aura: { title: 'AURA — Emotional AI Companion', subtitle: 'Warm, empathetic conversational support & wellness' },
    caregiver: { title: 'Caregiver Portal', subtitle: 'Caregiver oversight, alert acknowledgements & activity' },
    family: { title: 'Family Connect', subtitle: 'Loved ones cheer wall, care digest & doctor contacts' }
  };

  const currentInfo = titles[currentTab] || { title: 'ElderCare 360', subtitle: 'Senior Healthcare Ecosystem' };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to initial hackathon showcase state? Any newly added custom items will be restored to defaults.')) {
      resetAllToDemoData();
      if (onRefreshData) onRefreshData();
    }
  };

  const handleFontSizeCycle = () => {
    const nextSize =
      accessibility.fontSize === 'normal'
        ? 'large'
        : accessibility.fontSize === 'large'
        ? 'xlarge'
        : 'normal';
    onUpdateAccessibility({ fontSize: nextSize });
  };

  const handleToggleContrast = () => {
    onUpdateAccessibility({ highContrast: !accessibility.highContrast });
  };

  const handleToggleSpeech = () => {
    const nextVal = !accessibility.speechNarration;
    onUpdateAccessibility({ speechNarration: nextVal });
    if (nextVal && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Voice guidance enabled for ElderCare 360.');
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={onOpenMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>
          <div className="header-title-block">
            <h2>{currentInfo.title}</h2>
            <p>{currentInfo.subtitle}</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Elderly Accessibility Controls */}
          <div className="accessibility-pill-group" title="Adjust text size for easier reading">
            <button
              onClick={handleFontSizeCycle}
              className={`acc-btn ${accessibility.fontSize !== 'normal' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              aria-label="Cycle text size"
            >
              <Type size={14} />
              <span>
                {accessibility.fontSize === 'normal'
                  ? 'Text: Normal'
                  : accessibility.fontSize === 'large'
                  ? 'Text: Large'
                  : 'Text: Extra Large'}
              </span>
            </button>
          </div>

          <button
            onClick={handleToggleContrast}
            className={`icon-toggle-btn ${accessibility.highContrast ? 'active' : ''}`}
            title="Toggle High Contrast Mode"
            aria-label="Toggle high contrast"
          >
            <Contrast size={18} />
          </button>

          <button
            onClick={handleToggleSpeech}
            className={`icon-toggle-btn ${accessibility.speechNarration ? 'active' : ''}`}
            title={accessibility.speechNarration ? 'Speech Narration Active' : 'Enable Voice Audio Narration'}
            aria-label="Toggle speech audio"
          >
            {accessibility.speechNarration ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Quick Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="sos-header-btn"
            title="Open Emergency Services & SOS (112)"
          >
            <AlertTriangle size={18} />
            <span>SOS (112)</span>
          </button>
        </div>
      </header>

      {/* Demo Data Notice Bar with one-click reset */}
      <div className="demo-banner">
        <div className="demo-banner-content">
          <span className="demo-chip">HACKATHON DEMO</span>
          <span>
            Demonstration mode active with realistic elderly records. All actions persist in local storage.
          </span>
        </div>
        <button
          onClick={handleResetData}
          className="demo-reset-btn"
          title="Restore original realistic demonstration records"
        >
          <RotateCcw size={13} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </>
  );
}
