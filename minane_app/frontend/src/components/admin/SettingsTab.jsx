import React, { useState } from 'react';
import { api } from '../../services/api';

export default function SettingsTab({
  settingsForm,
  setSettingsForm,
  onSaveSettings,
  onDataReset
}) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  async function handleReset() {
    if (resetInput !== 'VIDER LA BASE') {
      setResetError('Phrase incorrecte. Tapez exactement : VIDER LA BASE');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await api.resetDatabase('VIDER LA BASE');
      setShowResetModal(false);
      setResetInput('');
      if (onDataReset) onDataReset();
      alert('✅ Base de données vidée avec succès. Tous les colis, conteneurs et règlements ont été supprimés.');
    } catch (err) {
      setResetError(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setResetLoading(false);
    }
  }
  if (!settingsForm) return null;

  return (
    <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">
          Paramètres Globaux & Grille Tarifaire Active
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ces tarifs et dates pilotent directement le simulateur et l'encart d'actualités maritimes de la Landing Page.
        </p>
      </div>

      <form onSubmit={onSaveSettings} className="space-y-6">
        {/* Section Fret Maritime : Tarifs & Départs */}
        <div className="bg-[#F8FAFC] p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🚢</span>
            <h3 className="text-xs font-bold text-[#042442] uppercase tracking-wider">
              Fret Maritime Groupage (Guangzhou / Nansha ➔ Port de Dakar)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Tarif Maritime Groupage (FCFA / CBM)
              </label>
              <input
                type="number"
                value={settingsForm.maritimeCbmRate}
                onChange={(e) => setSettingsForm({ ...settingsForm, maritimeCbmRate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442] bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tarif de référence appliqué automatiquement au calcul de fret maritime dédouané par CBM.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Date Limite Réception Chine (Cut-off Maritime)
              </label>
              <input
                type="date"
                value={settingsForm.nextCutoffDate}
                onChange={(e) => setSettingsForm({ ...settingsForm, nextCutoffDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 font-semibold text-[#042442] rounded-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Date de Chargement / Départ Conteneur
              </label>
              <input
                type="date"
                value={settingsForm.nextLoadingDate}
                onChange={(e) => setSettingsForm({ ...settingsForm, nextLoadingDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 font-semibold text-[#042442] rounded-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Date Arrivée Estimée à Dakar (ETA Port)
              </label>
              <input
                type="date"
                value={settingsForm.nextEstimatedArrival}
                onChange={(e) => setSettingsForm({ ...settingsForm, nextEstimatedArrival: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 font-semibold text-[#042442] rounded-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section Fret Aérien : Tarifs au Kg & Vols Fixes */}
        <div className="bg-[#FFF9F9] p-4 border border-rose-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✈️</span>
            <h3 className="text-xs font-bold text-[#E2001A] uppercase tracking-wider">
              Groupage Aérien Express & Standard (Guangzhou CAN ➔ Dakar AIBD)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Tarif Aérien Standard (FCFA / Kg) — 7 à 10 jours
              </label>
              <input
                type="number"
                value={settingsForm.airNormalKgRate || 8500}
                onChange={(e) => setSettingsForm({ ...settingsForm, airNormalKgRate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#E2001A] bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Prix fixe par kilogramme pour le groupage cargo régulier.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Tarif Aérien Express (FCFA / Kg) — 3 à 5 jours
              </label>
              <input
                type="number"
                value={settingsForm.airExpressKgRate || 11000}
                onChange={(e) => setSettingsForm({ ...settingsForm, airExpressKgRate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#E2001A] bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Prix fixe par kilogramme pour expédition ultra-rapide par avion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Date Clôture Dépôt Aérien Chine
              </label>
              <input
                type="date"
                value={settingsForm.nextAirCutoffDate || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, nextAirCutoffDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 font-semibold text-[#042442] rounded-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Date Fixe Décollage Vol (Chine CAN)
              </label>
              <input
                type="date"
                value={settingsForm.nextAirDepartureDate || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, nextAirDepartureDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 font-semibold text-[#042442] rounded-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Date Estimée Arrivée Dakar (AIBD)
              </label>
              <input
                type="date"
                value={settingsForm.nextAirArrivalDate || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, nextAirArrivalDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 font-semibold text-[#042442] rounded-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées Officielles & Numéros WhatsApp */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
              Coordonnées Officielles & Numéros WhatsApp (Agences Dakar & Chine)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ces numéros et adresses s'appliquent immédiatement à toute la plateforme (liens WhatsApp, Navbar, Footer, Pages Légales et messages clients).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Téléphone & WhatsApp Agence Dakar
              </label>
              <input
                type="text"
                value={settingsForm.phoneDakar || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, phoneDakar: e.target.value })}
                placeholder="+221 70 596 12 76"
                className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Numéro principal utilisé pour les notifications et le support WhatsApp.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Adresse Agence Dakar (Nom officiel)
              </label>
              <input
                type="text"
                value={settingsForm.addressDakar || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, addressDakar: e.target.value })}
                placeholder="Dakar"
                className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Indication de l'agence à Dakar (ex: Dakar).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Téléphone Chine (Guangzhou)
              </label>
              <input
                type="text"
                value={settingsForm.phoneGuangzhou || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, phoneGuangzhou: e.target.value })}
                placeholder="+86 137 1104 5051"
                className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
                Ligne Sénégal de l'agence Guangzhou
              </label>
              <input
                type="text"
                value={settingsForm.phoneGuangzhouSn || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, phoneGuangzhouSn: e.target.value })}
                placeholder="+221 70 596 12 76"
                className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
              Adresse complète Agence Guangzhou
            </label>
            <input
              type="text"
              value={settingsForm.addressGuangzhou || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, addressGuangzhou: e.target.value })}
              placeholder="Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road, Guangzhou"
              className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#042442] hover:bg-[#001736] text-white text-xs font-bold uppercase tracking-wider transition rounded-none"
        >
          Enregistrer les Nouveaux Paramètres
        </button>
      </form>

      {/* ─── Zone Dangereuse ──────────────────────────────────────────── */}
      <div className="border-t-2 border-red-200 pt-6 mt-4">
        <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-2">
          <span>⚠️</span> Zone Dangereuse — Réinitialisation des Données
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Cette action supprime <strong>définitivement</strong> tous les colis, conteneurs, règlements et clients de la base de données.
          Les paramètres et le compte administrateur sont conservés. <strong>Cette action est irréversible.</strong>
        </p>
        <button
          type="button"
          onClick={() => { setShowResetModal(true); setResetInput(''); setResetError(''); }}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition rounded-none"
        >
          🗑️ Vider toutes les données opérationnelles
        </button>
      </div>

      {/* ─── Modale de confirmation Reset ────────────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md shadow-2xl">
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                ⚠️ Confirmation — Vider la base de données
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                Vous êtes sur le point de <strong className="text-red-600">supprimer définitivement</strong> :
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 bg-red-50 border border-red-200 p-3">
                <li>Tous les colis & expéditions</li>
                <li>Tous les conteneurs & frais P&L</li>
                <li>Tous les règlements & quittances</li>
                <li>Tous les historiques de statut</li>
                <li>Tous les clients enregistrés</li>
              </ul>
              <p className="text-xs text-slate-600">
                Pour confirmer, tapez exactement : <strong className="font-mono text-red-700">VIDER LA BASE</strong>
              </p>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="VIDER LA BASE"
                className="w-full px-4 py-2.5 border-2 border-red-300 font-mono text-sm focus:outline-none focus:border-red-600 rounded-none"
                autoFocus
              />
              {resetError && (
                <p className="text-xs text-red-600 font-semibold">{resetError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold uppercase hover:bg-slate-50 transition rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetLoading || resetInput !== 'VIDER LA BASE'}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-none"
                >
                  {resetLoading ? 'Suppression...' : '🗑️ Confirmer la suppression'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

