import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Box,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { generateReceiptPDF } from '../../services/pdfGenerator';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

export default function CashTab({
  receivables = { totalGlobalDebt: 0, receivables: [], count: 0 },
  recentPayments = [],
  shipments = [],
  containers = [],
  clients = [],
  onOpenPaymentModal
}) {
  const [activeSubTab, setActiveSubTab] = useState('payments'); // 'payments' | 'clients' | 'containers' | 'receivables'
  const [searchQuery, setSearchQuery] = useState('');

  // ─── 1. Calcul des métriques globales ─────────────────────────────────────────
  const {
    totalCollected,
    totalInvoiced,
    totalDebt,
    recoveryRate,
    allPaymentsList,
    byMethodBreakdown
  } = useMemo(() => {
    // Collecter tous les paiements uniques en fusionnant recentPayments et les paiements attachés aux shipments
    const paymentMap = new Map();

    // 1. Depuis recentPayments
    (recentPayments || []).forEach(p => {
      if (p && p.id) {
        paymentMap.set(p.id, {
          ...p,
          shipment: p.shipment || shipments.find(s => s.id === p.shipmentId) || null
        });
      }
    });

    // 2. Depuis les shipments (pour garantir exhaustivité)
    (shipments || []).forEach(s => {
      (s.payments || []).forEach(p => {
        if (p && p.id && !paymentMap.has(p.id)) {
          paymentMap.set(p.id, {
            ...p,
            shipment: {
              id: s.id,
              trackingCode: s.trackingCode,
              description: s.description,
              totalAmount: s.totalAmount,
              transportMode: s.transportMode,
              cbm: s.cbm,
              container: s.container,
              client: s.client
            }
          });
        }
      });
    });

    const allPayments = Array.from(paymentMap.values()).sort(
      (a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0)
    );

    const collected = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const invoiced = (shipments || []).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const debt = receivables.totalGlobalDebt ?? Math.max(0, invoiced - collected);
    const rate = invoiced > 0 ? Math.min(100, Math.round((collected / invoiced) * 100)) : 100;

    // Répartition par mode
    const methods = { WAVE: 0, ORANGE_MONEY: 0, CASH: 0, BANK_TRANSFER: 0 };
    allPayments.forEach(p => {
      const m = p.method || 'CASH';
      if (methods[m] !== undefined) methods[m] += p.amount || 0;
      else methods.CASH += p.amount || 0;
    });

    return {
      totalCollected: collected,
      totalInvoiced: invoiced,
      totalDebt: debt,
      recoveryRate: rate,
      allPaymentsList: allPayments,
      byMethodBreakdown: methods
    };
  }, [recentPayments, shipments, receivables]);

  // ─── 2. Agrégation par Client ────────────────────────────────────────────────
  const clientsAggregation = useMemo(() => {
    const map = new Map();

    (shipments || []).forEach(s => {
      const clientId = s.client?.id || s.clientId || s.client?.phone || 'unknown';
      const clientName = s.client?.fullName || 'Client Anonyme';
      const clientPhone = s.client?.phone || 'Non renseigné';
      const isWholesaler = s.client?.isWholesaler || false;

      if (!map.has(clientId)) {
        map.set(clientId, {
          clientId,
          clientName,
          clientPhone,
          isWholesaler,
          shipmentsCount: 0,
          totalInvoiced: 0,
          totalPaid: 0,
          totalRemaining: 0,
          shipments: []
        });
      }

      const entry = map.get(clientId);
      entry.shipmentsCount += 1;
      entry.totalInvoiced += s.totalAmount || 0;
      entry.totalPaid += s.totalPaid || (s.payments || []).reduce((acc, p) => acc + p.amount, 0);
      entry.totalRemaining += s.remainingBalance ?? Math.max(0, s.totalAmount - entry.totalPaid);
      entry.shipments.push(s);
    });

    return Array.from(map.values()).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [shipments]);

  // ─── 3. Agrégation par Conteneur ──────────────────────────────────────────────
  const containersAggregation = useMemo(() => {
    const map = new Map();

    // Initialiser avec les conteneurs connus
    (containers || []).forEach(c => {
      map.set(c.id, {
        containerId: c.id,
        containerNumber: c.containerNumber,
        status: c.status,
        transportMode: c.transportMode || 'MARITIME_LCL',
        totalCbm: 0,
        shipmentsCount: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        totalRemaining: 0
      });
    });

    // Catégorie pour les colis sans conteneur
    const UNASSIGNED_KEY = '__unassigned__';
    map.set(UNASSIGNED_KEY, {
      containerId: null,
      containerNumber: 'En attente d\'empotage (Guangzhou)',
      status: 'CHINA_WAREHOUSE',
      transportMode: 'MARITIME_LCL',
      totalCbm: 0,
      shipmentsCount: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      totalRemaining: 0
    });

    (shipments || []).forEach(s => {
      const cId = s.containerId || s.container?.id || UNASSIGNED_KEY;
      if (!map.has(cId)) {
        map.set(cId, {
          containerId: cId,
          containerNumber: s.container?.containerNumber || 'Conteneur non référencé',
          status: s.container?.status || 'IN_TRANSIT',
          transportMode: s.transportMode || 'MARITIME_LCL',
          totalCbm: 0,
          shipmentsCount: 0,
          totalInvoiced: 0,
          totalPaid: 0,
          totalRemaining: 0
        });
      }

      const entry = map.get(cId);
      entry.shipmentsCount += 1;
      entry.totalCbm += Number(s.cbm || 0);
      entry.totalInvoiced += s.totalAmount || 0;
      const sPaid = s.totalPaid || (s.payments || []).reduce((acc, p) => acc + p.amount, 0);
      entry.totalPaid += sPaid;
      entry.totalRemaining += s.remainingBalance ?? Math.max(0, s.totalAmount - sPaid);
    });

    // Ne garder l'inassigné que s'il contient des colis
    return Array.from(map.values())
      .filter(entry => entry.containerId !== null || entry.shipmentsCount > 0)
      .sort((a, b) => b.totalPaid - a.totalPaid);
  }, [containers, shipments]);

  // ─── 4. Filtrage par recherche ───────────────────────────────────────────────
  const q = searchQuery.trim().toLowerCase();

  const filteredPayments = useMemo(() => {
    if (!q) return allPaymentsList;
    return allPaymentsList.filter(p =>
      (p.receiptNum || '').toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q) ||
      (p.method || '').toLowerCase().includes(q) ||
      (p.shipment?.trackingCode || '').toLowerCase().includes(q) ||
      (p.shipment?.client?.fullName || '').toLowerCase().includes(q) ||
      (p.shipment?.client?.phone || '').toLowerCase().includes(q)
    );
  }, [allPaymentsList, q]);

  const filteredClients = useMemo(() => {
    if (!q) return clientsAggregation;
    return clientsAggregation.filter(c =>
      c.clientName.toLowerCase().includes(q) ||
      c.clientPhone.toLowerCase().includes(q)
    );
  }, [clientsAggregation, q]);

  const filteredContainers = useMemo(() => {
    if (!q) return containersAggregation;
    return containersAggregation.filter(c =>
      c.containerNumber.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [containersAggregation, q]);

  const filteredReceivables = useMemo(() => {
    const list = receivables.receivables || [];
    if (!q) return list;
    return list.filter(r =>
      (r.trackingCode || '').toLowerCase().includes(q) ||
      (r.client?.fullName || '').toLowerCase().includes(q) ||
      (r.client?.phone || '').toLowerCase().includes(q) ||
      (r.containerNumber || '').toLowerCase().includes(q)
    );
  }, [receivables.receivables, q]);

  // Badge du mode de paiement
  const renderMethodBadge = (method) => {
    switch (method) {
      case 'WAVE':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-blue-100 text-blue-800 rounded">Wave</span>;
      case 'ORANGE_MONEY':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-orange-100 text-orange-800 rounded">Orange Money</span>;
      case 'BANK_TRANSFER':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-purple-100 text-purple-800 rounded">Virement</span>;
      case 'CASH':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 rounded">Espèces</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── EN-TÊTE : 4 CARTES KPI FINANCIÈRES COMPLÈTES ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Encaissé */}
        <div className="bg-white border-2 border-emerald-500 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Encaissé</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-full">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 font-mono">
            {formatFCFA(totalCollected)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{allPaymentsList.length} quittance{allPaymentsList.length > 1 ? 's' : ''} enregistrée{allPaymentsList.length > 1 ? 's' : ''}</span>
            <span className="font-semibold text-emerald-700">{recoveryRate}% recouvré</span>
          </div>
        </div>

        {/* Créances Restantes */}
        <div className="bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Créances & Impayés</span>
            <span className="p-1.5 bg-red-100 text-red-700 rounded-full">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E2001A] mt-2 font-mono">
            {formatFCFA(totalDebt)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{receivables.count || (receivables.receivables?.length || 0)} colis non soldé{receivables.count > 1 ? 's' : ''}</span>
            <span className="text-red-600 font-semibold">À recouvrer</span>
          </div>
        </div>

        {/* Total Facturé */}
        <div className="bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Fret Facturé</span>
            <span className="p-1.5 bg-slate-100 text-[#042442] rounded-full">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#042442] mt-2 font-mono">
            {formatFCFA(totalInvoiced)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{shipments.length} colis sur le corridor</span>
            <span className="text-slate-600 font-semibold">Chine ➔ Dakar</span>
          </div>
        </div>

        {/* Ventilation des Canaux de Paiement */}
        <div className="bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Canaux d'Encaissement</div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-semibold flex items-center gap-1">Wave</span>
              <span className="font-mono font-bold text-slate-700">{formatFCFA(byMethodBreakdown.WAVE)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-700 font-semibold flex items-center gap-1">Orange Money</span>
              <span className="font-mono font-bold text-slate-700">{formatFCFA(byMethodBreakdown.ORANGE_MONEY)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">Espèces (Cash)</span>
              <span className="font-mono font-bold text-slate-700">{formatFCFA(byMethodBreakdown.CASH)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700 font-semibold flex items-center gap-1">Virement bancaire</span>
              <span className="font-mono font-bold text-slate-700">{formatFCFA(byMethodBreakdown.BANK_TRANSFER)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTRÔLE RETRAIT GUICHET & SÉCURITÉ ─────────────────────────────── */}
      <div className="bg-[#042442] text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white rounded">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider">
              Contrôle de Caisse Strict : Retrait Guichet Dakar
            </div>
            <div className="text-[11px] text-slate-300">
              Aucun colis ne peut être remis au client sans <strong className="text-emerald-400">Solde à 0 FCFA</strong> et présentation du <strong className="text-emerald-400">Code PIN confidentiel</strong>.
            </div>
          </div>
        </div>
        <div className="text-xs font-mono font-bold px-3 py-1 bg-white/10 border border-white/20 whitespace-nowrap">
          Taux Recouvrement : {recoveryRate}%
        </div>
      </div>

      {/* ─── SÉLECTEUR DE VUES D'ENCAISSEMENT & RECHERCHE ────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Les 4 Onglets de Vue */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border-b-2 ${
                activeSubTab === 'payments'
                  ? 'border-[#042442] text-[#042442] bg-slate-50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Toutes les Quittances</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-800 rounded">
                {allPaymentsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('clients')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border-b-2 ${
                activeSubTab === 'clients'
                  ? 'border-[#042442] text-[#042442] bg-slate-50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Par Client</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-blue-100 text-blue-800 rounded">
                {clientsAggregation.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('containers')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border-b-2 ${
                activeSubTab === 'containers'
                  ? 'border-[#042442] text-[#042442] bg-slate-50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Par Conteneur</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-purple-100 text-purple-800 rounded">
                {containersAggregation.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('receivables')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border-b-2 ${
                activeSubTab === 'receivables'
                  ? 'border-[#E2001A] text-[#E2001A] bg-red-50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Créances & Impayés</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-red-100 text-red-800 rounded">
                {receivables.count || (receivables.receivables?.length || 0)}
              </span>
            </button>
          </div>

          {/* Barre de Recherche instantanée */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher client, reçu, colis..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#042442]"
            />
          </div>
        </div>

        {/* ─── VUE 1 : TOUTES LES QUITTANCES (JOURNAL D'ENCAISSEMENT) ───────── */}
        {activeSubTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">N° Quittance</th>
                  <th className="py-3 px-4">Date Règlement</th>
                  <th className="py-3 px-4">Colis</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Réf. Transaction</th>
                  <th className="py-3 px-4 text-right">Montant Encaissé</th>
                  <th className="py-3 px-4 text-center">Reçu PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400 font-medium">
                      Aucun encaissement trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(p => {
                    const sh = p.shipment || shipments.find(s => s.id === p.shipmentId);
                    const clientName = sh?.client?.fullName || 'Client';
                    const clientPhone = sh?.client?.phone || '-';
                    const trackingCode = sh?.trackingCode || '-';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#042442]">
                          {p.receiptNum}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-800">{trackingCode}</span>
                          {sh?.description && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{sh.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#042442]">{clientName}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{clientPhone}</td>
                        <td className="py-3 px-4">{renderMethodBadge(p.method)}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {p.reference || <span className="text-slate-300 italic">Direct</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                          +{formatFCFA(p.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => generateReceiptPDF(p, sh || { trackingCode, description: 'Fret Maritime', totalAmount: p.amount, client: { fullName: clientName, phone: clientPhone } })}
                            title="Télécharger le reçu officiel de caisse"
                            className="p-1.5 text-slate-600 hover:text-[#042442] hover:bg-slate-100 transition inline-flex items-center gap-1 rounded"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── VUE 2 : ENCAISSEMENTS PAR CLIENT ─────────────────────────────── */}
        {activeSubTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Client Destinataire</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4 text-center">Colis Expédiés</th>
                  <th className="py-3 px-4 text-right">Total Facturé</th>
                  <th className="py-3 px-4 text-right">Total Encaissé</th>
                  <th className="py-3 px-4 text-right">Reste Dû</th>
                  <th className="py-3 px-4 text-center">Statut Financier</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                      Aucun client trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(c => {
                    const isFullyPaid = c.totalRemaining <= 0;
                    const clientRecoveryRate = c.totalInvoiced > 0 ? Math.round((c.totalPaid / c.totalInvoiced) * 100) : 100;

                    return (
                      <tr key={c.clientId} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#042442] block text-sm">{c.clientName}</span>
                          {c.isWholesaler && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-black uppercase bg-amber-100 text-amber-800 rounded">
                              Grossiste
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{c.clientPhone}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          {c.shipmentsCount} colis
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#042442]">
                          {formatFCFA(c.totalInvoiced)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                          {formatFCFA(c.totalPaid)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {isFullyPaid ? (
                            <span className="text-emerald-700">0 FCFA</span>
                          ) : (
                            <span className="text-[#E2001A] font-black">{formatFCFA(c.totalRemaining)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isFullyPaid ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Soldé (100%)
                            </span>
                          ) : (
                            <div className="inline-block text-left">
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-800 rounded inline-flex items-center gap-1">
                                Impayé ({clientRecoveryRate}%)
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isFullyPaid && (
                            <button
                              onClick={() => {
                                const unpaidShipment = c.shipments.find(s => s.remainingBalance > 0);
                                if (unpaidShipment) onOpenPaymentModal(unpaidShipment);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition rounded"
                            >
                              Encaisser
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── VUE 3 : ENCAISSEMENTS PAR CONTENEUR ──────────────────────────── */}
        {activeSubTab === 'containers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">N° Conteneur</th>
                  <th className="py-3 px-4">Statut Logistique</th>
                  <th className="py-3 px-4 text-center">Colis / Volume</th>
                  <th className="py-3 px-4 text-right">Fret Total Facturé</th>
                  <th className="py-3 px-4 text-right">Fret Total Encaissé</th>
                  <th className="py-3 px-4 text-right">Reste à Recouvrer</th>
                  <th className="py-3 px-4 text-center">Taux Recouvrement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContainers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      Aucun conteneur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredContainers.map(ct => {
                    const cRate = ct.totalInvoiced > 0 ? Math.round((ct.totalPaid / ct.totalInvoiced) * 100) : 100;
                    const isAllPaid = ct.totalRemaining <= 0;

                    return (
                      <tr key={ct.containerNumber} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#042442] text-sm">
                          {ct.containerNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded">
                            {ct.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-slate-700">{ct.shipmentsCount} colis</span>
                          <span className="text-slate-400 text-[11px] block">{ct.totalCbm.toFixed(2)} CBM</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#042442]">
                          {formatFCFA(ct.totalInvoiced)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                          {formatFCFA(ct.totalPaid)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {isAllPaid ? (
                            <span className="text-emerald-700">0 FCFA</span>
                          ) : (
                            <span className="text-[#E2001A] font-black">{formatFCFA(ct.totalRemaining)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${isAllPaid ? 'bg-emerald-500' : 'bg-[#042442]'}`}
                                style={{ width: `${cRate}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px] text-slate-700">{cRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── VUE 4 : CRÉANCES & IMPAYÉS FRET (AVEC BOUTON ENCAISSER) ──────── */}
        {activeSubTab === 'receivables' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code Colis</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Conteneur</th>
                  <th className="py-3 px-4 text-right">Total Facturé</th>
                  <th className="py-3 px-4 text-right">Encaissé</th>
                  <th className="py-3 px-4 text-right">Reste à Payer</th>
                  <th className="py-3 px-4 text-center">Statut Logistique</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400 font-medium">
                      Aucune créance en attente. Tous les colis sont soldés !
                    </td>
                  </tr>
                ) : (
                  filteredReceivables.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#042442]">{r.trackingCode}</td>
                      <td className="py-3 px-4 font-bold text-[#042442]">{r.client?.fullName}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.client?.phone}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.containerNumber || 'Non assigné'}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#042442]">{formatFCFA(r.totalAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">{formatFCFA(r.totalPaid)}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-[#E2001A] text-sm">{formatFCFA(r.remainingBalance)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded">
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const found = shipments.find(s => s.id === r.id);
                            if (found) {
                              onOpenPaymentModal(found);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition rounded"
                        >
                          Encaisser
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
