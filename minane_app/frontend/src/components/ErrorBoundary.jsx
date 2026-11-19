import React from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { DEFAULT_COMPANY_INFO, getWaChatUrl } from '../utils/company';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log exception for debugging (can be wired to Sentry / Datadog in production)
    console.error('🚨 [ErrorBoundary] Unhandled exception caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const waUrl = getWaChatUrl(
        DEFAULT_COMPANY_INFO.phoneDakar,
        "Bonjour Minane Cargo, j'ai rencontré un problème d'affichage sur la plateforme."
      );

      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-[#E2E8F0] shadow-xl p-8 text-center">
            {/* Header Icon */}
            <div className="w-14 h-14 bg-red-50 text-[#E2001A] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-[#042442] mb-2 tracking-tight">
              Une interruption inattendue est survenue
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#475569] mb-6 leading-relaxed">
              L'application a rencontré un incident technique d'affichage. Vos données et vos colis restent parfaitement en sécurité sur nos serveurs.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#042442] hover:bg-[#06335d] text-white text-xs font-bold uppercase tracking-wider transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger l'application</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-[#042442] text-xs font-bold uppercase tracking-wider transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Assistance WhatsApp ({DEFAULT_COMPANY_INFO.phoneDakar})</span>
              </a>
            </div>

            {/* Developer technical details (collapsed) */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left text-[11px] bg-slate-50 p-3 border border-slate-200 text-slate-700 font-mono mt-4 overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-800 mb-1">
                  Détails techniques (Mode Dev)
                </summary>
                <p className="text-red-600 mb-2">{this.state.error.toString()}</p>
                <pre className="text-[10px] whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}

            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400">
              Minane Cargo • Guangzhou ➔ Dakar • Sécurité & Continuité de service
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

