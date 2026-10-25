import type { Timestamp } from 'firebase/firestore'

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

export interface MenuItem {
  /** Firestore document id */
  id: string
  name: string
  description: string
  price: number
  /** Key from CATEGORIES (see src/constants) */
  category: string
  isVeg: boolean
  isAvailable: boolean
  /** Shown on the home page "Must-try" rail */
  isFeatured: boolean
  /** Public download URL of the image stored in Firebase Storage */
  imageUrl: string
  /** Storage path — needed to replace/delete the image later */
  imagePath: string
  rating: number
  prepTimeMins: number
  createdAt?: Timestamp | null
}

/** Payload used when creating/updating a menu item (everything but id). */
export type MenuItemInput = Omit<MenuItem, 'id' | 'createdAt'>

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export interface CartItem {
  itemId: string
  name: string
  price: number
  imageUrl: string
  isVeg: boolean
  quantity: number
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'

export interface CustomerDetails {
  name: string
  phone: string
  address: string
  note?: string
}

export type PaymentMethod = 'cod' | 'upi'

export interface Order {
  id: string
  items: CartItem[]
  customer: CustomerDetails
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt?: Timestamp | null
}

/** Payload sent to Firestore (id is generated server-side). */
export type OrderInput = Omit<Order, 'id' | 'createdAt' | 'status'> & {
  status: OrderStatus
}

/* ------------------------------------------------------------------ */
/* Contact form                                                        */
/* ------------------------------------------------------------------ */

export interface ContactMessage {
  id?: string
  name: string
  email: string
  phone?: string
  message: string
  createdAt?: Timestamp | null
}

/* ------------------------------------------------------------------ */
/* Misc UI models                                                      */
/* ------------------------------------------------------------------ */

export interface Offer {
  id: string
  code: string
  title: string
  description: string
  /** Two hex colours for the card gradient */
  from: string
  to: string
}
