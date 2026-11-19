import React from 'react';

export default function BulkStatusModal({
  isOpen,
  onClose,
  selectedContainer,
  bulkNewStatus,
  setBulkNewStatus,
  bulkNote,
  setBulkNote,
  onSubmit
}) {
  if (!isOpen || !selectedContainer) return null;

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
          <h3 className="font-bold text-sm uppercase tracking-wider">
            Mise à jour groupée : {selectedContainer.containerNumber}
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
              onClick={onClose}
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
  );
}

