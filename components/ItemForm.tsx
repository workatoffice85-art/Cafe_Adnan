'use client';

import React, { useState } from 'react';
import { Category, MenuItem } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { X, Sparkles } from 'lucide-react';

interface ItemFormProps {
  item?: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  item,
  categories,
  onClose,
  onSave,
}) => {
  const { t, isRtl, language } = useLanguage();
  
  const [categoryId, setCategoryId] = useState(item?.category_id || categories[0]?.id || '');
  const [nameAr, setNameAr] = useState(item?.name_ar || '');
  const [nameEn, setNameEn] = useState(item?.name_en || '');
  const [descriptionAr, setDescriptionAr] = useState(item?.description_ar || '');
  const [descriptionEn, setDescriptionEn] = useState(item?.description_en || '');
  const [price, setPrice] = useState(item?.price.toString() || '');
  const [available, setAvailable] = useState(item ? item.available : true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedNameAr = nameAr.trim();
    const trimmedNameEn = nameEn.trim();
    const parsedPrice = parseFloat(price);

    if (!categoryId) {
      setError(language === 'ar' ? 'يرجى اختيار قسم للمنتج' : 'Please select a category.');
      return;
    }
    if (!trimmedNameAr || !trimmedNameEn) {
      setError(language === 'ar' ? 'اسم المنتج بالعربية والإنجليزية مطلوب' : 'Product name in Arabic and English is required.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError(language === 'ar' ? 'يرجى إدخال سعر صحيح للمنتج' : 'Please enter a valid price greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        category_id: categoryId,
        name_ar: trimmedNameAr,
        name_en: trimmedNameEn,
        description_ar: descriptionAr.trim() || undefined,
        description_en: descriptionEn.trim() || undefined,
        price: parsedPrice,
        available
      });
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      
      {/* Modal Card */}
      <div className="w-full max-w-lg border border-border bg-card shadow-2xl rounded-sm overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/20">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            {item ? t.editItem : t.addItem}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-foreground transition-colors active:scale-90"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 text-xs text-rose-500 border border-rose-500/20 bg-rose-500/5 rounded-sm font-sans font-medium">
              {error}
            </div>
          )}

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {t.categoryCol} <span className="text-accent">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-sm border border-border bg-background/50 text-sm text-foreground outline-none focus:border-[#C5A880]/70 focus:bg-background transition-all font-sans"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-card text-foreground">
                  {language === 'ar' ? cat.name_ar : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Names Row (Arabic and English) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Arabic Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {t.itemNameAr} <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: لاتيه"
                required
                className="w-full py-2.5 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background transition-all font-sans text-right"
              />
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {t.itemNameEn} <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Latte"
                required
                className="w-full py-2.5 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background transition-all font-sans"
              />
            </div>
          </div>

          {/* Price & Availability Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Item Price */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {t.itemPrice} <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="55"
                required
                className="w-full py-2.5 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background transition-all font-sans"
              />
            </div>

            {/* Availability Toggle */}
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center justify-between py-2.5 px-3 border border-border/80 bg-background/20 rounded-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  {t.itemAvailable}
                </span>
                <Switch checked={available} onChange={setAvailable} />
              </div>
            </div>
          </div>

          {/* Descriptions Row */}
          <div className="space-y-4">
            
            {/* Arabic Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {t.itemDescAr}
              </label>
              <textarea
                dir="rtl"
                rows={2}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="مثال: إسبريسو مزدوج مع حليب مبخر..."
                className="w-full py-2 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background transition-all font-sans text-right resize-none"
              />
            </div>

            {/* English Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {t.itemDescEn}
              </label>
              <textarea
                dir="ltr"
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="e.g. Double espresso with velvety steamed milk..."
                className="w-full py-2 px-3 rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-background transition-all font-sans resize-none"
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div className={`flex items-center gap-3 pt-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
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
export default ItemForm;
