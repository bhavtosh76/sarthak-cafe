import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ESTIMATED_DELIVERY_MINS, ORDER_STATUS_LABELS } from '../constants'
import { isFirebaseConfigured } from '../config/firebase'
import { useToast } from '../context/ToastContext'
import { fetchOrder } from '../services/order.service'
import { formatCurrency, formatDateTime } from '../utils/format'
import { Button } from '../components/common/Button'
import { Loader } from '../components/common/Loader'
import type { Order } from '../types'
import styles from './OrderSuccessPage.module.css'

const STEPS = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'] as const

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { showToast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  // Only fetch (and show the spinner) when there is something to fetch.
  const [loading, setLoading] = useState(() => Boolean(orderId) && isFirebaseConfigured)

  useEffect(() => {
    if (!orderId || !isFirebaseConfigured) return

    let cancelled = false
    fetchOrder(orderId)
      .then((result) => {
        if (!cancelled) setOrder(result)
      })
      .catch(() => {
        if (!cancelled) showToast('Could not fetch order details', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderId, showToast])

  if (loading) return <Loader label="Fetching your order…" />

  const status = order?.status ?? 'placed'
  const currentStep = STEPS.indexOf(status as (typeof STEPS)[number])
  const isCancelled = status === 'cancelled'

  const copyId = async () => {
    if (!orderId) return
    try {
      await navigator.clipboard.writeText(orderId)
      showToast('Order id copied', 'success')
    } catch {
      showToast(`Order id: ${orderId}`, 'info')
    }
  }

  return (
    <div className="section">
      <div className="container">
        <div className={styles.card}>
          <div className={`${styles.tick} ${isCancelled ? styles.tickBad : ''}`} aria-hidden="true">
            {isCancelled ? '✕' : '✓'}
          </div>

          <h1>{isCancelled ? 'Order cancelled' : 'Order placed successfully!'}</h1>
          <p className={styles.sub}>
            {isCancelled
              ? 'Contact us if this was a mistake.'
              : `Your food will reach you in about ${ESTIMATED_DELIVERY_MINS} minutes.`}
          </p>

          {orderId && (
            <button type="button" className={styles.orderId} onClick={() => void copyId()}>
              Order #{orderId.slice(0, 8).toUpperCase()} <span>copy</span>
            </button>
          )}

          {!isCancelled && (
            <ol className={styles.timeline} aria-label="Order progress">
              {STEPS.map((step, index) => (
                <li
                  key={step}
                  className={
                    currentStep < 0
                      ? index === 0
                        ? styles.done
                        : ''
                      : index <= currentStep
                        ? styles.done
                        : ''
                  }
                >
                  <span className={styles.dot} aria-hidden="true" />
                  {ORDER_STATUS_LABELS[step]}
                </li>
              ))}
            </ol>
          )}

          {order && (
            <div className={styles.summary}>
              <h2>Summary</h2>
              <ul>
                {order.items.map((item) => (
                  <li key={item.itemId}>
                    <span>
                      {item.name} <small>× {item.quantity}</small>
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.totalRow}>
                <span>Paid via {order.paymentMethod === 'cod' ? 'cash' : 'UPI'} on delivery</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
              {order.createdAt && (
                <p className={styles.placedAt}>Placed on {formatDateTime(order.createdAt)}</p>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <Button to="/menu">Order more</Button>
            <Button to="/" variant="secondary">
              Back to home
            </Button>
          </div>

          <p className={styles.help}>
            Need help? <Link to="/about">Contact the cafe</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
