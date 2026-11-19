import React from 'react';
import { KeyRound } from 'lucide-react';

export default function DeliverModal({
  isOpen,
  onClose,
  deliverShipment,
  inputPickupPin,
  setInputPickupPin,
  onSubmit
}) {
  if (!isOpen || !deliverShipment) return null;

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
            <KeyRound className="w-4 h-4 text-[#E2001A]" />
            Validation Retrait Colis : {deliverShipment.trackingCode}
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
            <div>Client : <strong>{deliverShipment.client?.fullName}</strong></div>
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
              onClick={onClose}
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
  );
}

