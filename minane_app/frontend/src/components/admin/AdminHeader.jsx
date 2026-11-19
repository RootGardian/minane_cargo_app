import React from 'react';
import { RefreshCw, LogOut, Package, Container, CreditCard, Settings as SettingsIcon } from 'lucide-react';

export default function AdminHeader({
  adminUser,
  onLogout,
  loading,
  loadData,
  activeTab,
  setActiveTab,
  shipmentsCount = 0,
  containersCount = 0
}) {
  return (
    <div className="space-y-6">
      {/* Top Admin Navy Banner (CMA CGM Corporate Style) */}
      <div className="bg-[#042442] text-white p-6 sm:p-8 border-l-4 border-[#E2001A] flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-300 uppercase block font-serif">
            PORTAIL OPÉRATIONNEL & GESTION DU CORRIDOR
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Back-Office Minane Cargo (Dakar - Chine)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Direction des Opérations : Guangzhou & Yiwu ➔ Port de Dakar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white uppercase tracking-wider transition rounded-none"
            title="Recharger les données fraîches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#E2001A] hover:bg-[#B8001A] text-xs font-bold text-white uppercase tracking-wider transition rounded-none"
            title="Fermer la session administrateur"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto bg-white pt-2 px-2">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative flex items-center gap-2 ${
            activeTab === 'shipments'
              ? 'text-[#042442] border-b-2 border-[#E2001A]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4 text-[#E2001A]" />
          <span>Colis & Expéditions ({shipmentsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('containers')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative flex items-center gap-2 ${
            activeTab === 'containers'
              ? 'text-[#042442] border-b-2 border-[#E2001A]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Container className="w-4 h-4 text-[#1A8BD6]" />
          <span>Conteneurs & P&L ({containersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('cash')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative flex items-center gap-2 ${
            activeTab === 'cash'
              ? 'text-[#042442] border-b-2 border-[#E2001A]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Caisse & Règlements</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition relative flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'text-[#042442] border-b-2 border-[#E2001A]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-slate-600" />
          <span>Paramètres & Taux</span>
        </button>
      </div>
    </div>
  );
}

