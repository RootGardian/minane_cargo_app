import React from 'react';
import { AlertCircle, CheckCircle, Info, X, PhoneCall } from 'lucide-react';
import { DEFAULT_COMPANY_INFO, cleanPhoneForWA } from '../utils/company';

export default function AlertModal({
  isOpen,
  onClose,
  title = "Notification Minane Cargo",
  message,
  type = "error", // 'error' | 'success' | 'info'
  trackingCode = null,
  phoneDakar = null
}) {
  if (!isOpen) return null;

  const targetPhone = cleanPhoneForWA(phoneDakar || DEFAULT_COMPANY_INFO.phoneDakar);
  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navy Header */}
        <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
          <div className="flex items-center gap-2.5">
            {isError ? (
              <AlertCircle className="w-5 h-5 text-[#E2001A] shrink-0" />
            ) : isSuccess ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0" />
            )}
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#0B1F33] leading-relaxed">
            {message}
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[#042442] hover:bg-[#001736] text-white text-xs font-bold uppercase tracking-wider transition rounded-none text-center"
            >
              Fermer
            </button>

            {/* Direct WhatsApp button if tracking failure */}
            {trackingCode && (
              <a
                href={`https://wa.me/${targetPhone}?text=${encodeURIComponent(
                  `Bonjour Minane Cargo, je cherche à suivre mon colis référence ${trackingCode}. Pouvez-vous m'aider ?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition rounded-none flex items-center justify-center gap-2 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Support WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

