import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import MedicationManager from './components/medications/MedicationManager';
import InventoryManager from './components/inventory/InventoryManager';
import SymptomMonitor from './components/symptoms/SymptomMonitor';
import EmotionalWellness from './components/wellness/EmotionalWellness';
import AuraCompanion from './components/aura/AuraCompanion';
import CaregiverPortal from './components/caregiver/CaregiverPortal';
import FamilyConnect from './components/family/FamilyConnect';
import EmergencyModal from './components/common/EmergencyModal';
import NotificationCenter from './components/notifications/NotificationCenter';
import {
  initializeStorage,
  getAccessibilitySettings,
  updateAccessibilitySettings,
  processMissedDoses,
  evaluateAllMedicationStock,
  evaluateUpcomingAppointments
} from './services/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [emergencyTrigger, setEmergencyTrigger] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Lazy initializer ensures storage is ready without setState inside effect
  const [accessibility, setAccessibility] = useState(() => {
    initializeStorage();
    return getAccessibilitySettings();
  });

  // Run local reminder rules on startup and periodically while the app is open.
  useEffect(() => {
    const runCareChecks = () => {
      processMissedDoses(new Date(), 60);
      evaluateAllMedicationStock();
      evaluateUpcomingAppointments();
    };
    runCareChecks();
    const intervalId = window.setInterval(runCareChecks, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Update body class list when accessibility changes
  useEffect(() => {
    document.body.classList.remove('font-large', 'font-xlarge', 'high-contrast');

    if (accessibility.fontSize === 'large') {
      document.body.classList.add('font-large');
    } else if (accessibility.fontSize === 'xlarge') {
      document.body.classList.add('font-xlarge');
    }

    if (accessibility.highContrast) {
      document.body.classList.add('high-contrast');
    }
  }, [accessibility]);

  // Storage change listener
  useEffect(() => {
    const handleStorageUpdate = () => {
      setRefreshKey((prev) => prev + 1);
    };
    window.addEventListener('eldercare_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('eldercare_storage_update', handleStorageUpdate);
  }, []);

  const handleUpdateAccessibility = (newSettings) => {
    const updated = updateAccessibilitySettings(newSettings);
    setAccessibility(updated);
  };

  const handleOpenEmergency = (trigger = null) => {
    setEmergencyTrigger(trigger);
    setIsEmergencyOpen(true);
  };

  const handleCloseEmergency = () => {
    setIsEmergencyOpen(false);
    setEmergencyTrigger(null);
  };

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container" key={refreshKey}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenEmergency={() => handleOpenEmergency()}
      />

      {/* Main Content View */}
      <div className="app-main">
        {/* Top Header with Accessibility Bar & SOS */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenEmergency={() => handleOpenEmergency()}
          accessibility={accessibility}
          onUpdateAccessibility={handleUpdateAccessibility}
          onRefreshData={triggerRefresh}
        />

        {/* Tab Modules */}
        <main style={{ flex: 1 }}>
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onRefreshData={triggerRefresh}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationCenter onRefreshData={triggerRefresh} />
          )}

          {currentTab === 'medications' && (
            <MedicationManager
              onRefreshData={triggerRefresh}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryManager
              onRefreshData={triggerRefresh}
            />
          )}

          {currentTab === 'symptoms' && (
            <SymptomMonitor
              onOpenEmergency={handleOpenEmergency}
              onRefreshData={triggerRefresh}
            />
          )}

          {currentTab === 'wellness' && (
            <EmotionalWellness
              onNavigate={(tab) => setCurrentTab(tab)}
              onRefreshData={triggerRefresh}
            />
          )}

          {currentTab === 'aura' && (
            <AuraCompanion
              onNavigate={(tab) => setCurrentTab(tab)}
              accessibility={accessibility}
              onRefreshData={triggerRefresh}
            />
          )}

          {currentTab === 'caregiver' && (
            <CaregiverPortal
              onRefreshData={triggerRefresh}
              onOpenEmergency={handleOpenEmergency}
            />
          )}

          {currentTab === 'family' && (
            <FamilyConnect
              onRefreshData={triggerRefresh}
            />
          )}
        </main>
      </div>

      {/* Emergency SOS & Safety Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={handleCloseEmergency}
        symptomTrigger={emergencyTrigger}
      />
    </div>
  );
}
