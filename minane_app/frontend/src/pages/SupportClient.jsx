import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, ChevronDown, ChevronUp, Ship, Package, FileText, AlertCircle } from 'lucide-react';
import { getCompanyInfo, getWaChatUrl } from '../utils/company';

const FAQ_DATA = [
  {
    question: 'Comment suivre mon colis Minane Cargo ?',
    answer: 'Utilisez votre code de tracking (format MNC-XXXX) sur notre page d\'accueil dans le champ "TRACKING". Votre code vous a été fourni lors de l\'enregistrement de votre expédition à nos entrepôts de Guangzhou.'
  },
  {
    question: 'Quel est le délai de livraison Chine → Dakar ?',
    answer: 'Le transit maritime standard Guangzhou → Dakar est d\'environ 25 à 35 jours selon les départs. Consultez la section "Actualités Maritimes" de notre site pour les estimations ETA du prochain conteneur.'
  },
  {
    question: 'Comment récupérer mon colis à Dakar ?',
    answer: 'À l\'arrivée, vous recevez un code PIN de retrait à 4 chiffres par WhatsApp. Présentez ce code à notre agence de Dakar pour récupérer votre marchandise. Le retrait est sécurisé et peut être délégué à un tiers muni du PIN.'
  },
  {
    question: 'Comment payer mon fret maritime ?',
    answer: 'Le paiement s\'effectue à Dakar lors du retrait de vos marchandises. Nous acceptons : Wave, Orange Money, cash (FCFA). Aucun paiement n\'est requis à l\'avance depuis la Chine.'
  },
  {
    question: 'Quels types de marchandises acceptez-vous ?',
    answer: 'Nous acceptons toutes les marchandises générales non dangereuses : produits manufacturés, vêtements, électronique, mobilier, pièces détachées, etc. Les matières dangereuses (IMO) et les produits contrefaits sont strictement refusés.'
  },
  {
    question: 'Comment déposer mes marchandises en Chine ?',
    answer: 'Contactez notre agence de Guangzhou (Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road) au +86 137 1104 5051. Nos agents vous accompagnent pour l\'emballage, l\'étiquetage et la dépose.'
  },
  {
    question: 'Comment est calculé le tarif de fret ?',
    answer: 'Le tarif est basé sur le volume CBM (Cubic Meter) de vos marchandises. Utilisez notre simulateur en ligne pour une estimation instantanée. Le prix inclut le transport maritime, le dédouanement et la manutention au port de Dakar.'
  },
  {
    question: 'Mon colis est endommagé à l\'arrivée — que faire ?',
    answer: 'Contactez-nous immédiatement via WhatsApp en joignant des photos de l\'état du colis avant retrait. Ne retirez pas le colis sans réserves. Nous ouvrons une procédure de réclamation auprès de notre assurance transport.'
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E2E8F0] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F4F6F9] transition"
      >
        <span className="text-sm font-bold text-[#042442] pr-4">{question}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#E2001A] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#E2E8F0] pt-4">
          <p className="text-sm text-[#475569] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportClient({ onNavigate, settings }) {
  const company = getCompanyInfo(settings);
  const waDakarUrl = getWaChatUrl(company.phoneDakar, "Bonjour Minane Cargo, j'ai besoin d'assistance.");

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Page Header */}
      <div className="bg-[#042442] text-white py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest mb-3">
            <button onClick={() => onNavigate('landing')} className="hover:text-white transition">Accueil</button>
            <span>/</span>
            <span>Support Client</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Support Client — Nos Agences</h1>
          <p className="text-sm text-slate-300 mt-2">Notre équipe est disponible 6j/7 pour vous accompagner — {company.addressDakar} & Guangzhou</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">

        {/* Contact Cards — 2 lignes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* WhatsApp — Prioritaire */}
          <div className="bg-white border-t-4 border-[#E2001A] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#E2001A] uppercase tracking-wider">Prioritaire</div>
                <div className="text-sm font-bold text-[#042442]">WhatsApp</div>
              </div>
            </div>
            <p className="text-xs text-[#475569] mb-4">Réponse garantie sous 2h ouvrées. Envoyez votre code de tracking pour un suivi instantané.</p>
            <a
              href={waDakarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider text-center transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp — {company.phoneDakar}
            </a>
          </div>

          {/* Agence Dakar */}
          <div className="bg-white border-t-4 border-[#042442] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#042442]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">🇸🇳 Sénégal</div>
                <div className="text-sm font-bold text-[#042442]">Agence {company.addressDakar}</div>
              </div>
            </div>
            <div className="text-xs text-[#475569] space-y-1 mb-4">
              <p className="font-semibold text-[#042442] text-sm">{company.addressDakar}</p>
              <div className="flex items-center gap-1 pt-2 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Lun–Sam : 8h00 – 19h00</span>
              </div>
              <a href={`tel:${company.phoneDakar.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 pt-2 font-bold text-[#042442] hover:text-[#E2001A] transition">
                <Phone className="w-3 h-3" /> {company.phoneDakar}
              </a>
            </div>
            <div className="py-2.5 bg-[#F4F6F9] border border-[#E2E8F0] text-xs text-center text-slate-500">
              Retrait de colis sur présentation du PIN
            </div>
          </div>

          {/* Agence Guangzhou */}
          <div className="bg-white border-t-4 border-red-700 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider">🇨🇳 Chine</div>
                <div className="text-sm font-bold text-[#042442]">Agence Guangzhou</div>
              </div>
            </div>
            <div className="text-xs text-[#475569] space-y-1 mb-4">
              <p className="font-semibold text-[#042442]">{company.addressGuangzhou}</p>
              <div className="pt-3 space-y-1.5">
                <a href={`tel:${company.phoneGuangzhou.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 font-bold text-[#042442] hover:text-[#E2001A] transition">
                  <Phone className="w-3 h-3" /> {company.phoneGuangzhou} (Chine)
                </a>
                <a href={`tel:${company.phoneGuangzhouSn.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 font-bold text-[#042442] hover:text-[#E2001A] transition">
                  <Phone className="w-3 h-3" /> {company.phoneGuangzhouSn} (Sénégal)
                </a>
              </div>
            </div>
            <div className="py-2.5 bg-[#FFF5F5] border border-red-100 text-xs text-center text-red-700 font-semibold">
              Dépôt de marchandises 6j/7
            </div>
          </div>

        </div>

        {/* Tracking rapide */}
        <div className="bg-[#042442] text-white p-8 sm:p-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E2001A] uppercase tracking-widest mb-3">
              <Ship className="w-4 h-4" />
              Suivi en temps réel
            </div>
            <h2 className="text-2xl sm:text-3xl font-light mb-4">Suivez votre colis maintenant</h2>
            <p className="text-sm text-slate-300 mb-6">
              Retournez sur la page d'accueil et saisissez votre code de tracking (format MNC-XXXX) pour voir l'état en temps réel de votre expédition.
            </p>
            <button
              onClick={() => onNavigate('landing')}
              className="px-8 py-3.5 bg-[#E2001A] hover:bg-[#B8001A] text-white text-sm font-bold uppercase tracking-wider transition"
            >
              Aller au Tracking →
            </button>
          </div>
        </div>

        {/* Guide étapes */}
        <div>
          <h2 className="text-2xl font-light text-[#042442] mb-8 tracking-tight">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: '01', icon: <Package className="w-6 h-6 text-[#E2001A]" />, title: 'Dépôt en Chine', desc: 'Livrez vos marchandises à notre agence Guangzhou (Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road). Nos agents vous fournissent un code de tracking.' },
              { num: '02', icon: <Ship className="w-6 h-6 text-[#E2001A]" />, title: 'Transit Maritime', desc: 'Vos marchandises sont consolidées dans un conteneur scellé et expédiées vers Dakar (25–35 jours).' },
              { num: '03', icon: <FileText className="w-6 h-6 text-[#E2001A]" />, title: 'Dédouanement', desc: 'À l\'arrivée au port, Minane Cargo gère toutes les formalités douanières pour vous.' },
              { num: '04', icon: <AlertCircle className="w-6 h-6 text-[#E2001A]" />, title: 'Retrait sécurisé', desc: 'Recevez votre code PIN par WhatsApp et retirez vos marchandises à l\'agence Dakar.' },
            ].map((step) => (
              <div key={step.num} className="bg-white border border-[#E2E8F0] p-6 relative overflow-hidden">
                <span className="absolute top-3 right-3 text-5xl font-black text-slate-100 select-none">{step.num}</span>
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-sm font-bold text-[#042442] uppercase tracking-wider mb-2">{step.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-light text-[#042442] mb-8 tracking-tight">Questions fréquentes</h2>
          <div className="space-y-2 max-w-4xl">
            {FAQ_DATA.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
