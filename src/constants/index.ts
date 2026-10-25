import type { Offer } from '../types'

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export const CAFE_NAME = 'Sarthak Cafe'
export const CAFE_TAGLINE = 'Fresh food, delivered hot & fast'
export const CAFE_PHONE = '+91 98765 43210'
export const CAFE_PHONE_TEL = '+919876543210'
export const CAFE_EMAIL = 'hello@sarthakcafe.in'
export const CAFE_ADDRESS = 'Shop 12, MG Road, Indore, MP 452001'
export const CAFE_HOURS = 'Open daily · 9:00 AM – 11:00 PM'
export const CAFE_WHATSAPP = '919876543210'
export const CAFE_INSTAGRAM = 'https://instagram.com'
export const CAFE_FOODPAGE = 'https://instagram.com'

/* ------------------------------------------------------------------ */
/* Menu categories                                                     */
/* ------------------------------------------------------------------ */

export interface CategoryDef {
  id: string
  label: string
  emoji: string
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'starters', label: 'Starters', emoji: '🥗' },
  { id: 'main-course', label: 'Main Course', emoji: '🍛' },
  { id: 'breads', label: 'Breads', emoji: '🫓' },
  { id: 'rice-biryani', label: 'Rice & Biryani', emoji: '🍚' },
  { id: 'chinese', label: 'Chinese', emoji: '🥡' },
  { id: 'snacks', label: 'Snacks', emoji: '🥪' },
  { id: 'beverages', label: 'Beverages', emoji: '🥤' },
  { id: 'desserts', label: 'Desserts', emoji: '🍮' },
]

export const categoryLabel = (id: string): string =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id

export const categoryEmoji = (id: string): string =>
  CATEGORIES.find((c) => c.id === id)?.emoji ?? '🍴'

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export const DELIVERY_FEE = 30
export const FREE_DELIVERY_ABOVE = 199
export const GST_RATE = 0.05 // 5% GST on food
export const ESTIMATED_DELIVERY_MINS = 30
export const MAX_QUANTITY_PER_ITEM = 20

/* ------------------------------------------------------------------ */
/* Home page offers                                                    */
/* ------------------------------------------------------------------ */

export const OFFERS: Offer[] = [
  {
    id: 'first-order',
    code: 'SARTHAK50',
    title: 'Flat 50% OFF',
    description: 'On your first order above ₹299',
    from: '#ff7a59',
    to: '#e23744',
  },
  {
    id: 'free-delivery',
    code: 'FREEDEL',
    title: 'Free Delivery',
    description: 'On all orders above ₹199',
    from: '#22c1c3',
    to: '#0f9b8e',
  },
  {
    id: 'combo',
    code: 'COMBO20',
    title: '20% OFF Combos',
    description: 'Chai + snack combos, every evening 4–7 PM',
    from: '#f7971e',
    to: '#ffd200',
  },
  {
    id: 'student',
    code: 'STUDENT10',
    title: 'Student Special',
    description: 'Extra 10% off with a valid ID',
    from: '#8e2de2',
    to: '#e23744',
  },
]

/* ------------------------------------------------------------------ */
/* Order status                                                        */
/* ------------------------------------------------------------------ */

export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
