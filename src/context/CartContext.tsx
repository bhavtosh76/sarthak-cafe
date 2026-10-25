import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { MAX_QUANTITY_PER_ITEM } from '../constants'
import type { CartItem } from '../types'

const STORAGE_KEY = 'sarthak-cafe-cart:v1'

interface CartAction {
  type: 'add' | 'setQuantity' | 'remove' | 'clear'
  item?: CartItem
  itemId?: string
  quantity?: number
}

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const incoming = action.item
      if (!incoming) return state
      const existing = state.find((i) => i.itemId === incoming.itemId)
      if (!existing) {
        return [...state, { ...incoming, quantity: Math.min(incoming.quantity, MAX_QUANTITY_PER_ITEM) }]
      }
      return state.map((i) =>
        i.itemId === incoming.itemId
          ? { ...i, quantity: Math.min(i.quantity + incoming.quantity, MAX_QUANTITY_PER_ITEM) }
          : i,
      )
    }
    case 'setQuantity': {
      if (!action.itemId || action.quantity === undefined) return state
      if (action.quantity <= 0) return state.filter((i) => i.itemId !== action.itemId)
      return state.map((i) =>
        i.itemId === action.itemId
          ? { ...i, quantity: Math.min(action.quantity!, MAX_QUANTITY_PER_ITEM) }
          : i,
      )
    }
    case 'remove':
      return state.filter((i) => i.itemId !== action.itemId)
    case 'clear':
      return []
    default:
      return state
  }
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as CartItem).itemId === 'string' &&
        typeof (i as CartItem).quantity === 'number',
    )
  } catch {
    return []
  }
}

export interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  quantityOf: (itemId: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart)

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full / private mode — cart simply won't survive a refresh.
    }
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    dispatch({ type: 'add', item: { ...item, quantity } })
  }, [])

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'setQuantity', itemId, quantity })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'remove', itemId })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return {
      items,
      totalItems,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      quantityOf: (itemId: string) => items.find((i) => i.itemId === itemId)?.quantity ?? 0,
    }
  }, [items, addItem, setQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
