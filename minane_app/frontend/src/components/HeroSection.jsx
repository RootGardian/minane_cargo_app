import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Play, Pause, Ship, Plane } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: '/hero_ship.jpeg',
    title: 'Fret Maritime & Fret Aérien Régulier Chine ➔ Dakar',
    subtitle: 'Groupage conteneurs LCL au m³ & Fret aérien régulier au Kg'
  },
  {
    image: '/service_port.jpeg',
    title: 'Liaisons maritimes et aériennes continues vers le Sénégal',
    subtitle: 'Consolidation Chine (Guangzhou) & Dédouanement complet à Dakar'
  },
  {
    image: '/service_maritime.jpeg',
    title: 'Sécurité et traçabilité intégrale de vos marchandises',
    subtitle: 'Suivi en direct dès l\'attribution du numéro de suivi MNC'
  },
  {
    image: '/service_warehouse.jpeg',
    title: 'Hubs logistiques et consolidation de fret en Chine',
    subtitle: 'Entrepôts Guangzhou • Réception continue 6 jours sur 7'
  }
];

export default function HeroSection({ onTrack, trackingLoading, settings }) {
  const [activeWidgetTab, setActiveWidgetTab] = useState('TRACKING'); // TRACKING | PRIX
  const [trackingCode, setTrackingCode] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  const seaRate = settings?.maritimeCbmRate || 165000;
  const airRate = settings?.airNormalKgRate || 8500;

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      onTrack(trackingCode.trim().toUpperCase());
      setTrackingCode('');
    }
  };

  return (
    <section className="relative bg-[#042442]">

      {/* Container Ship Ocean Background with Auto-Sliding Images */}
      <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] w-full flex items-center overflow-hidden">

        {/* Carousel Background Images with smooth crossfade and sharpness optimization */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${idx === currentSlide
                ? 'opacity-100 z-0'
                : 'opacity-0 -z-10 pointer-events-none'
              }`}
            style={{
              backgroundImage: `url('${slide.image}')`,
              backgroundPosition: 'center 42%',
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(106%) brightness(92%) saturate(105%)'
            }}
          />
        ))}

        {/* Navy oceanic overlay gradient with vignette for desktop anti-blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001433] via-[#001f3d]/90 to-[#001433]/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#042442] via-transparent to-[#001433]/60 z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl space-y-6">

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest">
              <span>Maritime (CBM) & Aérien (Kg)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.12] transition-opacity duration-500 min-h-[140px] sm:min-h-[170px]">
              {HERO_SLIDES[currentSlide].title}
              <span className="block font-light text-slate-200 text-2xl sm:text-4xl mt-2">
                {HERO_SLIDES[currentSlide].subtitle}
              </span>
            </h1>

            <div>
              <a
                href="#services"
                className="inline-block px-7 py-3.5 bg-[#E2001A] hover:bg-[#B8001A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none transition shadow-sm"
              >
                Découvrez nos services
              </a>
            </div>

            {/* Slider navigation controls (interactive & auto-sliding) */}
            <div className="flex items-center gap-3 pt-6 text-white/80 text-xs select-none">

              {/* Prev Arrow */}
              <button
                onClick={handlePrevSlide}
                title="Image précédente"
                className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center hover:text-white hover:border-white hover:bg-white/10 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dot indicators */}
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  title={`Slide ${idx + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide
                      ? 'w-6 bg-white'
                      : 'w-3 bg-white/40 hover:bg-white/70'
                    }`}
                />
              ))}

              {/* Next Arrow */}
              <button
                onClick={handleNextSlide}
                title="Image suivante"
                className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center hover:text-white hover:border-white hover:bg-white/10 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Play/Pause Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Mettre en pause le défilement automatique" : "Reprendre le défilement automatique"}
                className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center hover:text-white hover:border-white hover:bg-white/10 transition ml-1"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* Floating White Quick Tools Widget */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 pb-12">
        <div className="bg-white shadow-[0_12px_40px_rgba(4,36,66,0.12)] border border-[#E2E8F0] max-w-4xl p-6 sm:p-8">

          {/* Card Tabs */}
          <div className="flex items-center gap-8 border-b border-[#E2E8F0] mb-6 text-xs sm:text-sm font-bold tracking-wider uppercase">

            <button
              onClick={() => setActiveWidgetTab('TRACKING')}
              className={`pb-3 transition relative ${activeWidgetTab === 'TRACKING'
                  ? 'text-[#042442] font-black'
                  : 'text-[#475569] hover:text-[#042442]'
                }`}
            >
              SUIVI DE COLIS & EXPÉDITIONS
              {activeWidgetTab === 'TRACKING' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E2001A]" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveWidgetTab('PRIX');
                const el = document.getElementById('simulateur');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-3 transition relative ${activeWidgetTab === 'PRIX'
                  ? 'text-[#042442] font-black'
                  : 'text-[#475569] hover:text-[#042442]'
                }`}
            >
              GRILLE TARIFAIRE & SIMULATEUR (CBM & KG)
              {activeWidgetTab === 'PRIX' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E2001A]" />
              )}
            </button>

          </div>

          {/* Tab 1: TRACKING FORM */}
          {activeWidgetTab === 'TRACKING' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-[#042442] uppercase tracking-wide">
                Numéro de suivi (MNC-XXXX), Conteneur ou Vol <span className="text-[#E2001A]">*</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="ex: MNC-8492A ou MSKU-982341-2"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  required
                  className="flex-1 px-4 py-3 border border-[#CBD5E1] text-[#042442] font-mono text-sm tracking-wide rounded-none focus:outline-none focus:border-[#042442]"
                />

                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="px-8 py-3 bg-[#E2001A] hover:bg-[#B8001A] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-none transition shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {trackingLoading ? 'Recherche...' : 'Suivi Transport'}
                </button>
              </div>

              <div className="text-xs text-[#475569] pt-1 flex flex-wrap items-center justify-between gap-2">
                <p>
                  Suivez vos expéditions maritimes (au m³) et aériennes (au kg) en direct dès la remise du code MNC.
                </p>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1"><Ship className="w-3.5 h-3.5 text-[#042442]" /> Maritime</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Plane className="w-3.5 h-3.5 text-[#E2001A]" /> Aérien</span>
                </div>
              </div>

            </form>
          )}

          {/* Tab 2: PRIX preview link */}
          {activeWidgetTab === 'PRIX' && (
            <div className="py-2 text-sm text-[#0B1F33] space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Fret Maritime Groupage (LCL)</div>
                  <div className="text-base font-bold text-[#042442] font-mono mt-0.5">{formatFCFA(seaRate)} / CBM</div>
                  <div className="text-[11px] text-slate-500">Dédouané au Port de Dakar</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Fret Aérien Régulier</div>
                  <div className="text-base font-bold text-[#E2001A] font-mono mt-0.5">{formatFCFA(airRate)} / Kg</div>
                  <div className="text-[11px] text-slate-500">Dédouané à Dakar AIBD</div>
                </div>
              </div>
              <div>
                <a
                  href="#simulateur"
                  className="text-[#E2001A] font-bold text-xs uppercase tracking-wider hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Accéder au simulateur en ligne (Maritime & Aérien) →
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

    </section>
  );
}
