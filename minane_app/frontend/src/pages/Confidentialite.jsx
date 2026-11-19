import React from 'react';
import { Shield, Eye, Database, Bell, Trash2, Lock } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

export default function Confidentialite({ onNavigate, settings }) {
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
            <span>Avis de confidentialité</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Avis de confidentialité</h1>
          <p className="text-sm text-slate-300 mt-2">Dernière mise à jour : Novembre 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar nav */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E2E8F0] p-5 sticky top-24">
              <h3 className="text-xs font-bold text-[#042442] uppercase tracking-widest mb-4 pb-3 border-b border-[#E2E8F0]">
                Sommaire
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-[#475569]">
                {['Introduction', 'Données collectées', 'Utilisation des données', 'Conservation', 'Vos droits', 'Sécurité', 'Cookies', 'Contact DPO'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-[#E2001A] transition block py-0.5">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-10">

            <section id="introduction" className="bg-white border border-[#E2E8F0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="w-6 h-6 text-[#E2001A] shrink-0" />
                <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Introduction</h2>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Minane Cargo (ci-après « nous », « notre société ») accorde une importance primordiale à la protection de vos données personnelles. Le présent avis de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations dans le cadre de nos services de transport maritime Chine → Sénégal.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">
                Nous nous conformons au Règlement Général sur la Protection des Données (RGPD) et à la législation sénégalaise en vigueur sur la protection des données personnelles (Loi n° 2008-12 sur la Protection des Données Personnelles).
              </p>
            </section>

            <section id="données-collectées" className="bg-white border border-[#E2E8F0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <Database className="w-6 h-6 text-[#E2001A] shrink-0" />
                <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Données collectées</h2>
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-[#E2001A] pl-4">
                  <h3 className="text-sm font-bold text-[#042442] mb-2">Données d'identification</h3>
                  <ul className="text-sm text-[#475569] space-y-1 list-disc list-inside">
                    <li>Nom et prénom du destinataire</li>
                    <li>Numéro de téléphone (WhatsApp)</li>
                    <li>Code de retrait (PIN) généré automatiquement</li>
                  </ul>
                </div>
                <div className="border-l-2 border-[#E2001A] pl-4">
                  <h3 className="text-sm font-bold text-[#042442] mb-2">Données de suivi logistique</h3>
                  <ul className="text-sm text-[#475569] space-y-1 list-disc list-inside">
                    <li>Code de tracking (ex: MNC-XXXX)</li>
                    <li>Description des marchandises</li>
                    <li>Volume (CBM) et poids des colis</li>
                    <li>Numéro de conteneur et scellé</li>
                    <li>Statut d'expédition</li>
                  </ul>
                </div>
                <div className="border-l-2 border-[#E2001A] pl-4">
                  <h3 className="text-sm font-bold text-[#042442] mb-2">Données de navigation (cookies techniques)</h3>
                  <ul className="text-sm text-[#475569] space-y-1 list-disc list-inside">
                    <li>Adresse IP anonymisée</li>
                    <li>Type de navigateur et appareil</li>
                    <li>Pages visitées sur notre site</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="utilisation-des-données" className="bg-white border border-[#E2E8F0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <Eye className="w-6 h-6 text-[#E2001A] shrink-0" />
                <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Utilisation des données</h2>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">Vos données sont utilisées exclusivement pour :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Suivi de vos expéditions maritimes (Chine → Dakar)',
                  'Notification de l\'arrivée de vos marchandises au port',
                  'Remise sécurisée des colis via code PIN',
                  'Émission de reçus et factures d\'expédition',
                  'Communication opérationnelle via WhatsApp',
                  'Amélioration de nos services logistiques',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#042442]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2001A] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-[#F4F6F9] border border-[#E2E8F0] text-xs text-[#475569]">
                <strong className="text-[#042442]">Important :</strong> Nous ne vendons, ne louons ni ne partageons jamais vos données personnelles avec des tiers à des fins commerciales.
              </div>
            </section>

            <section id="conservation" className="bg-white border border-[#E2E8F0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="w-6 h-6 text-[#E2001A] shrink-0" />
                <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Conservation des données</h2>
              </div>
              <div className="space-y-3">
                {[
                  { type: 'Données d\'expédition', duree: '5 ans', raison: 'Obligations comptables et douanières' },
                  { type: 'Données clients (nom, téléphone)', duree: '3 ans', raison: 'Après dernière expédition' },
                  { type: 'Logs de connexion admin', duree: '1 an', raison: 'Sécurité informatique' },
                  { type: 'Cookies techniques', duree: '13 mois', raison: 'Maximum légal CNIL' },
                ].map((row) => (
                  <div key={row.type} className="grid grid-cols-3 gap-4 py-3 border-b border-[#E2E8F0] text-sm">
                    <span className="font-semibold text-[#042442]">{row.type}</span>
                    <span className="text-[#E2001A] font-bold">{row.duree}</span>
                    <span className="text-[#475569]">{row.raison}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="vos-droits" className="bg-white border border-[#E2E8F0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <Trash2 className="w-6 h-6 text-[#E2001A] shrink-0" />
                <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider">Vos droits</h2>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">Conformément à la législation, vous disposez des droits suivants :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { droit: 'Droit d\'accès', desc: 'Obtenir une copie de vos données personnelles' },
                  { droit: 'Droit de rectification', desc: 'Corriger des données inexactes ou incomplètes' },
                  { droit: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données' },
                  { droit: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré' },
                  { droit: 'Droit d\'opposition', desc: 'Vous opposer au traitement de vos données' },
                  { droit: 'Droit de limitation', desc: 'Limiter le traitement dans certains cas' },
                ].map((item) => (
                  <div key={item.droit} className="p-4 bg-[#F4F6F9] border border-[#E2E8F0]">
                    <div className="text-xs font-bold text-[#042442] uppercase tracking-wider mb-1">{item.droit}</div>
                    <div className="text-xs text-[#475569]">{item.desc}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#475569] mt-4">
                Pour exercer ces droits, contactez-nous via WhatsApp au{' '}
                <a href={waDakarUrl} className="text-[#E2001A] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">{company.phoneDakar}</a>.
              </p>
            </section>

            <section id="cookies" className="bg-white border border-[#E2E8F0] p-8">
              <h2 className="text-lg font-bold text-[#042442] uppercase tracking-wider mb-5">Cookies</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Notre site utilise uniquement des cookies techniques strictement nécessaires au bon fonctionnement du service (session admin, préférences). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
              </p>
            </section>

            <section id="contact-dpo" className="bg-[#042442] text-white p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-white">Contact & Responsable des données</h2>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong className="text-white">Minane Cargo</strong></p>
                <div className="pt-1 space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">🇸🇳 Agence {company.addressDakar}</p>
                  <p className="font-semibold text-white">{company.addressDakar}</p>
                  <p>WhatsApp : <a href={waDakarUrl} className="text-[#E2001A] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">{company.phoneDakar}</a></p>
                </div>
                <div className="pt-2 space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">🇨🇳 Agence Guangzhou</p>
                  <p>{company.addressGuangzhou}</p>
                  <p>Tél : <a href={`tel:${company.phoneGuangzhou.replace(/\s+/g, '')}`} className="text-[#E2001A] font-semibold hover:underline">{company.phoneGuangzhou} (Chine)</a> · <a href={`tel:${company.phoneGuangzhouSn.replace(/\s+/g, '')}`} className="text-[#E2001A] font-semibold hover:underline">{company.phoneGuangzhouSn} (Sénégal)</a></p>
                </div>
                <p className="pt-3 text-xs text-slate-400">Pour toute réclamation, vous pouvez également contacter la Commission de Protection des Données Personnelles du Sénégal (CDP).</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

