import { useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../../config/firebase'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../constants'
import { useToast } from '../../context/ToastContext'
import { useOrders } from '../../hooks/useOrders'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Loader } from '../../components/common/Loader'
import type { OrderStatus } from '../../types'
import styles from './OrdersPage.module.css'

type Filter = OrderStatus | 'all'

export default function OrdersPage() {
  const { orders, loading, error, reload, changeStatus } = useOrders()
  const { showToast } = useToast()

  const [filter, setFilter] = useState<Filter>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(
    () => (orders ?? []).filter((order) => filter === 'all' || order.status === filter),
    [orders, filter],
  )

  const onStatusChange = async (id: string, status: OrderStatus) => {
    setBusyId(id)
    try {
      await changeStatus(id, status)
      showToast(`Order marked "${ORDER_STATUS_LABELS[status]}"`, 'success')
    } catch (caught) {
      showToast(caught instanceof Error ? caught.message : 'Could not update status', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Orders</h1>
          <p>{orders ? `${orders.length} total` : 'Loading…'}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reload()} disabled={loading}>
          ↻ Refresh
        </Button>
      </header>

      {!isFirebaseConfigured && (
        <div className={styles.notice}>
          <strong>Demo mode:</strong> add Firebase keys to <code>.env</code> to receive live orders.
        </div>
      )}

      <div className={styles.filters} role="group" aria-label="Filter orders by status">
        <button
          type="button"
          className={`${styles.chip} ${filter === 'all' ? styles.chipActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`${styles.chip} ${filter === status ? styles.chipActive : ''}`}
            onClick={() => setFilter(status)}
          >
            {ORDER_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {loading && <Loader label="Loading orders…" />}

      {!loading && error && (
        <EmptyState emoji="😵" title="Could not load orders" message={error}>
          <Button onClick={() => void reload()}>Try again</Button>
        </EmptyState>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState emoji="📭" title="No orders here" message="Nothing matches this filter yet." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className={styles.list} role="list">
          {filtered.map((order) => (
            <li key={order.id} className={styles.card}>
              <div className={styles.top}>
                <strong className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</strong>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className={styles.grid}>
                <div>
                  <h3>Customer</h3>
                  <p>
                    {order.customer.name}
                    <br />
                    <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
                  </p>
                  <p className={styles.address}>{order.customer.address}</p>
                  {order.customer.note && <p className={styles.note}>📝 {order.customer.note}</p>}
                </div>

                <div>
                  <h3>Items</h3>
                  <ul className={styles.items}>
                    {order.items.map((item) => (
                      <li key={item.itemId}>
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3>Payment</h3>
                  <p>
                    {formatCurrency(order.total)}
                    <br />
                    <small>
                      via {order.paymentMethod === 'cod' ? 'cash' : 'UPI'} ·{' '}
                      {formatDateTime(order.createdAt)}
                    </small>
                  </p>

                  <label className={styles.statusControl}>
                    <span>Update status</span>
                    <select
                      value={order.status}
                      disabled={busyId === order.id}
                      onChange={(event) =>
                        void onStatusChange(order.id, event.target.value as OrderStatus)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
