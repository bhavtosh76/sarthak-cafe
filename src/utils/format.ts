import type { Timestamp } from 'firebase/firestore'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** ₹1,299 (Indian digit grouping) */
export const formatCurrency = (amount: number): string => inr.format(amount)

/** Accepts Firestore Timestamp, Date or epoch millis; returns "25 Oct 2026, 6:12 PM". */
export function formatDateTime(value: Timestamp | Date | number | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function toDate(value: Timestamp | Date | number | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  // Firestore Timestamp duck-typing (avoids importing the class everywhere)
  if (typeof (value as Timestamp).toDate === 'function') return (value as Timestamp).toDate()
  return null
}
