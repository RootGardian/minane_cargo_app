import React from 'react'
import InvoiceForm from './components/InvoiceForm'

function App() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Navbar Premium */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-3">
                {/* Logo SVG Factice */}
                <div className="w-10 h-10 bg-[#C00018] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  MC
                </div>
                <div>
                  <span className="font-bold text-xl text-slate-900 tracking-tight">Minane Cargo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 relative overflow-hidden bg-gradient-to-r from-[#1e2243] to-[#292d5c] p-8 rounded-3xl shadow-lg flex items-center justify-between group">
          {/* Éléments décoratifs (Glassmorphism / Glow) */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#bd1228] rounded-full opacity-20 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
          <div className="absolute -bottom-10 right-20 w-32 h-32 bg-[#4a55a2] rounded-full opacity-20 blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Salut Mamy Yade <span className="animate-wave origin-bottom-right inline-block"></span>
            </h1>
            <p className="text-slate-300 mt-2 font-medium text-lg">Ravi de te revoir ! Prête à générer de nouvelles factures ?</p>
          </div>
        </div>
        <InvoiceForm />
      </main>
    </div>
  )
}

export default App

