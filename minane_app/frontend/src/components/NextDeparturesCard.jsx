import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const formatDisplayDate = (dateVal) => {
  if (!dateVal) return '25/11/26';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '25/11/26';
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  } catch (e) {
    return '25/11/26';
  }
};

export default function NextDeparturesCard({ settings }) {
  const cutoffDate = formatDisplayDate(settings?.nextCutoffDate);
  const departureDate = formatDisplayDate(settings?.nextDepartureDate);
  const arrivalDate = formatDisplayDate(settings?.nextArrivalDate);
  const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  const seaRate = settings?.maritimeCbmRate || 165000;

  return (
    <section id="actualites" className="bg-[#F4F6F9] py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-light text-[#042442] tracking-tight">
              Actualités & Informations Maritimes
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              Bulletins d'empotage, escales portuaires et avis tarifaires
            </p>
          </div>
          <a
            href="#simulateur"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E2001A] hover:underline"
          >
            Simulateur de fret →
          </a>
        </div>

        {/* 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT: Featured Visual Article Card (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] overflow-hidden flex flex-col group">

            {/* Visual Container Port image */}
            <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-900">
              <img
                src="/service_port.jpeg"
                alt="Port de Nansha / Dakar"
                className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white text-[#042442] px-3 py-1 text-[11px] font-bold uppercase tracking-widest shadow-sm">
                ACTUALITÉS
              </div>
            </div>

            {/* Content under image */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#E2001A] tracking-wider font-mono">
                  {departureDate}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#042442] mt-2 group-hover:text-[#E2001A] transition leading-snug">
                  Chargement conteneur maritime groupage (LCL) au port de Nansha → Dakar
                </h3>
                <p className="text-sm text-[#475569] mt-3 line-clamp-2">
                  La clôture de dépôt dans nos entrepôts de Guangzhou est fixée au {cutoffDate}. Empotage direct et scellé haute sécurité pour une arrivée estimée au port de Dakar le {arrivalDate}.
                </p>
              </div>

              <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Service Fret Maritime Régulier</span>
                <span className="text-[#E2001A] font-bold inline-flex items-center gap-1 group-hover:underline uppercase tracking-wider">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Chronological Announcements List (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col justify-between space-y-6">

            {/* Item 1 */}
            <div className="border-b border-[#E2E8F0] pb-5 group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E2001A] font-mono tracking-wider">
                  CLÔTURE : {cutoffDate}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h4 className="text-base font-bold text-[#042442] mt-1 group-hover:text-[#E2001A] transition underline underline-offset-2">
                Cut-off Chine : Clôture impérative des réceptions colis à Guangzhou
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Tout colis livré après 18h00 sera reporté sur l'empotage suivant.
              </p>
            </div>

            {/* Item 2 */}
            <div className="border-b border-[#E2E8F0] pb-5 group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E2001A] font-mono tracking-wider">
                  ESTIMATION : {arrivalDate}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h4 className="text-base font-bold text-[#042442] mt-1 group-hover:text-[#E2001A] transition underline underline-offset-2">
                ETA Dakar : Arrivée et mise à quai à Dakar.
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Début des opérations de dépotage et dédouanement immédiat sous 48h.
              </p>
            </div>

            {/* Item 3 */}
            <div className="border-b border-[#E2E8F0] pb-5 group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E2001A] font-mono tracking-wider">
                  GRILLE TARIFAIRE ACTIVE
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h4 className="text-base font-bold text-[#042442] mt-1 group-hover:text-[#E2001A] transition underline underline-offset-2">
                Maintien du tarif FAK Groupage LCL à {formatFCFA(seaRate)} le CBM dédouané
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Aucun frais caché à Dakar. Manutention et transit sécurisé inclus.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
