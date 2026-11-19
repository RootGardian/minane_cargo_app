import React from 'react';
import { ArrowUpRight, Ship, Package, FileText, Phone } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

export default function PlanDuSite({ onNavigate, settings }) {
  const company = getCompanyInfo(settings);
  const waDakarUrl = getWaChatUrl(company.phoneDakar);

  const sections = [
    {
      title: 'Page d\'accueil',
      icon: <Ship className="w-5 h-5 text-[#E2001A]" />,
      links: [
        { label: 'Tracking de colis', anchor: '#tracking' },
        { label: 'Simulateur CBM & Tarifs', anchor: '#simulateur' },
        { label: 'Nos services', anchor: '#services' },
        { label: 'Actualités & Informations Maritimes', anchor: '#actualites' },
      ]
    },
    {
      title: 'Nos Services',
      icon: <Package className="w-5 h-5 text-[#E2001A]" />,
      links: [
        { label: 'Transport Maritime Groupage LCL', anchor: '#services' },
        { label: 'Conteneur Complet FCL', anchor: '#services' },
        { label: 'Entrepôts Guangzhou', anchor: '#services' },
        { label: 'Solutions Dépotage Dakar', anchor: '#services' },
        { label: 'Dédouanement & Formalités Dakar', anchor: '#services' },
        { label: 'Accompagnement Importateurs & Livraison', anchor: '#services' },
      ]
    },
    {
      title: 'Informations pratiques',
      icon: <FileText className="w-5 h-5 text-[#E2001A]" />,
      links: [
        { label: 'Tarif de fret maritime CBM', anchor: '#simulateur' },
        { label: 'Bulletins d\'empotage & cut-off', anchor: '#actualites' },
        { label: 'ETA Dakar — estimations d\'arrivée', anchor: '#actualites' },
        { label: 'Grille tarifaire active', anchor: '#actualites' },
      ]
    },
    {
      title: 'Contact & Support',
      icon: <Phone className="w-5 h-5 text-[#E2001A]" />,
      links: [
        { label: `Support WhatsApp (${company.phoneDakar})`, href: waDakarUrl },
        { label: `Agence ${company.addressDakar}`, page: 'support' },
        { label: 'Agence Guangzhou (Chine)', page: 'support' },
      ]
    },
    {
      title: 'Informations légales',
      icon: <FileText className="w-5 h-5 text-[#E2001A]" />,
      links: [
        { label: 'Mentions légales', page: 'mentions-legales' },
        { label: 'Avis de confidentialité', page: 'confidentialite' },
        { label: 'Paramètres des cookies', anchor: '#' },
        { label: `Support Client ${company.addressDakar}`, page: 'support' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Page Header */}
      <div className="bg-[#042442] text-white py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest mb-3">
            <button onClick={() => onNavigate('landing')} className="hover:text-white transition">Accueil</button>
            <span>/</span>
            <span>Plan du site</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Plan du site</h1>
          <p className="text-sm text-slate-300 mt-2">Retrouvez toutes les pages et sections de Minane Cargo</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#E2E8F0]">
                {section.icon}
                <h2 className="text-xs font-bold text-[#042442] uppercase tracking-widest">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-sm text-[#042442] hover:text-[#E2001A] group transition"
                      >
                        <span className="underline underline-offset-2">{link.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#E2001A] opacity-0 group-hover:opacity-100 transition" />
                      </a>
                    ) : link.page ? (
                      <button
                        onClick={() => onNavigate(link.page)}
                        className="flex items-center justify-between w-full text-sm text-[#042442] hover:text-[#E2001A] group transition text-left"
                      >
                        <span className="underline underline-offset-2">{link.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#E2001A] opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ) : (
                      <a
                        href={link.anchor}
                        onClick={() => onNavigate('landing')}
                        className="flex items-center justify-between text-sm text-[#042442] hover:text-[#E2001A] group transition"
                      >
                        <span className="underline underline-offset-2">{link.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#E2001A] opacity-0 group-hover:opacity-100 transition" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

