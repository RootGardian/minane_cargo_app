import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import InvoicePreview from './InvoicePreview';
import DocumentInfoForm from './forms/DocumentInfoForm';
import ClientInfoForm from './forms/ClientInfoForm';
import CategoryList from './forms/CategoryList';
import { calculateTotals } from '../utils/calculations';
import html2pdf from 'html2pdf.js';

const InvoiceForm = () => {
  const [showPreview, setShowPreview] = useState(false);
  
  const componentRef = useRef();

  const methods = useForm({
    defaultValues: {
      type: 'Facture',
      numFacture: '',
      dateFacture: new Date().toISOString().split('T')[0],
      categories: [
        { nom: 'Prestations', typeCategorie: 'Prestations', articles: [{ designation: '', ctn: '', cbm: '', montantHT: '' }] }
      ]
    }
  });

  const { handleSubmit, watch } = methods;

  const allFields = watch();
  
  // Calcul dynamique des totaux
  const { ht, total, montantEnLettres } = calculateTotals(allFields.categories);

  const onSubmit = async (data) => {
    setShowPreview(true);
  };

  const handlePrint = async (e) => {
    e.preventDefault();
    const element = componentRef.current;
    if (!element) return;
    
    try {
      const clientName = allFields.client?.nom || 'Client';
      const dateStr = new Date().toISOString().split('T')[0];
      const numFacture = allFields.numFacture || `044`;
      const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${numFacture}_${safeClientName}.pdf`;

      const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (navigator.share) {
        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Facture ${numFacture}`,
            text: `Voici la facture pour ${clientName}.`,
            files: [file]
          });
        } else {
          await html2pdf().set(opt).from(element).save();
        }
      } else {
        await html2pdf().set(opt).from(element).save();
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la création ou du partage du PDF.");
    }
  };

  if (showPreview) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Aperçu avant impression</h2>
          <button 
            type="button"
            onClick={() => setShowPreview(false)} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 relative z-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'édition
          </button>
        </div>
        
        <div className="w-full overflow-x-auto shadow-inner rounded-xl border border-slate-300 bg-slate-100 p-2 sm:p-8">
          <div className="min-w-max flex sm:justify-center">
            <div className="shadow-2xl bg-white">
              <InvoicePreview ref={componentRef} data={watch()} totaux={{totalHT: ht, total, montantEnLettres}} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 w-full max-w-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 relative z-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager (WhatsApp / PDF)
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
        
        {/* Colonne Principale */}
        <div className="lg:col-span-8 space-y-8">
          
          <DocumentInfoForm />
          
          <ClientInfoForm />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <CategoryList />
          </div>
        </div>

        {/* Colonne Latérale : Résumé */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-24 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 text-white overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
            
            <div className="p-6 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-200">Résumé de la facture</h3>
              <p className="text-slate-400 text-sm mt-1">Calculé en temps réel</p>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-sm">Total HT</span>
                  <span className="font-medium">{ht.toLocaleString('fr-FR')} <span className="text-xs text-slate-500">FCFA</span></span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-700/50">
                <div className="flex justify-between items-end">
                  <span className="text-base font-semibold text-slate-200">Total</span>
                  <span className="text-3xl font-bold text-white tracking-tight">{total.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">FCFA</span></span>
                </div>
              </div>

              {montantEnLettres && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Arrêté à la somme de</span>
                  <span className="text-sm italic text-slate-300 leading-snug block capitalize">{montantEnLettres}</span>
                </div>
              )}
              
            </div>

            <div className="p-6 bg-slate-800/30 border-t border-slate-800 backdrop-blur-sm">
              <button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Prévisualiser & Enregistrer
              </button>
            </div>

          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default InvoiceForm;

