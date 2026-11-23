import React from 'react';
import {
  Building2,
  Container,
  Truck,
  Ship,
  Plane,
  Anchor,
  FileCheck,
  CheckCircle2,
  PackageCheck,
  Check
} from 'lucide-react';

export default function TrackingTimeline({ currentStatus, history = [], transportMode = 'MARITIME_LCL' }) {
  const isAir = transportMode?.startsWith('AIR');

  const statusConfig = [
    { key: 'CHINA_WAREHOUSE', label: 'Entrepôt Chine', desc: 'Guangzhou', icon: Building2 },
    { key: 'CONTAINER_LOADED', label: isAir ? 'Préparation Vol' : 'Empotage', desc: isAir ? 'Lot Aérien prêt' : 'Conteneur scellé', icon: isAir ? Plane : Container },
    { key: 'TRANSFERRED_TO_PORT', label: isAir ? 'Aéroport Chine' : 'Port Chine', desc: isAir ? 'Guangzhou CAN' : 'Port de Nansha', icon: isAir ? Plane : Truck },
    { key: 'IN_TRANSIT', label: isAir ? 'En Vol' : 'En Mer', desc: isAir ? 'Vol Cargo vers Dakar' : 'En navigation', icon: isAir ? Plane : Ship },
    { key: 'ARRIVED_DAKAR', label: 'Arrivé Dakar', desc: isAir ? 'Aéroport AIBD' : 'Port de Dakar', icon: isAir ? Plane : Anchor },
    { key: 'CUSTOMS_CLEARANCE', label: 'Dédouanement', desc: 'Formalités douanières', icon: FileCheck },
    { key: 'READY_FOR_PICKUP', label: 'Disponible Dépôt', desc: 'Retrait Dakar', icon: CheckCircle2 },
    { key: 'DELIVERED', label: 'Colis Livré', desc: 'Remis au destinataire', icon: PackageCheck }
  ];

  const currentIndex = statusConfig.findIndex(s => s.key === currentStatus);

  return (
    <div className="py-6">

      {/* Desktop Horizontal Stepper (CMA CGM clean corporate style) */}
      <div className="hidden lg:block">
        <div className="relative flex items-center justify-between">

          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 -z-0" />

          {/* Progress Active Line */}
          <div
            className="absolute left-6 top-5 h-0.5 bg-[#E2001A] transition-all duration-700 -z-0"
            style={{
              width: currentIndex >= 0 ? `${(currentIndex / (statusConfig.length - 1)) * 100}%` : '0%'
            }}
          />

          {statusConfig.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center text-center max-w-[110px]">

                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCurrent
                    ? 'bg-[#042442] text-white ring-4 ring-[#E2001A]/30 scale-110 shadow-md'
                    : isCompleted
                      ? 'bg-[#042442] text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2.5">
                  <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#042442]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {step.desc}
                  </div>
                </div>

                {/* Current step active badge */}
                {isCurrent && (
                  <span className="mt-1 px-1.5 py-0.5 bg-[#E2001A] text-white text-[9px] font-bold uppercase tracking-wider rounded-none">
                    En cours
                  </span>
                )}

              </div>
            );
          })}

        </div>
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="lg:hidden space-y-4">
        {statusConfig.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent
                  ? 'bg-[#042442] text-white ring-2 ring-[#E2001A]'
                  : isCompleted
                    ? 'bg-[#042442] text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-300'
                  }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-3.5 h-3.5" />}
                </div>
                {idx < statusConfig.length - 1 && (
                  <div className={`w-0.5 h-6 ${idx < currentIndex ? 'bg-[#E2001A]' : 'bg-slate-200'}`} />
                )}
              </div>

              <div className="pt-1">
                <div className={`text-xs font-bold ${isCurrent ? 'text-[#042442]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 px-1.5 py-0.5 bg-[#E2001A] text-white text-[9px] uppercase font-bold">
                      En cours
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
