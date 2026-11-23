import React, { useState } from 'react';
import {
  X,
  Package,
  Download,
  FileText,
  KeyRound,
  PhoneCall,
  Container,
  CreditCard,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import TrackingTimeline from './TrackingTimeline';
import { generateInvoicePDF, generateReceiptPDF } from '../services/pdfGenerator';
import { getWASupportUrl } from '../utils/whatsapp';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

export default function TrackingModal({ shipment, onClose }) {
  const [pinCopied, setPinCopied] = useState(false);
  if (!shipment) return null;

  const handleCopyPin = () => {
    if (shipment.pickupPin) {
      navigator.clipboard.writeText(shipment.pickupPin);
      setPinCopied(true);
      setTimeout(() => setPinCopied(false), 2500);
    }
  };

  const isReady = shipment.status === 'READY_FOR_PICKUP';
  const isDelivered = shipment.status === 'DELIVERED';
  const remaining = Math.max(0, shipment.totalAmount - (shipment.paidAmount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white max-w-4xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden my-8">

        {/* Top Header (CMA CGM Navy Banner) */}
        <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-300 uppercase block font-serif">
                SUIVI OFFICIEL D'EXPÉDITION • CORRIDOR CHINE ➔ SÉNÉGAL
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-mono text-white">
                  {shipment.trackingCode}
                </h3>
                <span className="text-[11px] px-2 py-0.5 bg-[#E2001A] text-white font-bold uppercase tracking-wider">
                  {(shipment.shippingMode || shipment.transportMode)?.startsWith('AIR')
                    ? '✈️ FRET AÉRIEN RÉGULIER'
                    : '🚢 FRET MARITIME'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">

          {/* 8-Step Timeline */}
          <div className="bg-[#F4F6F9] border border-[#E2E8F0] p-6">
            <div className="text-xs font-bold text-[#042442] uppercase tracking-wider mb-2">
              Avancement Logistique
            </div>
            <TrackingTimeline
              currentStatus={shipment.status}
              history={shipment.statusHistory || []}
              transportMode={shipment.shippingMode || shipment.transportMode}
            />
          </div>

          {/* OTP Pickup Pin if ready or delivered */}
          {(isReady || isDelivered) && (
            <div className="bg-red-50 border-2 border-[#E2001A] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E2001A] text-white flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#E2001A] uppercase tracking-wider">
                    Code PIN de Retrait Sécurisé (OTP)
                  </div>
                  <div className="text-3xl font-black font-mono text-[#042442] tracking-widest mt-0.5">
                    {shipment.pickupPin || '1234'}
                  </div>
                  <div className="text-xs text-[#475569]">
                    Présentez ce code au dépôt de  Dakar pour la remise de vos colis.
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyPin}
                className={`px-4 py-2 border text-xs font-bold uppercase transition shrink-0 flex items-center gap-1.5 ${pinCopied
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-[#E2001A] text-[#E2001A] hover:bg-[#E2001A] hover:text-white'
                  }`}
              >
                {pinCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {pinCopied ? 'PIN Copié !' : 'Copier le PIN'}
              </button>
            </div>
          )}

          {/* Grid Shipment Info & Financial situation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Box 1: Shipment Characteristics */}
            <div className="bg-white border border-[#E2E8F0] p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#042442] uppercase tracking-wider border-b border-slate-100 pb-2">
                Détails du Colis
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Destinataire :</span>
                  <span className="font-bold text-[#042442]">{shipment.client?.fullName || shipment.senderName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Téléphone :</span>
                  <span className="font-bold text-[#042442]">{shipment.client?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">
                    {(shipment.shippingMode || shipment.transportMode)?.startsWith('AIR') ? 'Poids facturable :' : 'Volume CBM :'}
                  </span>
                  <span className="font-bold text-[#042442]">
                    {(shipment.shippingMode || shipment.transportMode)?.startsWith('AIR')
                      ? `${shipment.weight || 0} Kg`
                      : (shipment.cbm ? `${shipment.cbm.toFixed(3)} CBM` : `${shipment.weight || 0} Kg`)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nombre de cartons :</span>
                  <span className="font-bold text-[#042442]">{shipment.packageCount || shipment.quantity || 1}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">
                    {(shipment.shippingMode || shipment.transportMode)?.startsWith('AIR') ? 'Vol / Expédition :' : 'Conteneur :'}
                  </span>
                  <span className="font-bold text-[#042442] font-mono">
                    {shipment.container?.containerNumber || ((shipment.shippingMode || shipment.transportMode)?.startsWith('AIR') ? 'Vol Régulier Guangzhou CAN' : 'En attente groupage')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Description :</span>
                  <span className="font-bold text-[#042442] truncate block">{shipment.description || 'Marchandise générale'}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Financial Situation */}
            <div className="bg-white border border-[#E2E8F0] p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#042442] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Situation Financière</span>
                <span className={`text-[10px] px-2 py-0.5 font-bold uppercase ${remaining === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-[#E2001A]'
                  }`}>
                  {remaining === 0 ? 'Réglé' : 'Solde restant'}
                </span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant total du fret :</span>
                  <span className="font-bold text-[#042442]">{formatFCFA(shipment.totalAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Versements effectués :</span>
                  <span className="font-bold text-emerald-600">{formatFCFA(shipment.paidAmount || 0)}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-bold text-[#E2001A]">Reste à payer :</span>
                  <span className="text-base font-black text-[#E2001A] font-mono">
                    {formatFCFA(remaining)}
                  </span>
                </div>
              </div>

              {/* PDF Invoice Button */}
              <div className="pt-2">
                <button
                  onClick={() => generateInvoicePDF(shipment)}
                  className="w-full py-2 bg-[#042442] hover:bg-[#083863] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger Facture PDF
                </button>
              </div>
            </div>

          </div>

          {/* Payment Receipts list if any */}
          {shipment.payments && shipment.payments.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] p-5">
              <h4 className="text-xs font-bold text-[#042442] uppercase tracking-wider mb-3">
                Historique des Reçus de Caisse
              </h4>
              <div className="space-y-2">
                {shipment.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-2 px-3 bg-[#F4F6F9] border border-slate-200">
                    <div>
                      <span className="font-bold text-[#042442]">{formatFCFA(p.amount)}</span>
                      <span className="text-slate-400 ml-2">via {p.method} ({p.reference || 'Agence'})</span>
                    </div>
                    <button
                      onClick={() => generateReceiptPDF(p, shipment)}
                      className="text-[#E2001A] hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Reçu PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Support Direct WhatsApp button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#475569]">
              Une question concernant cette expédition ? Nos agents à Dakar vous répondent immédiatement.
            </p>
            <a
              href={getWASupportUrl(shipment.trackingCode, `Statut : ${shipment.status}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Contacter le support WhatsApp
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
