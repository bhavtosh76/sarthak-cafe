import { useCallback, useEffect, useState } from 'react'
import { fetchOrders, updateOrderStatus } from '../services/order.service'
import type { Order, OrderStatus } from '../types'
import { toFriendlyMessage } from './useMenu'

/** Admin: loads all orders and exposes a status updater. */
export function useOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Bumped by `reload()` (event handlers) to refetch without setState-in-effect.
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const result = await fetchOrders()
        if (!cancelled) setOrders(result)
      } catch (caught) {
        if (!cancelled) setError(toFriendlyMessage(caught))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tick])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setTick((value) => value + 1)
  }, [])

  const changeStatus = useCallback(async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status)
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? prev)
  }, [])

  return { orders, loading, error, reload, changeStatus }
}
