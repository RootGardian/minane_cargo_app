import React from 'react';
import { FileText, Building, Scale, AlertTriangle, Globe } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

export default function MentionsLegales({ onNavigate, settings }) {
  const company = getCompanyInfo(settings);
  const waDakarUrl = getWaChatUrl(company.phoneDakar);
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Page Header */}
      <div className="bg-[#042442] text-white py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest mb-3">
            <button onClick={() => onNavigate('landing')} className="hover:text-white transition">Accueil</button>
            <span>/</span>
            <span>Mentions légales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Mentions légales</h1>
          <p className="text-sm text-slate-300 mt-2">Dernière mise à jour : Novembre 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl space-y-8">

          {/* Éditeur */}
          <div className="bg-white border border-[#E2E8F0] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E2E8F0]">
              <Building className="w-6 h-6 text-[#E2001A] shrink-0" />
              <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Éditeur du site</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Dénomination sociale</span>
                  <span className="text-[#042442] font-semibold">MINANE CARGO</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Forme juridique</span>
                  <span className="text-[#042442]">Société à Responsabilité Limitée (SARL)</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Siège social — 🇸🇳 {company.addressDakar}</span>
                  <span className="text-[#042442] font-semibold">{company.addressDakar}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Agence Chine — 🇨🇳 Guangzhou</span>
                  <span className="text-[#042442]">{company.addressGuangzhou}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Capital social</span>
                  <span className="text-[#042442]">10 000 000 FCFA</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Contact {company.addressDakar}</span>
                  <a href={waDakarUrl} className="text-[#E2001A] font-semibold hover:underline block" target="_blank" rel="noopener noreferrer">
                    {company.phoneDakar} (WhatsApp)
                  </a>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E2001A] uppercase tracking-wider block mb-1">Contact Guangzhou</span>
                  <a href={`tel:${company.phoneGuangzhou.replace(/\s+/g, '')}`} className="text-[#E2001A] font-semibold hover:underline block">{company.phoneGuangzhou} (Chine)</a>
                  <a href={`tel:${company.phoneGuangzhouSn.replace(/\s+/g, '')}`} className="text-[#E2001A] font-semibold hover:underline block">{company.phoneGuangzhouSn} (Sénégal)</a>
                </div>
              </div>
            </div>
          </div>

          {/* Directeur de publication */}
          <div className="bg-white border border-[#E2E8F0] p-8">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E2E8F0]">
              <FileText className="w-6 h-6 text-[#E2001A] shrink-0" />
              <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Direction de la publication</h2>
            </div>
            <div className="text-sm text-[#475569] space-y-2">
              <p>Le directeur de la publication est le représentant légal de la société Minane Cargo.</p>
              <p>Responsable de la gestion du contenu éditorial de ce site et des informations tarifaires maritimes publiées.</p>
            </div>
          </div>

          {/* Hébergement */}
          <div className="bg-white border border-[#E2E8F0] p-8">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E2E8F0]">
              <Globe className="w-6 h-6 text-[#E2001A] shrink-0" />
              <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Hébergement</h2>
            </div>
            <div className="text-sm text-[#475569] space-y-2">
              <p>Ce site est hébergé sur des serveurs sécurisés. L'application est déployée via une infrastructure sécurisée.</p>
              <p className="text-xs text-slate-400 mt-2">En cas de besoin d'information sur l'hébergeur, contactez-nous directement.</p>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-white border border-[#E2E8F0] p-8">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E2E8F0]">
              <Scale className="w-6 h-6 text-[#E2001A] shrink-0" />
              <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Propriété intellectuelle</h2>
            </div>
            <div className="text-sm text-[#475569] space-y-3">
              <p>L'ensemble du contenu de ce site (textes, graphiques, logos, images, interface) est la propriété exclusive de Minane Cargo et est protégé par les lois sur la propriété intellectuelle en vigueur au Sénégal </p>
              <p>Toute reproduction, distribution, modification ou utilisation de ce contenu sans autorisation écrite préalable est strictement interdite.</p>
              <div className="p-4 bg-[#F4F6F9] border-l-2 border-[#E2001A] mt-4">
                <p className="text-xs font-semibold text-[#042442]">Marque commerciale</p>
                <p className="text-xs text-[#475569] mt-1">La marque « MINANE CARGO » et son logo sont des marques déposées. Toute utilisation non autorisée constitue une contrefaçon passible de poursuites.</p>
              </div>
            </div>
          </div>

          {/* Responsabilité */}
          <div className="bg-white border border-[#E2E8F0] p-8">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E2E8F0]">
              <AlertTriangle className="w-6 h-6 text-[#E2001A] shrink-0" />
              <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Limitation de responsabilité</h2>
            </div>
            <div className="text-sm text-[#475569] space-y-3">
              <p>Les informations tarifaires et les estimations de dates d'arrivée (ETA) fournies sur ce site sont données à titre indicatif et peuvent être sujettes à modification en raison des aléas du transport maritime international (conditions météorologiques, congestion portuaire, procédures douanières).</p>
              <p>Minane Cargo ne saurait être tenu responsable des dommages directs ou indirects résultant d'une utilisation de ce site ou de l'impossibilité d'y accéder.</p>
            </div>
          </div>

          {/* Droit applicable */}
          <div className="bg-[#042442] text-white p-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4">Droit applicable & Juridiction</h2>
            <div className="text-sm text-slate-300 space-y-2">
              <p>Les présentes mentions légales sont soumises au droit sénégalais. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Dakar seront saisis.</p>
              <p className="text-xs text-slate-400 mt-3">Pour toute question juridique, contactez-nous par WhatsApp au <a href="https://wa.me/221705961276" className="text-[#E2001A] hover:underline" target="_blank" rel="noopener noreferrer">+221 70 596 12 76</a>.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

