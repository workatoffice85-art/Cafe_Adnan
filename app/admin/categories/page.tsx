'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { CategoryForm } from '@/components/CategoryForm';
import { Button } from '@/components/ui/Button';
import { Plus, Edit3, Trash2, FolderPlus } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'cafe_adnan_demo_categories';

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name_ar: 'القهوة', name_en: 'Coffee' },
  { id: 'cat-2', name_ar: 'المشروبات الباردة', name_en: 'Cold Drinks' },
  { id: 'cat-3', name_ar: 'الحلويات', name_en: 'Desserts' }
];

export default function AdminCategories() {
  const { t, isRtl } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      // Fallback
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkModeAndFetch = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const demo = !supabaseUrl || supabaseUrl.includes('your-supabase-project') || supabaseUrl.includes('placeholder');
      setIsDemoMode(demo);

      if (demo) {
        // Load from localStorage or mock
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setCategories(JSON.parse(saved));
        } else {
          setCategories(MOCK_CATEGORIES);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
        }
        setLoading(false);
      } else {
        await fetchCategories();
      }
    };

    checkModeAndFetch();
  }, []);

  const handleSaveCategory = async (nameAr: string, nameEn: string) => {
    if (isDemoMode) {
      let updated: Category[] = [];
      if (selectedCategory) {
        // Edit Mode
        updated = categories.map(cat => 
          cat.id === selectedCategory.id 
            ? { ...cat, name_ar: nameAr, name_en: nameEn } 
            : cat
        );
      } else {
        // Create Mode
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name_ar: nameAr,
          name_en: nameEn,
          created_at: new Date().toISOString()
        };
        updated = [...categories, newCat];
      }
      setCategories(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } else {
      // Production Supabase DB save
      if (selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ name_ar: nameAr, name_en: nameEn })
          .eq('id', selectedCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({ name_ar: nameAr, name_en: nameEn });
        if (error) throw error;
      }
      await fetchCategories();
    }
    
    setFormOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmDelete = window.confirm(t.deleteConfirm);
    if (!confirmDelete) return;

    if (isDemoMode) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      
      // Also cleanup demo items related to this category if any
      const savedItems = localStorage.getItem('cafe_adnan_demo_items');
      if (savedItems) {
        const items = JSON.parse(savedItems) as { category_id: string }[];
        const filteredItems = items.filter(item => item.category_id !== id);
        localStorage.setItem('cafe_adnan_demo_items', JSON.stringify(filteredItems));
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) {
        alert(t.errorOccurred);
      } else {
        await fetchCategories();
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header and Add Button */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6`}>
        <div>
          <h1 className="text-xl font-bold tracking-widest text-foreground uppercase">
            {t.manageCategories}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans tracking-wide mt-1">
            {t.manageCategoriesSub}
          </p>
        </div>
        
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setFormOpen(true);
          }}
          variant="accent"
          className="flex items-center justify-center gap-2 self-start py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm select-none"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addCategory}</span>
        </Button>
      </div>

      {/* Main Categories Panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-6 w-6 text-accent mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-widest">{t.loading}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border bg-card/10 rounded-sm">
          <FolderPlus className="h-10 w-10 text-neutral-400 dark:text-neutral-600 mb-4" />
          <p className="text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 max-w-xs font-sans">
            No sections created yet. Add your first coffee or dessert category to start!
          </p>
        </div>
      ) : (
        <div className="border border-border bg-card/30 rounded-sm overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-card/30 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  <th className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.categoryNameAr}</th>
                  <th className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.categoryNameEn}</th>
                  <th className="px-6 py-4 text-center">{t.actionsCol}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-border/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className={`px-6 py-4 font-bold text-sm tracking-wide text-foreground ${isRtl ? 'text-right font-sans' : 'text-left font-sans'}`}>
                      {category.name_ar}
                    </td>
                    <td className={`px-6 py-4 font-semibold text-sm text-foreground tracking-wide ${isRtl ? 'text-right font-sans' : 'text-left font-sans'}`}>
                      {category.name_en}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setFormOpen(true);
                        }}
                        className="p-2 border border-border text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-sm transition-all active:scale-90"
                        title="Edit Section"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 border border-rose-500/10 text-rose-500 hover:text-white hover:bg-rose-500 rounded-sm transition-all active:scale-90"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popup Form Dialog */}
      {formOpen && (
        <CategoryForm
          key={selectedCategory?.id || 'new'}
          category={selectedCategory}
          onClose={() => {
            setFormOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}
