import React from 'react';

export default function SettingsTab({
  settingsForm,
  setSettingsForm,
  onSaveSettings
}) {
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
        {/* Pricing Settings (Exclusivement Fret Maritime) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
              Tarif Maritime Groupage (FCFA / CBM)
            </label>
            <input
              type="number"
              value={settingsForm.maritimeCbmRate}
              onChange={(e) => setSettingsForm({ ...settingsForm, maritimeCbmRate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 font-bold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tarif de référence appliqué automatiquement au calcul de fret maritime dédouané.
            </p>
          </div>
        </div>

        {/* Departure Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
              Date Limite Réception Chine (Cut-off)
            </label>
            <input
              type="date"
              value={settingsForm.nextCutoffDate}
              onChange={(e) => setSettingsForm({ ...settingsForm, nextCutoffDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
              Date de Chargement Conteneur
            </label>
            <input
              type="date"
              value={settingsForm.nextLoadingDate}
              onChange={(e) => setSettingsForm({ ...settingsForm, nextLoadingDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase mb-1">
              Date Arrivée Estimée à Dakar (ETA)
            </label>
            <input
              type="date"
              value={settingsForm.nextEstimatedArrival}
              onChange={(e) => setSettingsForm({ ...settingsForm, nextEstimatedArrival: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 font-semibold text-[#042442] rounded-none focus:outline-none focus:border-[#042442]"
            />
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
    </div>
  );
}

