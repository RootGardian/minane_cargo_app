import React from 'react';
import { Plus } from 'lucide-react';

export default function ContainersTab({
  containers = [],
  onOpenCreateContainer,
  onOpenBulkStatus
}) {
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F7FA] p-4 border border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
            Suivi des Conteneurs Maritimes & Groupage
          </h2>
          <p className="text-xs text-slate-500">
            Mise à jour par lot du statut de l'ensemble des colis rattachés au conteneur.
          </p>
        </div>

        <button
          onClick={onOpenCreateContainer}
          className="px-5 py-2.5 bg-[#042442] hover:bg-[#001736] text-white text-xs font-bold uppercase tracking-wider transition rounded-none flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Conteneur</span>
        </button>
      </div>

      {/* Containers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {containers.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 p-8 text-center text-slate-400 font-medium">
            Aucun conteneur enregistré pour le moment.
          </div>
        ) : (
          containers.map((c) => (
            <div key={c.id} className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono font-black text-xl text-[#042442] block">
                    {c.containerNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    Plomb : {c.sealNumber || 'N/A'} • {c.shipmentCount || (c.shipments?.length || 0)} colis empotés
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

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenBulkStatus(c)}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-[#042442] hover:text-white text-[#042442] font-bold text-xs uppercase tracking-wider transition text-center"
                >
                  Mise à jour par lot (Bulk Status)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

