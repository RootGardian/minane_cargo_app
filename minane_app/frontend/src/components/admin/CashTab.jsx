import React from 'react';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

export default function CashTab({
  receivables = { totalGlobalDebt: 0, receivables: [], count: 0 },
  recentPayments = [],
  shipments = [],
  onOpenPaymentModal
}) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Créances Restantes</span>
          <div className="text-3xl font-black text-[#E2001A] mt-1">
            {formatFCFA(receivables.totalGlobalDebt)}
          </div>
          <span className="text-[11px] text-slate-400">
            {receivables.count || (receivables.receivables?.length || 0)} colis non soldés
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Contrôle Retrait Sécurisé</span>
          <div className="text-sm font-bold text-[#042442] mt-2 uppercase">
            PIN 4 chiffres + Solde à 0
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Le retrait est strictement bloqué au guichet si le reste à payer est &gt; 0.
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Règlements Enregistrés</span>
          <div className="text-2xl font-black text-[#042442] mt-1">
            {recentPayments.length} Quittances
          </div>
          <span className="text-[11px] text-slate-400">Wave, OM, Cash, Virement</span>
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
            Tableau des Créances & Impayés Fret
          </h2>
          <p className="text-xs text-slate-500">
            Liste des expéditions dont le reste à payer est supérieur à zéro.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#042442] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code Colis</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Total Facturé</th>
                <th className="py-3 px-4">Encaissé</th>
                <th className="py-3 px-4">Reste à Payer</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!receivables.receivables || receivables.receivables.length === 0) ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                    Aucune créance en attente. Tous les colis sont soldés !
                  </td>
                </tr>
              ) : (
                receivables.receivables.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#042442]">{r.trackingCode}</td>
                    <td className="py-3 px-4 font-bold text-[#042442]">{r.client.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">{r.client.phone}</td>
                    <td className="py-3 px-4 font-semibold text-[#042442]">{formatFCFA(r.totalAmount)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{formatFCFA(r.totalPaid)}</td>
                    <td className="py-3 px-4 font-black text-[#E2001A]">{formatFCFA(r.remainingBalance)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const found = shipments.find(s => s.id === r.id);
                          if (found) {
                            onOpenPaymentModal(found);
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition"
                      >
                        Encaisser
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

