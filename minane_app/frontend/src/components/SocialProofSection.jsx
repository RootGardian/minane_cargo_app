import React from 'react';
import { ShieldCheck, Package, Calendar, FileCheck, Star, Quote, MapPin, CheckCircle2 } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

export default function SocialProofSection({ settings }) {
  const company = getCompanyInfo(settings);
  const waUrl = getWaChatUrl(company.phoneDakar, 'Bonjour Minane Cargo, je souhaite des informations sur vos départs maritimes.');

  const stats = [
    {
      value: '+10 000 m³',
      label: 'Marchandises acheminées',
      desc: 'Volume maritime cumulé transporté en conteneurs sécurisés depuis nos entrepôts de Guangzhou.',
      icon: Package,
    },
    {
      value: '99.8%',
      label: 'Sécurité & Conformité',
      desc: 'Cargaisons inspectées, scellées et livrées sans perte ni avarie au Port de Dakar.',
      icon: ShieldCheck,
    },
    {
      value: '2 à 3',
      label: 'Départs réguliers / mois',
      desc: 'Rotations maritimes garanties pour fluidifier les stocks et approvisionnements de vos commerces.',
      icon: Calendar,
    },
    {
      value: '100%',
      label: 'Formalités douanières incluses',
      desc: 'Dédouanement complet pris en charge, aucun frais caché ni surprise à l\'arrivée au Sénégal.',
      icon: FileCheck,
    },
  ];

  const testimonials = [
    {
      name: 'El Hadji Malick Diop',
      role: 'Grossiste Textile & Tissus',
      location: 'Marché Sandaga, Dakar',
      badge: 'Expéditeur Régulier (LCL)',
      quote:
        'En tant que grossiste au marché Sandaga, la ponctualité des arrivages est vitale pour mes clients. Depuis plus de 3 ans, mes rouleaux de tissus arrivent intacts de Guangzhou. Le retrait sécurisé avec le code PIN au guichet de Dakar protège totalement nos marchandises contre les erreurs.',
      rating: 5,
    },
    {
      name: 'Moussa Fall',
      role: 'Quincaillerie & Outillage Lourd',
      location: 'Colobane, Dakar',
      badge: 'Client Professionnel',
      quote:
        'Avec le matériel lourd et les pièces métalliques, d\'autres transitaires appliquaient des surcoûts surprises au port. Chez Minane Cargo, le tarif CBM convenu au départ est exactement celui appliqué à l\'arrivée, dédouanement compris. Une vraie transparence commerciale.',
      rating: 5,
    },
    {
      name: 'Aïssatou Sow',
      role: 'Accessoires Téléphones & High-Tech',
      location: 'Dakar',
      badge: 'Importatrice Guangzhou ➔ Dakar',
      quote:
        'Le lien de suivi en direct sur WhatsApp change tout : je peux surveiller l\'avancement de mon expédition depuis l\'entrepôt de Guangzhou jusqu\'à l\'accostage du navire au port de Dakar. Le service client WhatsApp est très réactif dès qu\'on a besoin d\'une précision.',
      rating: 5,
    },
    {
      name: 'Ibrahima Ndiaye',
      role: 'Maroquinerie & Chaussures',
      location: 'Dakar',
      badge: 'Client Fidélité',
      quote:
        'La régularité des 2 à 3 départs par mois nous permet de ne jamais être en rupture de stock. Nos fournisseurs à Guangzhou livrent directement à leur entrepôt avec notre shipping mark, et Minane s\'occupe de tout le reste jusqu\'à la mise à disposition.',
      rating: 5,
    },
  ];

  return (
    <section id="actualites" className="bg-[#F8FAFC] py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-4xl mb-14">
          <div className="border-l-2 border-[#E2001A] pl-4 mb-3">
            <span className="text-xs font-bold text-[#E2001A] uppercase tracking-[0.2em]">
              RÉASSURANCE & CONFIANCE CLIENT
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-[#042442] tracking-tight mb-4">
            La référence logistique des commerçants et importateurs
          </h2>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Sur le corridor maritime Chine (Guangzhou) ➔ Sénégal (Dakar), nous allions rigueur opérationnelle, traçabilité digitale et présence humaine pour sécuriser chaque mètre cube confié.
          </p>
        </div>

        {/* 1. KEY STATISTICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E2E8F0] p-6 relative overflow-hidden group hover:border-[#042442] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-none bg-[#042442]/5 flex items-center justify-center text-[#042442] group-hover:bg-[#E2001A] group-hover:text-white transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 tracking-wider">
                    0{idx + 1}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#042442] tracking-tight mb-2">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#E2001A] uppercase tracking-wider mb-2">
                  {stat.label}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* 2. REAL TESTIMONIALS (Sandaga, Colobane, Électronique, Textile) */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#042442] tracking-tight">
                Témoignages de nos commerçants partenaires
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Grossistes de Sandaga, commerçants de Colobane et importateurs réguliers à Dakar.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#042442] bg-white border border-[#E2E8F0] px-3 py-1.5 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Retours d'expérience vérifiés</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  {/* Top rating and badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#042442] px-2.5 py-1">
                      {t.badge}
                    </span>
                  </div>

                  {/* Quote text */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-slate-100 absolute -top-3 -left-2 -z-0" />
                    <p className="relative z-10 text-xs sm:text-sm text-[#334155] leading-relaxed italic">
                      « {t.quote} »
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#042442]">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      {t.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-[#E2001A]" />
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. OPERATIONAL TRUST BANNER */}
        <div className="bg-[#042442] text-white p-8 sm:p-10 border-l-4 border-[#E2001A]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#E2001A] uppercase">
                PROTOCOLE DE SÉCURITÉ GARANTI
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Vos marchandises suivies, scellées et protégées jusqu'au retrait à Dakar
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Chaque colis reçoit un numéro de suivi unique et un code PIN de retrait personnel et confidentiel. Aucun retrait possible sans présentation de votre pièce d'identité et de votre PIN au guichet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E2001A] hover:bg-[#c00016] text-white text-xs font-bold uppercase tracking-wider transition"
              >
                <span>Contacter l'agence Dakar</span>
                <span className="text-white/80 font-normal">({company.phoneDakar})</span>
              </a>
              <a
                href="#simulateur"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Simuler mon envoi CBM
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

