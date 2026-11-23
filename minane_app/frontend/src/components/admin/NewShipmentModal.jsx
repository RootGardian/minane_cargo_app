import React from 'react';
import { Package } from 'lucide-react';

export default function NewShipmentModal({
  isOpen,
  onClose,
  newShipment,
  setNewShipment,
  clients = [],
  containers = [],
  settings,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
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
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                  <option value="MARITIME_LCL">Maritime Groupage (LCL / CBM)</option>
                  <option value="MARITIME_FCL">Maritime Conteneur Plein (FCL)</option>
                  <option value="AIR_NORMAL">Fret Aérien Régulier (au Kg)</option>
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
                  {newShipment.transportMode?.startsWith('AIR') ? 'Vol / Lot Assigné' : 'Conteneur Assigné'}
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
              <div className={newShipment.transportMode?.startsWith('AIR') ? 'opacity-70' : ''}>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Volume CBM (m³) {!newShipment.transportMode?.startsWith('AIR') && <span className="text-[#E2001A]">* (Base facturation)</span>}
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
              <div className={newShipment.transportMode?.startsWith('AIR') ? 'p-1 bg-red-50 border border-red-200' : ''}>
                <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                  Poids (Kg) {newShipment.transportMode?.startsWith('AIR') && <span className="text-[#E2001A] font-black">* (Base facturation Aérien)</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex : 25"
                  value={newShipment.weight}
                  onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-bold rounded-none"
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
              {newShipment.transportMode === 'AIR_NORMAL'
                ? `Tarif Aérien actif : ${settings?.airNormalKgRate || 8500} FCFA / Kg.`
                : `Tarif Maritime actif : ${settings?.maritimeCbmRate || 165000} FCFA / CBM.`
              }
              {' '}Vous pouvez écraser manuellement le tarif unitaire ou le montant total pour un client VIP.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tarif Unitaire Personnalisé (FCFA / {newShipment.transportMode === 'AIR_NORMAL' ? 'Kg' : 'CBM'})
                </label>
                <input
                  type="number"
                  placeholder={
                    newShipment.transportMode === 'AIR_NORMAL'
                      ? `Défaut : ${settings?.airNormalKgRate || 8500} FCFA/Kg`
                      : `Défaut : ${settings?.maritimeCbmRate || 165000} FCFA/CBM`
                  }
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
              onClick={onClose}
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
  );
}

