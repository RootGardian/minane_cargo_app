import React from 'react';
import { Megaphone } from 'lucide-react';

export default function DeparturesBanner({ bannerText }) {
  if (!bannerText) {
    bannerText = "Ligne maritime exclusive Guangzhou &  ➔ Port de Dakar Môle 2 • Réception continue de colis en entrepôts.";
  }

  return (
    <div className="bg-[#042442] text-white border-b border-[#083863] text-xs py-2 px-4 select-none relative z-50">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E2001A] text-white text-[10px] font-bold uppercase tracking-wider rounded-none shrink-0">
            <Megaphone className="w-3 h-3 animate-pulse" />
            Flash Info
          </span>
          <p className="text-xs text-slate-200 font-medium truncate">
            {bannerText}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-300 font-medium shrink-0">
          <span>Corridor : Guangzhou   ➔ Dakar</span>
          <span className="text-slate-500">•</span>
          <span>Devise : FCFA (XOF)</span>
        </div>
      </div>
    </div>
  );
}
