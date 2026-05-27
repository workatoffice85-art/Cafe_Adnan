export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  available: boolean;
  created_at?: string;
}

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface AdminStats {
  totalCategories: number;
  totalItems: number;
  availableItems: number;
  unavailableItems: number;
}
