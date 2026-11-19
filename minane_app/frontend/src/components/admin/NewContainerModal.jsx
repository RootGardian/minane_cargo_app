import React from 'react';
import { Container } from 'lucide-react';

export default function NewContainerModal({
  isOpen,
  onClose,
  newContainer,
  setNewContainer,
  onSubmit
}) {
  if (!isOpen) return null;

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
            <Container className="w-4 h-4 text-[#E2001A]" />
            Nouveau Conteneur
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
              onClick={onClose}
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
  );
}

