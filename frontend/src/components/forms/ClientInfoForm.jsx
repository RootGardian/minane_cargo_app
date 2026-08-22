import React from 'react';
import { useFormContext } from 'react-hook-form';

const ClientInfoForm = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informations Client</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nom Complet / Entreprise</label>
          <input {...register('client.nom', { required: true })} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-slate-50 placeholder-slate-400" placeholder="Ex: Nom de l'entreprise ou du client" />
          {errors.client?.nom && <span className="text-red-500 text-xs mt-1 block">Ce champ est requis</span>}
        </div>
      </div>
    </div>
  );
};

export default ClientInfoForm;

