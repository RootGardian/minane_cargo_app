import React from 'react';
import { ArrowUpRight, Plane, Ship, ShieldCheck } from 'lucide-react';

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

  const airCutoff = formatDisplayDate(settings?.nextAirCutoffDate) || 'Jeudi 18h';
  const airDeparture = formatDisplayDate(settings?.nextAirDepartureDate) || 'Samedi';
  const airArrival = formatDisplayDate(settings?.nextAirArrivalDate) || 'Semaine suivante';

  const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  const seaRate = settings?.maritimeCbmRate || 165000;
  const airRate = settings?.airNormalKgRate || 8500;

  return (
    <section id="actualites" className="bg-[#F4F6F9] py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-light text-[#042442] tracking-tight">
              Actualités & Prochains Départs Fixes (Maritime & Aérien)
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              Bulletins d'empotage maritime, rotations aériennes et avis tarifaires
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
                FRET MARITIME & AÉRIEN
              </div>
            </div>

            {/* Content under image */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#E2001A] tracking-wider font-mono flex items-center gap-1">
                    <Ship className="w-3.5 h-3.5" /> DÉPART MARITIME : {departureDate}
                  </span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs font-bold text-sky-700 tracking-wider font-mono flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5" /> VOL FIXE AÉRIEN : {airDeparture}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#042442] mt-2 group-hover:text-[#E2001A] transition leading-snug">
                  Corridor Sécurisé Guangzhou ➔ Dakar : Départs réguliers avec numéro de suivi
                </h3>
                <p className="text-sm text-[#475569] mt-3 leading-relaxed">
                  <strong>Maritime Groupage (LCL) :</strong> Clôture dépôt au {cutoffDate} pour arrivée port de Dakar le {arrivalDate} à {formatFCFA(seaRate)} / CBM.<br />
                  <strong>Fret Aérien Régulier :</strong> Départs hebdomadaires fixes le {airDeparture} (clôture {airCutoff}) avec arrivée AIBD le {airArrival} à {formatFCFA(airRate)} / Kg.
                </p>
              </div>

              <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Suivi de bout en bout dès l'attribution du code d'expédition
                </span>
                <span className="text-[#E2001A] font-bold inline-flex items-center gap-1 group-hover:underline uppercase tracking-wider">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Chronological Announcements List (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col justify-between space-y-6">

            {/* Item 1: Cut-off Maritime */}
            <div className="border-b border-[#E2E8F0] pb-5 group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E2001A] font-mono tracking-wider flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5" /> MARITIME CUT-OFF : {cutoffDate}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h4 className="text-base font-bold text-[#042442] mt-1 group-hover:text-[#E2001A] transition underline underline-offset-2">
                Clôture réceptions colis Guangzhou pour conteneur maritime
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Arrivée estimée au port de Dakar le {arrivalDate}. Tarif FAK dédouané {formatFCFA(seaRate)} / CBM.
              </p>
            </div>

            {/* Item 2: Vol Fixe Aérien */}
            <div className="border-b border-[#E2E8F0] pb-5 group cursor-pointer bg-rose-50/50 -mx-3 p-3 border-l-4 border-l-[#E2001A]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E2001A] font-mono tracking-wider flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5" /> VOL FIXE CARGO : {airDeparture}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h4 className="text-base font-bold text-[#042442] mt-1 group-hover:text-[#E2001A] transition underline underline-offset-2">
                Rotation Cargo Aérien Guangzhou CAN ➔ Dakar AIBD
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Clôture de pesée le <strong>{airCutoff}</strong>. Tarif fixe dédouané : <strong>{formatFCFA(airRate)} / Kg</strong>.
              </p>
            </div>

            {/* Item 3: Guichet Sandaga & Suivi */}
            <div className="pb-2 group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 font-mono tracking-wider">
                  PORTAIL DE SUIVI & RETRAIT SÉCURISÉ
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h4 className="text-base font-bold text-[#042442] mt-1 group-hover:text-[#E2001A] transition underline underline-offset-2">
                Suivi complet en ligne dès remise du code de suivi
              </h4>
              <p className="text-xs text-[#475569] mt-1">
                Les clients visualisent toutes les étapes, factures et code PIN dès la communication de leur numéro de suivi MNC.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
