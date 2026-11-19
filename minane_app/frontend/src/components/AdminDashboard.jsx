import React, { useState, useEffect } from 'react';
import {
  Package,
  Container,
  CreditCard,
  Settings as SettingsIcon,
  Plus,
  Search,
  Share2,
  Download,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  KeyRound,
  Trash2,
  RefreshCw,
  FileText,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { generateInvoicePDF, generateReceiptPDF } from '../services/pdfGenerator';
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
  const [activeTab, setActiveTab] = useState('shipments'); // shipments | containers | cash | settings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [inAppAlert, setInAppAlert] = useState(null); // { title, message, type }

  // Data states
  const [shipments, setShipments] = useState([]);
  const [containers, setContainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [receivables, setReceivables] = useState({ totalGlobalDebt: 0, receivables: [] });
  const [recentPayments, setRecentPayments] = useState([]);
  const [settings, setSettings] = useState(null);

  // Search & Filter
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [isCreateContainerOpen, setIsCreateContainerOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [selectedContainerForBulk, setSelectedContainerForBulk] = useState(null);
  const [bulkNewStatus, setBulkNewStatus] = useState('IN_TRANSIT');
  const [bulkNote, setBulkNote] = useState('');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentShipment, setPaymentShipment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('WAVE');
  const [payRef, setPayRef] = useState('');

  // Deliver Secure Modal
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliverShipment, setDeliverShipment] = useState(null);
  const [inputPickupPin, setInputPickupPin] = useState('');

  // Tracking modal preview
  const [viewTrackingShipment, setViewTrackingShipment] = useState(null);

  // Strict modal reset functions (clears all input fields upon close)
  const handleCloseCreateShipment = () => {
    setNewShipment(EMPTY_SHIPMENT_FORM);
    setIsCreateShipmentOpen(false);
  };

  const handleCloseCreateContainer = () => {
    setNewContainer(EMPTY_CONTAINER_FORM);
    setIsCreateContainerOpen(false);
  };

  const handleCloseBulkStatus = () => {
    setSelectedContainerForBulk(null);
    setBulkNewStatus('IN_TRANSIT');
    setBulkNote('');
    setIsBulkStatusOpen(false);
  };

  const handleClosePayment = () => {
    setPaymentShipment(null);
    setPayAmount('');
    setPayRef('');
    setPayMethod('WAVE');
    setIsPaymentModalOpen(false);
  };

  const handleCloseDeliver = () => {
    setDeliverShipment(null);
    setInputPickupPin('');
    setIsDeliverModalOpen(false);
  };

  // Logout handler that clears all filters, inputs and modals
  const handleDashboardLogout = () => {
    setShipmentSearch('');
    setStatusFilter('');
    handleCloseCreateShipment();
    handleCloseCreateContainer();
    handleCloseBulkStatus();
    handleClosePayment();
    handleCloseDeliver();
    if (onLogout) onLogout();
  };

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
      setError(err.message || 'Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showErrorModal = (message, title = "Avis Opérationnel") => {
    setInAppAlert({ title, message, type: 'error' });
  };

  // -------------------------------------------------------------
  // TAB 1: GESTION DES COLIS (SHIPMENTS)
  // -------------------------------------------------------------
  const [newShipment, setNewShipment] = useState(EMPTY_SHIPMENT_FORM);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createShipment(newShipment);
      flashSuccess(`Colis créé avec succès ! Code : ${res.shipment.trackingCode}`);
      handleCloseCreateShipment();
      loadData();
    } catch (err) {
      showErrorModal(err.message, "Erreur Création Colis");
    }
  };

  // -------------------------------------------------------------
  // TAB 2: GESTION DES CONTENEURS & P&L
  // -------------------------------------------------------------
  const [newContainer, setNewContainer] = useState(EMPTY_CONTAINER_FORM);

  const handleCreateContainer = async (e) => {
    e.preventDefault();
    try {
      await api.createContainer(newContainer);
      flashSuccess('Conteneur créé avec succès.');
      handleCloseCreateContainer();
      loadData();
    } catch (err) {
      showErrorModal(err.message, "Erreur Création Conteneur");
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
      handleCloseBulkStatus();
      loadData();
    } catch (err) {
      showErrorModal(err.message, "Erreur Mise à Jour Conteneur");
    }
  };

  // -------------------------------------------------------------
  // TAB 3: CAISSE, CRÉANCES & RETRAIT SÉCURISÉ
  // -------------------------------------------------------------
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
      handleClosePayment();
      loadData();
    } catch (err) {
      showErrorModal(err.message, "Erreur Enregistrement Paiement");
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
      handleCloseDeliver();
      loadData();
    } catch (err) {
      showErrorModal(err.message, "Erreur Validation Retrait");
    }
  };

  // -------------------------------------------------------------
  // TAB 4: APP SETTINGS
  // -------------------------------------------------------------
  const [settingsForm, setSettingsForm] = useState(null);

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

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settingsForm);
      flashSuccess('Paramètres globaux mis à jour avec succès.');
      setSettings(res.settings);
    } catch (err) {
      showErrorModal(err.message, "Erreur Enregistrement Paramètres");
    }
  };

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    const matchesSearch =
      s.trackingCode.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.client.fullName.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.client.phone.includes(shipmentSearch);

    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Top Admin Header (CMA CGM Navy Banner) */}
      <div className="bg-[#042442] text-white p-6 sm:p-8 border-l-4 border-[#E2001A] flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-300 uppercase block font-serif">
            PORTAIL OPÉRATIONNEL & GESTION DU CORRIDOR
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Back-Office Minane Cargo (Dakar - Chine)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Direction des Opérations : Guangzhou &  ➔ Port de Dakar  ..
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white uppercase tracking-wider transition rounded-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleDashboardLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#E2001A] hover:bg-[#B8001A] text-xs font-bold text-white uppercase tracking-wider transition rounded-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-[#E2001A] text-[#E2001A] text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E2001A] shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Navigation Tabs (CMA CGM clean tabs) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative ${activeTab === 'shipments'
            ? 'text-[#042442]'
            : 'text-slate-500 hover:text-[#042442]'
            }`}
        >
          COLIS & EXPÉDITIONS ({shipments.length})
          {activeTab === 'shipments' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E2001A]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('containers')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative ${activeTab === 'containers'
            ? 'text-[#042442]'
            : 'text-slate-500 hover:text-[#042442]'
            }`}
        >
          CONTENEURS & P&L ({containers.length})
          {activeTab === 'containers' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E2001A]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('cash')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative ${activeTab === 'cash'
            ? 'text-[#042442]'
            : 'text-slate-500 hover:text-[#042442]'
            }`}
        >
          CAISSE & CRÉANCES ({formatFCFA(receivables.totalGlobalDebt)})
          {activeTab === 'cash' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E2001A]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative ${activeTab === 'settings'
            ? 'text-[#042442]'
            : 'text-slate-500 hover:text-[#042442]'
            }`}
        >
          PARAMÈTRES & GRILLE TARIFAIRE
          {activeTab === 'settings' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E2001A]" />
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: SHIPMENTS VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">

          {/* Controls: New Shipment Button & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F7FA] p-4 border border-slate-200">

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher code, client, phone..."
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#042442] rounded-none bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-slate-300 text-xs font-semibold text-[#042442] bg-white rounded-none"
              >
                <option value="">Tous les statuts</option>
                <option value="CHINA_WAREHOUSE">Entrepôt Chine</option>
                <option value="CONTAINER_LOADED">Empoté</option>
                <option value="TRANSFERRED_TO_PORT">Port Chine</option>
                <option value="IN_TRANSIT">En Mer / Transit</option>
                <option value="ARRIVED_DAKAR">Arrivé Dakar</option>
                <option value="CUSTOMS_CLEARANCE">Dédouanement</option>
                <option value="READY_FOR_PICKUP">Prêt Retrait</option>
                <option value="DELIVERED">Livré</option>
              </select>
            </div>

            <button
              onClick={() => setIsCreateShipmentOpen(true)}
              className="px-5 py-2.5 bg-[#E2001A] hover:bg-[#B8001A] text-white text-xs font-bold uppercase tracking-wider transition rounded-none flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Colis (Chine)</span>
            </button>

          </div>

          {/* Shipments Table */}
          <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code Suivi</th>
                    <th className="py-3 px-4">Client Destinataire</th>
                    <th className="py-3 px-4">Marchandise</th>
                    <th className="py-3 px-4">Mode / Volume</th>
                    <th className="py-3 px-4">Montant Total</th>
                    <th className="py-3 px-4">Reste à Payer</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-center">PIN</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShipments.map((s) => {
                    const isDelivered = s.status === 'DELIVERED';
                    const isReady = s.status === 'READY_FOR_PICKUP';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">

                        <td className="py-3 px-4 font-mono font-bold text-[#042442]">
                          <button
                            onClick={() => setViewTrackingShipment(s)}
                            className="hover:underline text-[#1A8BD6]"
                          >
                            {s.trackingCode}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-[#042442]">{s.client.fullName}</div>
                          <div className="text-[11px] text-slate-500">{s.client.phone}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{s.description}</div>
                          <div className="text-[10px] text-slate-500">{s.quantity} carton(s)</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-700">{s.transportMode.replace(/_/g, ' ')}</div>
                          <div className="text-[11px] text-slate-500">
                            {s.cbm ? `${s.cbm} CBM` : (s.weight ? `${s.weight} Kg` : '-')}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-[#042442]">
                          {formatFCFA(s.totalAmount)}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`font-black ${s.remainingBalance > 0 ? 'text-[#E2001A]' : 'text-emerald-600'}`}>
                            {formatFCFA(s.remainingBalance)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isDelivered ? 'bg-slate-100 text-slate-700' : isReady ? 'bg-[#E2001A] text-white' : 'bg-slate-200 text-[#042442]'
                            }`}>
                            {s.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-[#042442]">
                          {s.pickupPin}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">

                            {/* WhatsApp Share */}
                            <a
                              href={s.waShareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Partager le suivi et code au client sur WhatsApp"
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 transition"
                            >
                              <Share2 className="w-4 h-4" />
                            </a>

                            {/* Encaisser */}
                            {s.remainingBalance > 0 && (
                              <button
                                onClick={() => {
                                  setPaymentShipment(s);
                                  setPayAmount(s.remainingBalance);
                                  setIsPaymentModalOpen(true);
                                }}
                                title="Encaisser un paiement"
                                className="p-1.5 text-amber-700 hover:bg-amber-50 transition"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            {/* Retrait */}
                            {!isDelivered && (
                              <button
                                onClick={() => {
                                  setDeliverShipment(s);
                                  setInputPickupPin('');
                                  setIsDeliverModalOpen(true);
                                }}
                                title="Valider le retrait client sécurisé au dépôt"
                                className="px-2.5 py-1 bg-[#042442] hover:bg-[#001736] text-white font-bold text-[10px] uppercase tracking-wider transition"
                              >
                                Retrait
                              </button>
                            )}

                            {/* Facture */}
                            <button
                              onClick={() => generateInvoicePDF(s)}
                              title="Télécharger Facture PDF"
                              className="p-1.5 text-slate-500 hover:text-[#042442] transition"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CONTAINERS VIEW & P&L */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'containers' && (
        <div className="space-y-6">

          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F7FA] p-4 border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
                Suivi des Conteneurs Maritimes
              </h2>
              <p className="text-xs text-slate-500">
                Mise à jour par lot du statut de l'ensemble des colis rattachés au conteneur.
              </p>
            </div>

            <button
              onClick={() => setIsCreateContainerOpen(true)}
              className="px-5 py-2.5 bg-[#042442] hover:bg-[#001736] text-white text-xs font-bold uppercase tracking-wider transition rounded-none flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Conteneur</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {containers.map((c) => (
              <div key={c.id} className="bg-white border border-slate-300 p-6 space-y-4">

                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="font-mono font-black text-xl text-[#042442] block">
                      {c.containerNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      Plomb : {c.sealNumber || 'N/A'} • {c.shipmentCount} colis empotés
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-[#042442] border border-slate-300">
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-[#F5F7FA] p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Volume</span>
                    <span className="font-bold text-[#042442] text-sm">{c.totalCbm} CBM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">ETD Chine</span>
                    <span className="font-semibold text-slate-800">
                      {c.etd ? new Date(c.etd).toLocaleDateString('fr-FR') : 'Non défini'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">ETA Dakar</span>
                    <span className="font-semibold text-slate-800">
                      {c.eta ? new Date(c.eta).toLocaleDateString('fr-FR') : 'Non défini'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedContainerForBulk(c);
                      setBulkNewStatus(c.status);
                      setBulkNote('');
                      setIsBulkStatusOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-[#042442] hover:text-white text-[#042442] font-bold text-xs uppercase tracking-wider transition text-center"
                  >
                    Mise à jour par lot (Bulk Status)
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CASH & RECEIVABLES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cash' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-white border border-slate-200 p-6">
              <span className="text-xs font-bold text-slate-500 uppercase">Créances Restantes</span>
              <div className="text-3xl font-black text-[#E2001A] mt-1">
                {formatFCFA(receivables.totalGlobalDebt)}
              </div>
              <span className="text-[11px] text-slate-400">{receivables.count} colis non soldés</span>
            </div>

            <div className="bg-white border border-slate-200 p-6">
              <span className="text-xs font-bold text-slate-500 uppercase">Contrôle Retrait Sécurisé</span>
              <div className="text-sm font-bold text-[#042442] mt-2 uppercase">
                PIN 4 chiffres + Solde à 0
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Le retrait est bloqué si le reste à payer est &gt; 0.
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-6">
              <span className="text-xs font-bold text-slate-500 uppercase">Règlements Enregistrés</span>
              <div className="text-2xl font-black text-[#042442] mt-1">
                {recentPayments.length} Quittances
              </div>
              <span className="text-[11px] text-slate-400">Wave, OM, Cash, Virement</span>
            </div>

          </div>

          <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
                Tableau des Créances & Impayés Fret
              </h2>
              <p className="text-xs text-slate-500">
                Liste des expéditions dont le reste à payer est supérieur à zéro.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code Colis</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Téléphone</th>
                    <th className="py-3 px-4">Total Facturé</th>
                    <th className="py-3 px-4">Encaissé</th>
                    <th className="py-3 px-4">Reste à Payer</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receivables.receivables?.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#042442]">{r.trackingCode}</td>
                      <td className="py-3 px-4 font-bold text-[#042442]">{r.client.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{r.client.phone}</td>
                      <td className="py-3 px-4 font-semibold text-[#042442]">{formatFCFA(r.totalAmount)}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">{formatFCFA(r.totalPaid)}</td>
                      <td className="py-3 px-4 font-black text-[#E2001A]">{formatFCFA(r.remainingBalance)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const found = shipments.find(s => s.id === r.id);
                            if (found) {
                              setPaymentShipment(found);
                              setPayAmount(found.remainingBalance);
                              setIsPaymentModalOpen(true);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          Encaisser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: APP SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && settingsForm && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">
              Paramètres Globaux & Grille Tarifaire Active
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ces tarifs et dates pilotent directement le simulateur et l'encart d'actualités maritimes de la Landing Page.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">

            {/* Rates */}
            {/* Pricing Settings (Exclusivement Fret Maritime) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Tarif Maritime Groupage (FCFA / CBM)
                </label>
                <input
                  type="number"
                  value={settingsForm.maritimeCbmRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maritimeCbmRate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tarif de référence appliqué automatiquement au calcul de fret maritime dédouané.
                </p>
              </div>
            </div>

            {/* Departure Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Date Limite Réception Chine (Cut-off)
                </label>
                <input
                  type="date"
                  value={settingsForm.nextCutoffDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nextCutoffDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Date de Chargement Conteneur
                </label>
                <input
                  type="date"
                  value={settingsForm.nextLoadingDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nextLoadingDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Date Arrivée Estimée à Dakar (ETA)
                </label>
                <input
                  type="date"
                  value={settingsForm.nextEstimatedArrival}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nextEstimatedArrival: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                />
              </div>
            </div>

            {/* Coordonnées Officielles & Numéros WhatsApp (Modifiables à tout moment) */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
                  Coordonnées Officielles & Numéros WhatsApp (Agences Dakar & Chine)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ces numéros et adresses s'appliquent immédiatement à toute la plateforme (liens WhatsApp, Navbar, Footer, Pages Légales et messages clients).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                    Téléphone & WhatsApp Agence Dakar
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneDakar || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneDakar: e.target.value })}
                    placeholder="+221 70 596 12 76"
                    className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1">
                    Numéro principal utilisé pour les notifications et le support WhatsApp.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                    Adresse Agence Dakar (Nom officiel)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.addressDakar || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, addressDakar: e.target.value })}
                    placeholder="Dakar"
                    className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1">
                    Indication de l'agence à Dakar (ex: Dakar).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                    Téléphone Chine (Guangzhou)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneGuangzhou || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneGuangzhou: e.target.value })}
                    placeholder="+86 137 1104 5051"
                    className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                    Ligne Sénégal de l'agence Guangzhou
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneGuangzhouSn || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneGuangzhouSn: e.target.value })}
                    placeholder="+221 70 596 12 76"
                    className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Adresse complète Agence Guangzhou
                </label>
                <input
                  type="text"
                  value={settingsForm.addressGuangzhou || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, addressGuangzhou: e.target.value })}
                  placeholder="Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road, Guangzhou"
                  className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#042442] hover:bg-[#001736] text-white text-xs font-bold uppercase tracking-wider transition rounded-none"
            >
              Enregistrer les Nouveaux Paramètres
            </button>

          </form>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: CRÉATION D'UN COLIS (SHIPMENT) */}
      {/* ============================================================= */}
      {isCreateShipmentOpen && (
        <div
          onClick={handleCloseCreateShipment}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8"
          >

            <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E2001A]" />
                Enregistrer un Nouveau Colis (Chine)
              </h3>
              <button
                type="button"
                onClick={handleCloseCreateShipment}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Client Selection */}
              <div className="p-4 bg-[#F5F7FA] border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#042442] uppercase block tracking-wider">
                  1. Destinataire au Sénégal
                </span>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Sélectionner un Client Existant ou laisser vide pour créer :
                  </label>
                  <select
                    value={newShipment.clientId}
                    onChange={(e) => setNewShipment({ ...newShipment, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold bg-white rounded-none"
                  >
                    <option value="">+ Nouveau Client</option>
                    {clients.map(cl => (
                      <option key={cl.id} value={cl.id}>
                        {cl.fullName} ({cl.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {!newShipment.clientId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Nom complet (ex: Moussa Diop)"
                        value={newShipment.newClientName}
                        onChange={(e) => setNewShipment({ ...newShipment, newClientName: e.target.value })}
                        required={!newShipment.clientId}
                        className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Téléphone (ex: +221 77 123 45 67)"
                        value={newShipment.newClientPhone}
                        onChange={(e) => setNewShipment({ ...newShipment, newClientPhone: e.target.value })}
                        required={!newShipment.clientId}
                        className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Package Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                    Description de la Marchandise
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 4 Cartons Chaussures Guangzhou"
                    value={newShipment.description}
                    onChange={(e) => setNewShipment({ ...newShipment, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                      Mode de Transport
                    </label>
                    <select
                      value={newShipment.transportMode}
                      onChange={(e) => setNewShipment({ ...newShipment, transportMode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold bg-white rounded-none"
                    >
                      <option value="MARITIME_LCL">Maritime Groupage (LCL)</option>
                      <option value="MARITIME_FCL">Maritime Conteneur Plein</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                      Nombre de colis
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newShipment.quantity}
                      onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                      Conteneur Assigné
                    </label>
                    <select
                      value={newShipment.containerId}
                      onChange={(e) => setNewShipment({ ...newShipment, containerId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold bg-white rounded-none"
                    >
                      <option value="">Non assigné (En attente)</option>
                      {containers.map(c => (
                        <option key={c.id} value={c.id}>{c.containerNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                      Volume CBM (m³)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Ex : 1.25"
                      value={newShipment.cbm}
                      onChange={(e) => setNewShipment({ ...newShipment, cbm: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                      Poids (Kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ex : 120"
                      value={newShipment.weight}
                      onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* VIP Override Calculation Section */}
              <div className="p-4 bg-[#F5F7FA] border-l-4 border-[#E2001A] space-y-2">
                <span className="text-xs font-bold text-[#042442] uppercase block">
                  ★ CALCUL TARIFAIRE AUTOMATIQUE & OVERRIDE VIP
                </span>
                <p className="text-[11px] text-slate-600">
                  Le système applique la grille active. Vous pouvez écraser manuellement le tarif unitaire ou le montant total pour un client VIP Sandaga.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tarif Unitaire Personnalisé (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder={`Défaut : ${settings?.maritimeCbmRate || 165000}`}
                      value={newShipment.overrideRate}
                      onChange={(e) => setNewShipment({ ...newShipment, overrideRate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 bg-white text-xs font-semibold rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Montant Total Négocié (Override VIP)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex : 500000"
                      value={newShipment.overrideTotalAmount}
                      onChange={(e) => setNewShipment({ ...newShipment, overrideTotalAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 bg-white text-xs font-bold text-[#E2001A] rounded-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreateShipment}
                  className="py-3 px-5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E2001A] hover:bg-[#B8001A] text-white font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Générer le Colis & Code de Suivi Unique
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: CRÉATION CONTENEUR */}
      {/* ============================================================= */}
      {isCreateContainerOpen && (
        <div
          onClick={handleCloseCreateContainer}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Container className="w-4 h-4 text-[#E2001A]" />
                Nouveau Conteneur
              </h3>
              <button
                type="button"
                onClick={handleCloseCreateContainer}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContainer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Numéro de Conteneur (ex: MSKU-109281-4)
                </label>
                <input
                  type="text"
                  required
                  placeholder="MSKU-XXXXXX-X"
                  value={newContainer.containerNumber}
                  onChange={(e) => setNewContainer({ ...newContainer, containerNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-bold uppercase rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Numéro de Plomb (Seal)
                </label>
                <input
                  type="text"
                  placeholder="SL-XXXXXX"
                  value={newContainer.sealNumber}
                  onChange={(e) => setNewContainer({ ...newContainer, sealNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">ETD (Départ)</label>
                  <input
                    type="date"
                    value={newContainer.etd}
                    onChange={(e) => setNewContainer({ ...newContainer, etd: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase mb-1">ETA (Arrivée)</label>
                  <input
                    type="date"
                    value={newContainer.eta}
                    onChange={(e) => setNewContainer({ ...newContainer, eta: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreateContainer}
                  className="py-3 px-5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#042442] hover:bg-[#001736] text-white font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Créer le Conteneur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: BULK STATUS UPDATE CONTENEUR */}
      {/* ============================================================= */}
      {isBulkStatusOpen && selectedContainerForBulk && (
        <div
          onClick={handleCloseBulkStatus}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Mise à jour groupée : {selectedContainerForBulk.containerNumber}
              </h3>
              <button
                type="button"
                onClick={handleCloseBulkStatus}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkStatusUpdate} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Nouveau Statut du Conteneur
                </label>
                <select
                  value={bulkNewStatus}
                  onChange={(e) => setBulkNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 font-bold text-xs bg-white rounded-none"
                >
                  <option value="CHINA_WAREHOUSE">ENTREPÔT EN CHINE</option>
                  <option value="CONTAINER_LOADED">CONTENEUR CHARGÉ</option>
                  <option value="TRANSFERRED_TO_PORT">TRANSFÉRÉ VERS PORT DE DÉPART</option>
                  <option value="IN_TRANSIT">EN TRANSIT VERS DAKAR</option>
                  <option value="ARRIVED_DAKAR">ARRIVÉ AU PORT DE DAKAR</option>
                  <option value="CUSTOMS_CLEARANCE">EN DÉDOUANEMENT</option>
                  <option value="READY_FOR_PICKUP">DISPONIBLE AU DÉPÔT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Note d'historique pour les clients (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Navire accosté à Dakar, dépotage en cours."
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseBulkStatus}
                  className="py-3 px-5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E2001A] hover:bg-[#B8001A] text-white font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Appliquer à tous les colis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ============================================================= */}
      {/* MODAL 5: ENCAISSEMENT PAIEMENT */}
      {/* ============================================================= */}
      {isPaymentModalOpen && paymentShipment && (
        <div
          onClick={handleClosePayment}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Encaisser un Paiement : {paymentShipment.trackingCode}
              </h3>
              <button
                type="button"
                onClick={handleClosePayment}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="p-3 bg-[#F5F7FA] border border-slate-200 text-xs space-y-1">
                <div>Client : <strong>{paymentShipment.client.fullName}</strong></div>
                <div>Montant Total Colis : <strong>{formatFCFA(paymentShipment.totalAmount)}</strong></div>
                <div>Reste à payer actuel : <strong className="text-[#E2001A]">{formatFCFA(paymentShipment.remainingBalance)}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Montant à Encaisser (FCFA)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentShipment.remainingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 font-black text-[#042442] text-base rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Moyen de Règlement
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 font-semibold text-xs bg-white rounded-none"
                >
                  <option value="WAVE">WAVE SÉNÉGAL</option>
                  <option value="ORANGE_MONEY">ORANGE MONEY</option>
                  <option value="CASH">ESPÈCES</option>
                  <option value="BANK_TRANSFER">VIREMENT BANCAIRE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Référence Transaction (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex : WV-98201948"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold rounded-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClosePayment}
                  className="py-3 px-5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Valider l'Encaissement & Émettre le Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 6: RETRAIT SÉCURISÉ (DELIVERED) - CRITICAL BUSINESS RULE */}
      {/* ============================================================= */}
      {isDeliverModalOpen && deliverShipment && (
        <div
          onClick={handleCloseDeliver}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#E2001A]" />
                Validation Retrait Colis : {deliverShipment.trackingCode}
              </h3>
              <button
                type="button"
                onClick={handleCloseDeliver}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliverShipment} className="p-6 space-y-4">

              <div className="p-3 bg-[#F5F7FA] border border-slate-200 text-xs space-y-1">
                <div>Client : <strong>{deliverShipment.client.fullName}</strong></div>
                <div>Colis : <strong>{deliverShipment.description}</strong></div>
              </div>

              {/* Saisie PIN */}
              <div>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Saisie du Code PIN de Retrait Client (4 chiffres) <span className="text-[#E2001A]">*</span>
                </label>
                <input
                  type="text"
                  maxLength="4"
                  required
                  placeholder="••••"
                  value={inputPickupPin}
                  onChange={(e) => setInputPickupPin(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 font-mono font-black text-2xl tracking-widest text-center text-[#042442] bg-[#F5F7FA] focus:bg-white focus:outline-none focus:border-[#042442] rounded-none"
                />
                <span className="block text-[11px] text-slate-500 text-center mt-1">
                  Présenté sur le téléphone ou SMS du client destinataire.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseDeliver}
                  className="py-3 px-5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#042442] hover:bg-[#001736] text-white font-bold text-xs uppercase tracking-wider transition rounded-none"
                >
                  Confirmer la Remise (DELIVERED)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal if clicked */}
      {viewTrackingShipment && (
        <TrackingModal
          shipment={viewTrackingShipment}
          onClose={() => setViewTrackingShipment(null)}
        />
      )}

      {/* In-App Alert Modal */}
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
