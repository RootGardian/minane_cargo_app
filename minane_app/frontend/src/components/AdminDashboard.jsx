import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { api } from '../services/api';

// Sous-composants modulaires Admin
import AdminHeader from './admin/AdminHeader';
import ShipmentsTab from './admin/ShipmentsTab';
import ContainersTab from './admin/ContainersTab';
import CashTab from './admin/CashTab';
import SettingsTab from './admin/SettingsTab';

// Modales modulaires
import NewShipmentModal from './admin/NewShipmentModal';
import NewContainerModal from './admin/NewContainerModal';
import BulkStatusModal from './admin/BulkStatusModal';
import PaymentModal from './admin/PaymentModal';
import DeliverModal from './admin/DeliverModal';
import TrackingModal from './TrackingModal';
import AlertModal from './AlertModal';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

const EMPTY_SHIPMENT_FORM = {
  clientId: '',
  newClientName: '',
  newClientPhone: '',
  isPriority: false,
  description: '',
  quantity: 1,
  transportMode: 'MARITIME_LCL',
  cbm: '',
  weight: '',
  containerId: '',
  overrideRate: '',
  overrideTotalAmount: '',
  initialNote: ''
};

const EMPTY_CONTAINER_FORM = {
  containerNumber: '',
  sealNumber: '',
  transportMode: 'MARITIME_LCL',
  etd: '',
  eta: '',
  status: 'CHINA_WAREHOUSE'
};

export default function AdminDashboard({ adminUser, onLogout }) {
  // Navigation & État global
  const [activeTab, setActiveTab] = useState('shipments'); // shipments | containers | cash | settings
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [inAppAlert, setInAppAlert] = useState(null);

  // Données
  const [shipments, setShipments] = useState([]);
  const [containers, setContainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [receivables, setReceivables] = useState({ totalGlobalDebt: 0, receivables: [] });
  const [recentPayments, setRecentPayments] = useState([]);
  const [settings, setSettings] = useState(null);

  // Recherche & Filtres Colis
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modales
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [isCreateContainerOpen, setIsCreateContainerOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [selectedContainerForBulk, setSelectedContainerForBulk] = useState(null);
  const [bulkNewStatus, setBulkNewStatus] = useState('IN_TRANSIT');
  const [bulkNote, setBulkNote] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentShipment, setPaymentShipment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('WAVE');
  const [payRef, setPayRef] = useState('');

  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliverShipment, setDeliverShipment] = useState(null);
  const [inputPickupPin, setInputPickupPin] = useState('');

  const [viewTrackingShipment, setViewTrackingShipment] = useState(null);

  // Formulaires
  const [newShipment, setNewShipment] = useState(EMPTY_SHIPMENT_FORM);
  const [newContainer, setNewContainer] = useState(EMPTY_CONTAINER_FORM);
  const [settingsForm, setSettingsForm] = useState(null);

  // Chargement des données
  const loadData = async () => {
    setLoading(true);
    try {
      const [shipmentsRes, containersRes, clientsRes, settingsRes, receivablesRes, paymentsRes] = await Promise.all([
        api.getShipments(),
        api.getContainers(),
        api.getClients(),
        api.getSettings(),
        api.getReceivables(),
        api.getRecentPayments()
      ]);
      setShipments(shipmentsRes);
      setContainers(containersRes);
      setClients(clientsRes);
      setSettings(settingsRes);
      setReceivables(receivablesRes);
      setRecentPayments(paymentsRes);
    } catch (err) {
      showErrorModal(err.message || 'Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Synchronisation du formulaire paramètres
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        maritimeCbmRate: settings.maritimeCbmRate,
        nextCutoffDate: settings.nextCutoffDate ? settings.nextCutoffDate.split('T')[0] : '',
        nextLoadingDate: settings.nextLoadingDate ? settings.nextLoadingDate.split('T')[0] : '',
        nextEstimatedArrival: settings.nextEstimatedArrival ? settings.nextEstimatedArrival.split('T')[0] : '',
        announcementBanner: settings.announcementBanner || '',
        phoneDakar: settings.phoneDakar || '+221 70 596 12 76',
        phoneGuangzhou: settings.phoneGuangzhou || '+86 137 1104 5051',
        phoneGuangzhouSn: settings.phoneGuangzhouSn || '+221 70 596 12 76',
        addressDakar: settings.addressDakar || 'Dakar',
        addressGuangzhou: settings.addressGuangzhou || 'Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road, Guangzhou'
      });
    }
  }, [settings]);

  // Notifications
  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showErrorModal = (message, title = 'Avis Opérationnel') => {
    setInAppAlert({ title, message, type: 'error' });
  };

  // Handlers Modales & Actions
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createShipment(newShipment);
      flashSuccess(`Colis créé avec succès ! Code : ${res.shipment.trackingCode}`);
      setNewShipment(EMPTY_SHIPMENT_FORM);
      setIsCreateShipmentOpen(false);
      loadData();
    } catch (err) {
      showErrorModal(err.message, 'Erreur Création Colis');
    }
  };

  const handleCreateContainer = async (e) => {
    e.preventDefault();
    try {
      await api.createContainer(newContainer);
      flashSuccess('Conteneur créé avec succès.');
      setNewContainer(EMPTY_CONTAINER_FORM);
      setIsCreateContainerOpen(false);
      loadData();
    } catch (err) {
      showErrorModal(err.message, 'Erreur Création Conteneur');
    }
  };

  const handleBulkStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedContainerForBulk) return;
    try {
      const res = await api.updateContainerStatusBulk(selectedContainerForBulk.id, {
        status: bulkNewStatus,
        note: bulkNote
      });
      flashSuccess(res.message);
      setIsBulkStatusOpen(false);
      setSelectedContainerForBulk(null);
      loadData();
    } catch (err) {
      showErrorModal(err.message, 'Erreur Mise à Jour Conteneur');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentShipment) return;
    try {
      const res = await api.recordPayment({
        shipmentId: paymentShipment.id,
        amount: payAmount,
        method: payMethod,
        reference: payRef
      });
      flashSuccess(`Paiement de ${formatFCFA(res.payment.amount)} enregistré (Reçu N° ${res.payment.receiptNum}).`);
      setIsPaymentModalOpen(false);
      setPaymentShipment(null);
      loadData();
    } catch (err) {
      showErrorModal(err.message, 'Erreur Enregistrement Paiement');
    }
  };

  const handleDeliverShipment = async (e) => {
    e.preventDefault();
    if (!deliverShipment) return;
    try {
      await api.deliverShipmentSecure(deliverShipment.id, {
        pickupPin: inputPickupPin,
        allowDebtBypass: true,
        deliveryNote: ''
      });
      flashSuccess(`Colis ${deliverShipment.trackingCode} remis avec succès !`);
      setIsDeliverModalOpen(false);
      setDeliverShipment(null);
      setInputPickupPin('');
      loadData();
    } catch (err) {
      showErrorModal(err.message, 'Erreur Validation Retrait');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settingsForm);
      flashSuccess('Paramètres globaux mis à jour avec succès.');
      setSettings(res.settings);
    } catch (err) {
      showErrorModal(err.message, 'Erreur Enregistrement Paramètres');
    }
  };

  const handleDashboardLogout = () => {
    setShipmentSearch('');
    setStatusFilter('');
    setIsCreateShipmentOpen(false);
    setIsCreateContainerOpen(false);
    setIsBulkStatusOpen(false);
    setIsPaymentModalOpen(false);
    setIsDeliverModalOpen(false);
    if (onLogout) onLogout();
  };

  // Filtrage des colis
  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.trackingCode.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.client?.fullName.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.client?.phone.includes(shipmentSearch);

    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Navigation Tabs */}
      <AdminHeader
        adminUser={adminUser}
        onLogout={handleDashboardLogout}
        loading={loading}
        loadData={loadData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shipmentsCount={shipments.length}
        containersCount={containers.length}
      />

      {/* 2. Global Flash Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3. Onglet Actif */}
      {activeTab === 'shipments' && (
        <ShipmentsTab
          filteredShipments={filteredShipments}
          shipmentSearch={shipmentSearch}
          setShipmentSearch={setShipmentSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenCreateShipment={() => setIsCreateShipmentOpen(true)}
          onOpenPaymentModal={(s) => {
            setPaymentShipment(s);
            setPayAmount(s.remainingBalance);
            setIsPaymentModalOpen(true);
          }}
          onOpenDeliverModal={(s) => {
            setDeliverShipment(s);
            setInputPickupPin('');
            setIsDeliverModalOpen(true);
          }}
          onViewTracking={(s) => setViewTrackingShipment(s)}
        />
      )}

      {activeTab === 'containers' && (
        <ContainersTab
          containers={containers}
          onOpenCreateContainer={() => setIsCreateContainerOpen(true)}
          onOpenBulkStatus={(c) => {
            setSelectedContainerForBulk(c);
            setBulkNewStatus(c.status);
            setBulkNote('');
            setIsBulkStatusOpen(true);
          }}
        />
      )}

      {activeTab === 'cash' && (
        <CashTab
          receivables={receivables}
          recentPayments={recentPayments}
          shipments={shipments}
          containers={containers}
          clients={clients}
          onOpenPaymentModal={(s) => {
            setPaymentShipment(s);
            setPayAmount(s.remainingBalance);
            setIsPaymentModalOpen(true);
          }}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          settingsForm={settingsForm}
          setSettingsForm={setSettingsForm}
          onSaveSettings={handleSaveSettings}
          onDataReset={() => {
            setShipments([]);
            setContainers([]);
            setClients([]);
            setReceivables({ totalGlobalDebt: 0, receivables: [] });
            setRecentPayments([]);
          }}
        />
      )}

      {/* 4. Modales dédiées */}
      <NewShipmentModal
        isOpen={isCreateShipmentOpen}
        onClose={() => setIsCreateShipmentOpen(false)}
        newShipment={newShipment}
        setNewShipment={setNewShipment}
        clients={clients}
        containers={containers}
        settings={settings}
        onSubmit={handleCreateShipment}
      />

      <NewContainerModal
        isOpen={isCreateContainerOpen}
        onClose={() => setIsCreateContainerOpen(false)}
        newContainer={newContainer}
        setNewContainer={setNewContainer}
        onSubmit={handleCreateContainer}
      />

      <BulkStatusModal
        isOpen={isBulkStatusOpen}
        onClose={() => setIsBulkStatusOpen(false)}
        selectedContainer={selectedContainerForBulk}
        bulkNewStatus={bulkNewStatus}
        setBulkNewStatus={setBulkNewStatus}
        bulkNote={bulkNote}
        setBulkNote={setBulkNote}
        onSubmit={handleBulkStatusUpdate}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentShipment={paymentShipment}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
        payRef={payRef}
        setPayRef={setPayRef}
        onSubmit={handleRecordPayment}
      />

      <DeliverModal
        isOpen={isDeliverModalOpen}
        onClose={() => setIsDeliverModalOpen(false)}
        deliverShipment={deliverShipment}
        inputPickupPin={inputPickupPin}
        setInputPickupPin={setInputPickupPin}
        onSubmit={handleDeliverShipment}
      />

      {viewTrackingShipment && (
        <TrackingModal
          shipment={viewTrackingShipment}
          onClose={() => setViewTrackingShipment(null)}
        />
      )}

      {inAppAlert && (
        <AlertModal
          isOpen={!!inAppAlert}
          title={inAppAlert.title}
          message={inAppAlert.message}
          type={inAppAlert.type}
          onClose={() => setInAppAlert(null)}
        />
      )}
    </div>
  );
}
