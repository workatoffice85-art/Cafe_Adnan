'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/Button';
import { X, Sparkles } from 'lucide-react';

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
  onSave: (nameAr: string, nameEn: string) => Promise<void>;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onClose,
  onSave,
}) => {
  const { t, isRtl } = useLanguage();
  const [nameAr, setNameAr] = useState(category?.name_ar || '');
  const [nameEn, setNameEn] = useState(category?.name_en || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedAr = nameAr.trim();
    const trimmedEn = nameEn.trim();

    if (!trimmedAr || !trimmedEn) {
      setError(t.errorOccurred || 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await onSave(trimmedAr, trimmedEn);
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      
      {/* Modal Card */}
      <div className="w-full max-w-md border border-border bg-card shadow-2xl rounded-sm overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/20">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            {category ? t.editCategory : t.addCategory}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-foreground transition-colors active:scale-90"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs text-rose-500 border border-rose-500/20 bg-rose-500/5 rounded-sm font-sans font-medium">
              {error}
            </div>
          )}

          {/* Arabic Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {t.categoryNameAr} <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: المشروبات الساخنة"
              required
              className="w-full py-2.5 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background focus:ring-1 focus:ring-[#C5A880]/30 transition-all font-sans text-right"
            />
          </div>

          {/* English Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {t.categoryNameEn} <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              dir="ltr"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Hot Beverages"
              required
              className="w-full py-2.5 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background focus:ring-1 focus:ring-[#C5A880]/30 transition-all font-sans"
            />
          </div>

          {/* Buttons row */}
          <div className={`flex items-center gap-3 pt-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="accent"
              isLoading={loading}
              className="w-full py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm"
            >
              {t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CategoryForm;
