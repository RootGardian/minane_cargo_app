import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';

export default function ServicesSection({ settings }) {
  const seaRate = settings?.maritimeCbmRate || 165000;

  return (
    <section id="services" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="mb-14 max-w-4xl">
          <h2 className="text-3xl sm:text-5xl font-light text-[#042442] tracking-tight mb-4">
            Quels sont vos besoins ?
          </h2>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Spécialiste incontournable du corridor maritime Chine (Guangzhou) → Sénégal (Dakar), nous concevons et déployons des solutions logistiques intégrées qui accompagnent vos marchandises du quai de départ jusqu'au Sénégal.
          </p>
        </div>

        {/* 3 Pillars Grid with red vertical indicator bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">

          {/* COLUMN 1: TRANSPORT MARITIME */}
          <div className="border-l-2 border-[#E2001A] pl-5 sm:pl-6 space-y-6">
            <h3 className="text-xs font-bold text-[#E2001A] uppercase tracking-[0.2em]">
              TRANSPORT MARITIME
            </h3>

            {/* Card 1 */}
            <div className="group relative bg-[#F4F6F9] hover:bg-white border border-[#E2E8F0] p-4 transition-all duration-200 overflow-hidden">
              <span className="absolute -bottom-2 right-2 text-5xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter">
                LIGNES
              </span>
              <div className="flex items-start gap-4 relative z-10">
                <img
                  src="/service_maritime.jpeg"
                  alt="Lignes Maritimes"
                  className="w-28 h-20 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition"
                />
                <div className="flex-1 flex flex-col justify-between h-20">
                  <span className="text-xs font-bold text-[#042442] group-hover:text-[#E2001A] tracking-wider uppercase underline underline-offset-4 leading-tight">
                    GROUPAGE LCL & FCL ({formatFCFA(seaRate)}/CBM)
                  </span>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-[#E2001A] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-[#F4F6F9] hover:bg-white border border-[#E2E8F0] p-4 transition-all duration-200 overflow-hidden">
              <span className="absolute -bottom-2 right-2 text-5xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter">
                MINANE+
              </span>
              <div className="flex items-start gap-4 relative z-10">
                <img
                  src="/service_special.jpeg"
                  alt="Minane+"
                  className="w-28 h-20 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition"
                />
                <div className="flex-1 flex flex-col justify-between h-20">
                  <span className="text-xs font-bold text-[#042442] group-hover:text-[#E2001A] tracking-wider uppercase underline underline-offset-4 leading-tight">
                    MINANE+ : SERVICES DÉDIÉS IMPORTATEURS
                  </span>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-[#E2001A] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: LOGISTIQUE */}
          <div className="border-l-2 border-[#E2001A] pl-5 sm:pl-6 space-y-6">
            <h3 className="text-xs font-bold text-[#E2001A] uppercase tracking-[0.2em]">
              LOGISTIQUE & ENTREPÔTS
            </h3>

            {/* Card 1 */}
            <div className="group relative bg-[#F4F6F9] hover:bg-white border border-[#E2E8F0] p-4 transition-all duration-200 overflow-hidden">
              <span className="absolute -bottom-2 right-2 text-5xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter">
                SERVICES
              </span>
              <div className="flex items-start gap-4 relative z-10">
                <img
                  src="/service_warehouse.jpeg"
                  alt="Services Logistiques"
                  className="w-28 h-20 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition"
                />
                <div className="flex-1 flex flex-col justify-between h-20">
                  <span className="text-xs font-bold text-[#042442] group-hover:text-[#E2001A] tracking-wider uppercase underline underline-offset-4 leading-tight">
                    ENTREPÔTS GUANGZHOU
                  </span>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-[#E2001A] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-[#F4F6F9] hover:bg-white border border-[#E2E8F0] p-4 transition-all duration-200 overflow-hidden">
              <span className="absolute -bottom-2 right-2 text-5xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter">
                DÉPOTAGE
              </span>
              <div className="flex items-start gap-4 relative z-10">
                <img
                  src="/service_truck.jpeg"
                  alt="Solutions Intermodales"
                  className="w-28 h-20 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition"
                />
                <div className="flex-1 flex flex-col justify-between h-20">
                  <span className="text-xs font-bold text-[#042442] group-hover:text-[#E2001A] tracking-wider uppercase underline underline-offset-4 leading-tight">
                    SOLUTIONS DÉPOTAGE Dakar
                  </span>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-[#E2001A] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 3: TRANSIT & DÉDOUANEMENT */}
          <div className="border-l-2 border-[#E2001A] pl-5 sm:pl-6 space-y-6">
            <h3 className="text-xs font-bold text-[#E2001A] uppercase tracking-[0.2em]">
              TRANSIT & DÉDOUANEMENT
            </h3>

            {/* Card 1 */}
            <div className="group relative bg-[#F4F6F9] hover:bg-white border border-[#E2E8F0] p-4 transition-all duration-200 overflow-hidden">
              <span className="absolute -bottom-2 right-2 text-5xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter">
                DOUANE
              </span>
              <div className="flex items-start gap-4 relative z-10">
                <img
                  src="/service_customs.jpeg"
                  alt="Dédouanement Port de Dakar"
                  className="w-28 h-20 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition"
                />
                <div className="flex-1 flex flex-col justify-between h-20">
                  <span className="text-xs font-bold text-[#042442] group-hover:text-[#E2001A] tracking-wider uppercase underline underline-offset-4 leading-tight">
                    DÉDOUANEMENT & FORMALITÉS DAKAR
                  </span>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-[#E2001A] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-[#F4F6F9] hover:bg-white border border-[#E2E8F0] p-4 transition-all duration-200 overflow-hidden">
              <span className="absolute -bottom-2 right-2 text-5xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter">
                LIVRAISON
              </span>
              <div className="flex items-start gap-4 relative z-10">
                <img
                  src="/service_port.jpeg"
                  alt="Livraison Directe"
                  className="w-28 h-20 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition"
                />
                <div className="flex-1 flex flex-col justify-between h-20">
                  <span className="text-xs font-bold text-[#042442] group-hover:text-[#E2001A] tracking-wider uppercase underline underline-offset-4 leading-tight">
                    ACCOMPAGNEMENT IMPORTATEURS & LIVRAISON
                  </span>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-[#E2001A] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
