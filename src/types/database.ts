export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  price: number;
  available: boolean;
  sort_order: number;
  created_at: string;
}

export interface CategoryWithItems extends Category {
  menu_items: MenuItem[];
}

export interface Debt {
  id: string;
  customer_name: string;
  description: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export type Language = 'ar' | 'en';
