import React from 'react';
import { Shield, LogOut, PhoneCall, Calculator } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

export default function Navbar({
  onOpenAdminLogin,
  adminUser,
  onLogoutAdmin,
  onNavigateHome,
  settings,
  currentView = 'landing'
}) {
  const company = getCompanyInfo(settings);
  const waSupportUrl = getWaChatUrl(company.phoneDakar, 'Bonjour Minane Cargo, je souhaite des informations.');
  const isAdminView = currentView === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">

      {/* 1. Sub-header utilitaire (Masqué en mode Admin Dashboard) */}
      {!isAdminView && (
        <div className="hidden lg:block border-b border-slate-100 bg-[#F4F6F9] text-[11px] text-[#475569] py-1.5 px-6">
          <div className="max-w-[1440px] mx-auto flex items-center justify-end gap-5">
            <button onClick={onNavigateHome} className="hover:text-[#E2001A] transition">
              À propos
            </button>
            <span className="text-slate-300">|</span>
            <a href="#services" className="hover:text-[#E2001A] transition">
              Agences {company.addressDakar} & Chine (Guangzhou)
            </a>
            <span className="text-slate-300">|</span>
            <a
              href={waSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E2001A] transition flex items-center gap-1 font-medium"
            >
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              Support Client ({company.phoneDakar})
            </a>
            <span className="text-slate-300">|</span>
            <a href="#actualites" className="hover:text-[#E2001A] transition">
              Actualités Maritimes
            </a>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer select-none group py-1"
          >
            <div className="flex flex-col">
              <img
                src="/logo_minane_cargo.png"
                alt="Minane Cargo"
                className="h-11 sm:h-12 w-auto object-contain"
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
              <div className="hidden items-center">
                <span className="text-2xl font-black tracking-tight text-[#042442]">MINANE</span>
                <span className="text-2xl font-black tracking-tight text-[#E2001A] ml-1">CARGO</span>
              </div>
            </div>
            {isAdminView && (
              <span className="hidden sm:inline-block ml-3 px-2.5 py-1 bg-slate-100 text-[#042442] text-[11px] font-bold uppercase tracking-widest border border-slate-200">
                Direction & Opérations
              </span>
            )}
          </div>

          {/* Nav Items (Masqués dans le Dashboard Admin) */}
          {!isAdminView && (
            <nav className="hidden xl:flex items-center gap-6 text-[13px] font-semibold text-[#042442]">
              <a href="#services" className="hover:text-[#E2001A] transition py-2 tracking-wide uppercase">
                Secteurs
              </a>
              <span className="text-slate-300">|</span>
              <a href="#services" className="hover:text-[#E2001A] transition py-2 tracking-wide uppercase">
                Transport Maritime
              </a>
              <span className="text-slate-300">|</span>
              <a href="#actualites" className="hover:text-[#E2001A] transition py-2 tracking-wide uppercase">
                Actualités
              </a>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Quick Quote CTA (Masqué en mode Admin) */}
            {!isAdminView && (
              <a
                href="#simulateur"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[#042442] hover:bg-[#042442] hover:text-white text-[#042442] text-xs font-bold uppercase tracking-wider transition"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Simulateur CBM</span>
              </a>
            )}

            {/* Admin Back-Office Controls — masqués dans la vue admin */}
            {!isAdminView && (
              adminUser ? (
                <div className="flex items-center gap-2 bg-[#042442] text-white px-3 py-1.5 rounded-none text-xs">
                  <span className="font-bold tracking-wider">ADMIN</span>
                  <button
                    onClick={onLogoutAdmin}
                    className="text-slate-300 hover:text-white"
                    title="Déconnexion Admin"
                  >
                    <LogOut className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="p-2 text-slate-400 hover:text-[#042442] hover:bg-slate-100 rounded-none transition"
                  title="Accès Direction & Caisse (Admin)"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
