import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import NextDeparturesCard from './components/NextDeparturesCard';
import SocialProofSection from './components/SocialProofSection';
import CbmSimulator from './components/CbmSimulator';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import TrackingModal from './components/TrackingModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import AlertModal from './components/AlertModal';
import PlanDuSite from './pages/PlanDuSite';
import Confidentialite from './pages/Confidentialite';
import MentionsLegales from './pages/MentionsLegales';
import SupportClient from './pages/SupportClient';
import { api, getAdminToken, removeAdminToken } from './services/api';

export default function App() {
  // Views: landing | admin | plan-du-site | confidentialite | mentions-legales | support
  const [currentView, setCurrentView] = useState('landing');
  const [settings, setSettings] = useState(null);
  const [trackedShipment, setTrackedShipment] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Authenticated admin
  const [adminUser, setAdminUser] = useState(null);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Load initial settings and verify admin session
  useEffect(() => {
    // 1. Fetch settings
    api.getSettings()
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));

    // 2. Check admin token
    const adminToken = getAdminToken();
    if (adminToken) {
      api.getAdminMe()
        .then(res => setAdminUser(res.admin))
        .catch(() => removeAdminToken());
    }

    // 3. Check URL params for direct tracking: ?track=MNC-XXXX
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('track');
    if (code) {
      handleTrack(code);
    }
  }, []);

  const handleTrack = async (code) => {
    setTrackingLoading(true);
    try {
      const res = await api.trackShipment(code);
      setTrackedShipment(res.shipment);
    } catch (err) {
      setAlertInfo({
        title: "Colis Introuvable",
        message: err.message || `Aucun colis trouvé pour le code « ${code} ». Veuillez vérifier votre référence d'expédition (ex: MNC-XXXX) ou contacter notre agence de Dakar.`,
        type: "error",
        trackingCode: code
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleAdminLoginSuccess = (admin) => {
    setAdminUser(admin);
    setCurrentView('admin');
  };

  const handleLogoutAdmin = () => {
    removeAdminToken();
    setAdminUser(null);
    setCurrentView('landing');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  // Static info pages
  const isStaticPage = ['plan-du-site', 'confidentialite', 'mentions-legales', 'support'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0B1F33] selection:bg-[#E2001A] selection:text-white">
      
      {/* Main Corporate Navbar */}
      <Navbar
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        adminUser={adminUser}
        onLogoutAdmin={handleLogoutAdmin}
        onNavigateHome={() => setCurrentView('landing')}
        settings={settings}
        currentView={currentView}
      />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <div className="space-y-0">
            <HeroSection
              onTrack={handleTrack}
              trackingLoading={trackingLoading}
              settings={settings}
            />
            <ServicesSection settings={settings} />
            <NextDeparturesCard settings={settings} />
            <SocialProofSection settings={settings} />
            <CbmSimulator settings={settings} />
          </div>
        )}

        {/* VIEW 2: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            adminUser={adminUser}
            onLogout={handleLogoutAdmin}
          />
        )}

        {/* VIEW 3: PLAN DU SITE */}
        {currentView === 'plan-du-site' && (
          <PlanDuSite onNavigate={handleNavigate} settings={settings} />
        )}

        {/* VIEW 4: CONFIDENTIALITÉ */}
        {currentView === 'confidentialite' && (
          <Confidentialite onNavigate={handleNavigate} settings={settings} />
        )}

        {/* VIEW 5: MENTIONS LÉGALES */}
        {currentView === 'mentions-legales' && (
          <MentionsLegales onNavigate={handleNavigate} settings={settings} />
        )}

        {/* VIEW 6: SUPPORT CLIENT */}
        {currentView === 'support' && (
          <SupportClient onNavigate={handleNavigate} settings={settings} />
        )}

      </main>

      {/* Public Tracking Result Modal */}
      {trackedShipment && (
        <TrackingModal
          shipment={trackedShipment}
          onClose={() => setTrackedShipment(null)}
        />
      )}

      {/* In-App Custom Alert Modal */}
      {alertInfo && (
        <AlertModal
          isOpen={!!alertInfo}
          title={alertInfo.title}
          message={alertInfo.message}
          type={alertInfo.type}
          trackingCode={alertInfo.trackingCode}
          phoneDakar={settings?.phoneDakar}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* CMA CGM Style Corporate Footer (Masqué dans le Dashboard Admin) */}
      {currentView !== 'admin' && (
        <>
          <Footer 
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onNavigate={handleNavigate}
            settings={settings}
          />
          <WhatsAppFloatingButton settings={settings} />
        </>
      )}

    </div>
  );
}
