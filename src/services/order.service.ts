import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Order, OrderInput, OrderStatus } from '../types'
import { withoutUndefined } from '../utils/firestore'

const COLLECTION = 'orders'

function toOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    items: (data.items as Order['items']) ?? [],
    customer: (data.customer as Order['customer']) ?? { name: '', phone: '', address: '' },
    subtotal: Number(data.subtotal ?? 0),
    deliveryFee: Number(data.deliveryFee ?? 0),
    total: Number(data.total ?? 0),
    paymentMethod: (data.paymentMethod as Order['paymentMethod']) ?? 'cod',
    status: (data.status as OrderStatus) ?? 'placed',
    createdAt: (data.createdAt as Timestamp | null) ?? null,
  }
}

/** Places a new order and returns its document id. */
export async function createOrder(input: OrderInput): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTION), withoutUndefined({
    ...input,
    createdAt: serverTimestamp(),
  }))
  return ref.id
}

/** Fetches a single order (used by the confirmation page). */
export async function fetchOrder(id: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db(), COLLECTION, id))
  if (!snapshot.exists()) return null
  return toOrder(snapshot.id, snapshot.data())
}

/** Admin: newest orders first. */
export async function fetchOrders(): Promise<Order[]> {
  const snapshot = await getDocs(query(collection(db(), COLLECTION), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((d) => toOrder(d.id, d.data()))
}

/** Admin: moves an order through the fulfilment pipeline. */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db(), COLLECTION, id), { status })
}
