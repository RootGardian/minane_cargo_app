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
        <InvoiceForm />
      </main>
    </div>
  )
}

export default App

