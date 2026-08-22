import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

const ArticleRow = ({ nestIndex }) => {
  const { control, register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `categories.${nestIndex}.articles`
  });

  const watchCategories = watch('categories') || [];

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-12 gap-3 pb-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="col-span-4 pl-1">Désignation</div>
        <div className="col-span-2 text-center">CTN</div>
        <div className="col-span-2 text-center">CBM</div>
        <div className="col-span-3 text-right pr-2">Montant HT</div>
        <div className="col-span-1"></div>
      </div>

      {fields.map((article, artIndex) => {

        return (
          <div key={article.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border sm:border-transparent border-slate-200 relative group transition-colors hover:bg-slate-50">
            
            {/* Delete bouton mobile */}
            <button type="button" onClick={() => remove(artIndex)} className="sm:hidden absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="col-span-1 sm:col-span-4">
              <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">Désignation</label>
              <input {...register(`categories.${nestIndex}.articles.${artIndex}.designation`, { required: true })} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white" placeholder="Description de l'article" />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">CTN</label>
              <input type="number" step="1" {...register(`categories.${nestIndex}.articles.${artIndex}.ctn`, { 
                validate: (value, formValues) => {
                  const cbm = formValues.categories[nestIndex].articles[artIndex].cbm;
                  if (!value && !cbm) return "CTN ou CBM requis";
                  return true;
                }
              })} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 text-center border bg-white font-mono" placeholder="0" />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">CBM</label>
              <input type="number" step="0.01" {...register(`categories.${nestIndex}.articles.${artIndex}.cbm`, { 
                validate: (value, formValues) => {
                  const ctn = formValues.categories[nestIndex].articles[artIndex].ctn;
                  if (!value && !ctn) return "CTN ou CBM requis";
                  return true;
                }
              })} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 text-center border bg-white font-mono" placeholder="0" />
            </div>
            
            <div className="col-span-1 sm:col-span-3 text-right">
              <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">Montant</label>
              <div className="relative">
                <input type="number" step="0.01" {...register(`categories.${nestIndex}.articles.${artIndex}.montantHT`, { required: true, min: 0 })} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 text-right border bg-white font-mono" placeholder="0" />
              </div>
            </div>
            
            <div className="hidden sm:flex col-span-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => remove(artIndex)} className="text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 p-1.5 rounded-md border border-slate-200 transition-colors" title="Supprimer la ligne">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            
          </div>
        );
      })}
      
      <div className="pt-2">
        <button 
          type="button" 
          onClick={() => append({ designation: '', ctn: '', cbm: '', montantHT: '' })}
          className="text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Ajouter une ligne
        </button>
      </div>
    </div>
  );
};

export default ArticleRow;

