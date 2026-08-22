import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import ArticleRow from './ArticleRow';

const CategoryList = () => {
  const { control } = useFormContext();
  const { fields: categoryFields } = useFieldArray({
    control,
    name: 'categories'
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Détail de la prestation</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden relative">
        <div className="p-6 overflow-x-auto">
          {categoryFields.length > 0 && (
            <ArticleRow nestIndex={0} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;

