import React from 'react';
import { ArrowUpRight, Facebook, Linkedin, Twitter, Instagram, Shield, Search } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

export default function Footer({ onOpenAdminLogin, onNavigate, settings }) {
  const company = getCompanyInfo(settings);
  const waDakarUrl = getWaChatUrl(company.phoneDakar, 'Bonjour Minane Cargo, je souhaite contacter l\'agence de Dakar.');
  return (
    <footer className="bg-[#F4F6F9] text-[#042442] pt-16 pb-12 border-t border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Col 1: Brand & Logo */}
          <div className="lg:col-span-3 space-y-3">
            <img
              src="/logo_minane_cargo.png"
              alt="Minane Cargo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <img
              src="/logo2_minane_cargo.png"
              alt="Minane Cargo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <p className="text-xs text-[#475569] pt-2 leading-relaxed">
              Transport maritime conteneurisé régulier reliant Guangzhou à {company.addressDakar}.<br />
              <span className="text-slate-400">{company.addressGuangzhou}</span>
            </p>
          </div>

          {/* Col 2: DÉCOUVREZ MINANE CARGO */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#042442] mb-3">
              DÉCOUVREZ MINANE CARGO
            </h4>
            <div className="space-y-2">
              <div className="bg-white border border-[#E2E8F0] p-3 flex items-center justify-between hover:border-slate-300 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-wider text-[#042442] group-hover:text-[#E2001A] transition">
                  NOTRE VISION
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>

              <div className="bg-white border border-[#E2E8F0] p-3 flex items-center justify-between hover:border-slate-300 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-wider text-[#042442] group-hover:text-[#E2001A] transition">
                  DÉVELOPPEMENT DURABLE & SÉCURITÉ
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>

              <div className="bg-white border border-[#E2E8F0] p-3 flex items-center justify-between hover:border-slate-300 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-wider text-[#042442] group-hover:text-[#E2001A] transition">
                  AGENCES GUANGZHOU
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>

              <div className="bg-white border border-[#E2E8F0] p-3 flex items-center justify-between hover:border-slate-300 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-wider text-[#042442] group-hover:text-[#E2001A] transition">
                  ACTUALITÉS MARITIMES
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#E2001A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
            </div>
          </div>

          {/* Col 3: NOS SERVICES */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#042442] mb-3">
              NOS SERVICES
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#042442]">
              <li>
                <a href="#services" className="hover:text-[#E2001A] hover:underline transition">
                  Transport Maritime Groupage LCL
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#E2001A] hover:underline transition">
                  Solutions de Dépôtage
                </a>
              </li>
              <li>
                <a href="#actualites" className="hover:text-[#E2001A] hover:underline transition">
                  Actualités Portuaires Nansha → Dakar
                </a>
              </li>
              <li>
                <a href="#simulateur" className="hover:text-[#E2001A] hover:underline transition flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#E2001A]" />
                  Simulateur de Cubage CBM
                </a>
              </li>
              <li className="pt-2">
                <span className="w-8 h-0.5 bg-[#E2001A] block mb-2" />
                <a
                  href={waDakarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-[#042442] block font-semibold"
                >
                  Agence {company.addressDakar}
                </a>
                <a
                  href={`tel:${company.phoneGuangzhou.replace(/\s+/g, '')}`}
                  className="text-xs text-slate-500 hover:text-[#042442] block mt-0.5"
                >
                  Agence Guangzhou : {company.phoneGuangzhou}
                </a>
                <span className="text-xs text-slate-400 block mt-1">
                  WhatsApp Dakar : {company.phoneDakar}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: SUIVEZ-NOUS */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#042442] mb-3">
                SUIVEZ-NOUS
              </h4>
              <div className="flex items-center gap-2">
                <a href="#" className="w-9 h-9 bg-[#042442] hover:bg-[#E2001A] text-white flex items-center justify-center transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-[#042442] hover:bg-[#E2001A] text-white flex items-center justify-center transition">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-[#042442] hover:bg-[#E2001A] text-white flex items-center justify-center transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-[#042442] hover:bg-[#E2001A] text-white flex items-center justify-center transition">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Admin shortcut */}
            <div className="pt-2">
              <button
                onClick={onOpenAdminLogin}
                className="text-[11px] text-slate-400 hover:text-[#042442] flex items-center gap-1.5 transition"
              >
                <Shield className="w-3.5 h-3.5" />
                Portail Direction & Opérations
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between text-[11px] text-[#475569] gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => onNavigate('plan-du-site')} className="hover:underline hover:text-[#042442] transition">Plan du site</button>
            <span>•</span>
            <button onClick={() => onNavigate('confidentialite')} className="hover:underline hover:text-[#042442] transition">Avis de confidentialité</button>
            <span>•</span>
            <button onClick={() => onNavigate('support')} className="hover:underline hover:text-[#042442] transition">Support Client Dakar</button>
            <span>•</span>
            <button onClick={() => onNavigate('mentions-legales')} className="hover:underline hover:text-[#042442] transition">Mentions légales</button>
            <span>•</span>
            <span className="border border-slate-300 px-2 py-0.5 bg-white text-slate-700 cursor-default">Paramètres des cookies</span>
          </div>

          <p className="text-slate-500 font-medium">
            © 2026 MINANE CARGO Group – Tous droits réservés.
          </p>
        </div>

      </div>
    </footer>
  );
}
