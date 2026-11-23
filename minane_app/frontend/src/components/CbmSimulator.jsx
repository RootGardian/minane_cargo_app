import React, { useState } from 'react';
import { Calculator, Ship, Plane, Check, ArrowRight, Calendar } from 'lucide-react';
import { getCompanyInfo, cleanPhoneForWA } from '../utils/company';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

const formatDisplayDate = (dateVal) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  } catch (e) {
    return null;
  }
};

export default function CbmSimulator({ settings }) {
  const company = getCompanyInfo(settings);
  const waTargetPhone = cleanPhoneForWA(company.phoneDakar);

  // Mode switcher: 'MARITIME' | 'AIR'
  const [transportMode, setTransportMode] = useState('MARITIME');

  // Maritime Inputs (cm)
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [cartonCount, setCartonCount] = useState('');

  // Air Inputs (kg) — Vol normal uniquement, pas de délai
  const [airWeight, setAirWeight] = useState('');
  const [airCartonCount, setAirCartonCount] = useState('');

  // Active Tariffs from settings or defaults
  const seaRate = settings?.maritimeCbmRate || 165000;
  const airRate = settings?.airNormalKgRate || 8500;

  // Flight dates
  const nextAirCutoff = formatDisplayDate(settings?.nextAirCutoffDate) || 'Jeudi';
  const nextAirDeparture = formatDisplayDate(settings?.nextAirDepartureDate) || 'Samedi';
  const nextAirArrival = formatDisplayDate(settings?.nextAirArrivalDate) || 'Semaine suivante';

  // Validation
  const hasValidMaritimeInput = Number(length) > 0 && Number(width) > 0 && Number(height) > 0 && Number(cartonCount) > 0;
  const hasValidAirInput = Number(airWeight) > 0;

  // Calculations
  const calculateMaritimeResult = () => {
    const singleBoxCbm = (Number(length || 0) * Number(width || 0) * Number(height || 0)) / 1000000;
    const totalCbm = singleBoxCbm * Number(cartonCount || 0);
    const totalAmount = Math.round(totalCbm * seaRate);
    return {
      unit: `${totalCbm.toFixed(3)} m³ (CBM)`,
      rateApplied: `${formatFCFA(seaRate)} / CBM`,
      totalAmount,
      details: `${cartonCount} colis de ${length}×${width}×${height} cm`,
    };
  };

  const calculateAirResult = () => {
    const totalAmount = Math.round(Number(airWeight || 0) * airRate);
    return {
      unit: `${Number(airWeight || 0)} Kg`,
      rateApplied: `${formatFCFA(airRate)} / Kg`,
      totalAmount,
      details: `Fret Aérien Régulier${airCartonCount ? ` — ${airCartonCount} colis` : ''}`,
    };
  };

  const isMaritime = transportMode === 'MARITIME';
  const hasValidInput = isMaritime ? hasValidMaritimeInput : hasValidAirInput;
  const result = isMaritime ? calculateMaritimeResult() : calculateAirResult();

  return (
    <section id="simulateur" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E2001A] uppercase tracking-widest mb-2">
            {isMaritime ? <Ship className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
            {isMaritime ? 'Fret Maritime Groupage (LCL & FCL)' : 'Fret Aérien Régulier (Chine ➔ Dakar)'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-[#042442] tracking-tight">
            Simulateur de Fret Chine ➔ {company.addressDakar}
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-3">
            Obtenez immédiatement une estimation précise et dédouanée pour vos expéditions au départ de nos entrepôts de Guangzhou vers {company.addressDakar}.
          </p>
        </div>

        {/* Transport Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setTransportMode('MARITIME')}
            className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition border ${
              isMaritime
                ? 'bg-[#042442] text-white border-[#042442] shadow-sm'
                : 'bg-[#F4F6F9] text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Fret Maritime (au m³ / CBM)</span>
          </button>

          <button
            type="button"
            onClick={() => setTransportMode('AIR')}
            className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition border ${
              !isMaritime
                ? 'bg-[#E2001A] text-white border-[#E2001A] shadow-sm'
                : 'bg-[#F4F6F9] text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Fret Aérien (au Kg)</span>
          </button>
        </div>

        {/* 2-Column Calculator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT: Inputs Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#F4F6F9] border border-[#E2E8F0] p-6 sm:p-8 space-y-6">

            {isMaritime ? (
              /* MARITIME FORM */
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-[#042442] uppercase tracking-wider">
                    Dimensions d'un carton (en centimètres)
                  </span>
                  <div className="flex items-center gap-3">
                    {(length || width || height || cartonCount) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLength('');
                          setWidth('');
                          setHeight('');
                          setCartonCount('');
                        }}
                        className="text-[11px] font-bold text-[#E2001A] hover:underline"
                      >
                        Effacer tout ✕
                      </button>
                    )}
                    <span className="text-xs text-slate-500 font-mono">Longueur × Largeur × Hauteur</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Longueur (cm)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="ex: 50"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] text-[#042442] font-semibold text-sm rounded-none focus:outline-none focus:border-[#042442]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Largeur (cm)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="ex: 40"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] text-[#042442] font-semibold text-sm rounded-none focus:outline-none focus:border-[#042442]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Hauteur (cm)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="ex: 40"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] text-[#042442] font-semibold text-sm rounded-none focus:outline-none focus:border-[#042442]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042442] uppercase tracking-wider mb-1">
                    Nombre total de colis / cartons identiques
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="ex: 5"
                    value={cartonCount}
                    onChange={(e) => setCartonCount(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#042442] font-semibold text-sm rounded-none focus:outline-none focus:border-[#042442]"
                  />
                </div>

                <p className="text-xs text-slate-500 italic">
                  * Formule standard maritime internationale : (Longueur × Largeur × Hauteur en cm) ÷ 1 000 000 × Quantité.
                </p>
              </div>
            ) : (
              /* AIR FREIGHT FORM */
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Fret Aérien : Prix Fixe au Kilogramme
                  </span>
                  {airWeight && (
                    <button
                      type="button"
                      onClick={() => {
                        setAirWeight('');
                        setAirCartonCount('');
                      }}
                      className="text-[11px] font-bold text-[#E2001A] hover:underline"
                    >
                      Effacer tout ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase tracking-wider mb-1">
                      Poids Total Réel (Kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      placeholder="ex: 15"
                      value={airWeight}
                      onChange={(e) => setAirWeight(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#042442] font-bold text-sm rounded-none focus:outline-none focus:border-[#E2001A]"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Pesée exacte effectuée à la réception dans notre entrepôt de Guangzhou.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#042442] uppercase tracking-wider mb-1">
                      Nombre de colis (Optionnel)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="ex: 2"
                      value={airCartonCount}
                      onChange={(e) => setAirCartonCount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#042442] font-semibold text-sm rounded-none focus:outline-none focus:border-[#042442]"
                    />
                  </div>
                </div>

                {/* Fixed dates for flight departures */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 text-xs text-[#042442] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[#042442] uppercase tracking-wide text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#E2001A]" />
                    Dates de Rotation Aérienne Chine (CAN) ➔ Dakar (AIBD)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div><span className="text-slate-500">Clôture Dépôt :</span> <strong>{nextAirCutoff}</strong></div>
                    <div><span className="text-slate-500">Départ Vol :</span> <strong>{nextAirDeparture}</strong></div>
                    <div><span className="text-slate-500">Arrivée AIBD :</span> <strong>{nextAirArrival}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Reassurance bullets */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#042442]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dédouanement complet inclus à {company.addressDakar}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Réception sécurisée à Guangzhou</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zéro taxe cachée à l'arrivée</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paiement à {company.addressDakar} (Wave, OM, Cash)</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Results Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-white border-2 border-[#042442] p-6 sm:p-8 flex flex-col justify-between shadow-lg">

            <div>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <span className="text-xs font-bold text-[#042442] uppercase tracking-widest">
                  {isMaritime ? 'ESTIMATION FRET MARITIME' : 'ESTIMATION FRET AÉRIEN'}
                </span>
                <span className="text-[10px] bg-[#E2001A] text-white font-bold px-2 py-0.5 uppercase tracking-wider">
                  DÉDOUANÉ {company.addressDakar.toUpperCase()}
                </span>
              </div>

              {hasValidInput ? (
                <div className="py-6 space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">
                      {isMaritime ? 'Volume total calculé' : 'Poids total facturable'}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#042442] font-mono mt-1">
                      {result.unit}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{result.details}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Tarif appliqué</div>
                    <div className="text-sm font-bold text-[#042442] mt-0.5">{result.rateApplied}</div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-xs font-bold text-[#E2001A] uppercase tracking-wider">Montant total estimé</div>
                    <div className="text-3xl sm:text-4xl font-black text-[#042442] font-mono tracking-tight mt-1">
                      {formatFCFA(result.totalAmount)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-[#042442] uppercase tracking-wider">
                    {isMaritime ? 'En attente de vos dimensions' : 'En attente du poids en Kg'}
                  </h4>
                  <p className="text-xs text-[#475569] max-w-xs mx-auto leading-relaxed">
                    {isMaritime
                      ? 'Saisissez la longueur, largeur, hauteur et le nombre de cartons ci-contre pour calculer instantanément le montant.'
                      : 'Indiquez le poids estimé en Kg de votre colis pour obtenir le coût direct dédouané à Dakar au prix fixe au kilogramme.'}
                  </p>
                  <div className="pt-2 text-xs text-slate-400">
                    Tarif en vigueur :{' '}
                    <strong className="text-[#042442]">
                      {isMaritime ? `${formatFCFA(seaRate)} / CBM` : `${formatFCFA(airRate)} / Kg`}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#E2E8F0] space-y-3">
              {hasValidInput ? (
                <a
                  href={`https://wa.me/${waTargetPhone}?text=${encodeURIComponent(
                    isMaritime
                      ? `Bonjour Minane Cargo, je souhaite expédier par conteneur maritime depuis la Chine : ${result.unit} pour une estimation de ${formatFCFA(result.totalAmount)}. Merci de me communiquer l'adresse de réception en Chine.`
                      : `Bonjour Minane Cargo, je souhaite expédier par fret aérien Chine ➔ Dakar : ${result.unit} pour une estimation de ${formatFCFA(result.totalAmount)}. Merci de me communiquer l'adresse de réception à Guangzhou pour le prochain vol fixe.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#042442] hover:bg-[#083863] text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2"
                >
                  <span>Confirmer l'expédition sur WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider text-center cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>{isMaritime ? 'Renseignez les dimensions' : 'Indiquez le poids en Kg'}</span>
                </button>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                Dès l'enregistrement du colis en Chine, un numéro de suivi officiel vous est remis pour suivre l'expédition en temps réel.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
