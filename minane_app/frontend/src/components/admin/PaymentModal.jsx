import React from 'react';
import { DollarSign } from 'lucide-react';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

export default function PaymentModal({
  isOpen,
  onClose,
  paymentShipment,
  payAmount,
  setPayAmount,
  payMethod,
  setPayMethod,
  payRef,
  setPayRef,
  onSubmit
}) {
  if (!isOpen || !paymentShipment) return null;

  return (
    <div
      onClick={onClose}
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
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-[#F5F7FA] border border-slate-200 text-xs space-y-1">
            <div>Client : <strong>{paymentShipment.client?.fullName}</strong></div>
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
              onClick={onClose}
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
  );
}

