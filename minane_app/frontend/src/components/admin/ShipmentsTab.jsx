import React from 'react';
import { Search, Plus, Share2, DollarSign, FileText } from 'lucide-react';
import { generateInvoicePDF } from '../../services/pdfGenerator';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

export default function ShipmentsTab({
  filteredShipments = [],
  shipmentSearch = '',
  setShipmentSearch,
  statusFilter = '',
  setStatusFilter,
  onOpenCreateShipment,
  onOpenPaymentModal,
  onOpenDeliverModal,
  onViewTracking
}) {
  return (
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
          onClick={onOpenCreateShipment}
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
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 font-medium">
                    Aucun colis ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => {
                  const isDelivered = s.status === 'DELIVERED';
                  const isReady = s.status === 'READY_FOR_PICKUP';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      {/* Tracking Code */}
                      <td className="py-3 px-4 font-mono font-bold text-[#042442]">
                        <button
                          onClick={() => onViewTracking(s)}
                          className="hover:underline text-[#1A8BD6]"
                          title="Voir l'historique et la timeline"
                        >
                          {s.trackingCode}
                        </button>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#042442]">{s.client.fullName}</div>
                        <div className="text-[11px] text-slate-500">{s.client.phone}</div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{s.description}</div>
                        <div className="text-[10px] text-slate-500">{s.quantity} carton(s)</div>
                      </td>

                      {/* Mode / Volume */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{s.transportMode.replace(/_/g, ' ')}</div>
                        <div className="text-[11px] text-slate-500">
                          {s.cbm ? `${s.cbm} CBM` : (s.weight ? `${s.weight} Kg` : '-')}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-[#042442]">
                        {formatFCFA(s.totalAmount)}
                      </td>

                      {/* Solde */}
                      <td className="py-3 px-4">
                        <span className={`font-black ${s.remainingBalance > 0 ? 'text-[#E2001A]' : 'text-emerald-600'}`}>
                          {formatFCFA(s.remainingBalance)}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isDelivered ? 'bg-slate-100 text-slate-700' : isReady ? 'bg-[#E2001A] text-white' : 'bg-slate-200 text-[#042442]'
                        }`}>
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* PIN */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#042442]">
                        {s.pickupPin}
                      </td>

                      {/* Actions */}
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
                              onClick={() => onOpenPaymentModal(s)}
                              title="Encaisser un paiement"
                              className="p-1.5 text-amber-700 hover:bg-amber-50 transition"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}

                          {/* Retrait Sécurisé */}
                          {!isDelivered && (
                            <button
                              onClick={() => onOpenDeliverModal(s)}
                              title="Valider le retrait client sécurisé au guichet avec PIN"
                              className="px-2.5 py-1 bg-[#042442] hover:bg-[#001736] text-white font-bold text-[10px] uppercase tracking-wider transition"
                            >
                              Retrait
                            </button>
                          )}

                          {/* Facture PDF */}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

