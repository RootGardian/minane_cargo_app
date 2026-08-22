import React from 'react';
import { useFormContext } from 'react-hook-form';

const DocumentInfoForm = () => {
  const { register } = useFormContext();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informations Générales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Numéro de facture</label>
          <input {...register('numFacture', { required: true })} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-slate-50 placeholder-slate-400 transition-colors" placeholder="Ex: 044" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Date de facturation</label>
          <input type="date" {...register('dateFacture', { required: true })} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-slate-50 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default DocumentInfoForm;

