import { Link } from 'react-router-dom'
import { isFirebaseConfigured } from '../../config/firebase'
import { ORDER_STATUS_LABELS } from '../../constants'
import { useMenu } from '../../hooks/useMenu'
import { useOrders } from '../../hooks/useOrders'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Loader } from '../../components/common/Loader'
import styles from './DashboardPage.module.css'

const ACTIVE_STATUSES = ['placed', 'confirmed', 'preparing', 'out-for-delivery']

export default function DashboardPage() {
  const { data: menu } = useMenu()
  const { orders, loading, error, reload } = useOrders()

  const safeOrders = orders ?? []
  const pending = safeOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
  const revenue = safeOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const recent = safeOrders.slice(0, 5)

  const stats = [
    { label: 'Menu items', value: menu ? String(menu.length) : '—', emoji: '🍽️' },
    { label: 'Total orders', value: orders ? String(safeOrders.length) : '—', emoji: '🧾' },
    { label: 'Pending', value: orders ? String(pending) : '—', emoji: '⏳' },
    { label: 'Revenue', value: orders ? formatCurrency(revenue) : '—', emoji: '💰' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Dashboard</h1>
          <p>Everything at a glance</p>
        </div>
        <div className={styles.actions}>
          <Button to="/admin/orders" variant="secondary" size="sm">
            View orders
          </Button>
          <Button to="/admin/menu" size="sm">
            Manage menu
          </Button>
        </div>
      </header>

      {!isFirebaseConfigured && (
        <div className={styles.notice}>
          <strong>Demo mode:</strong> add Firebase keys to <code>.env</code> to see live orders and
          revenue here. Menu statistics below are from local demo data.
        </div>
      )}

      <div className={styles.stats}>
        {stats.map((stat) => (
          <article key={stat.label} className={styles.stat}>
            <span aria-hidden="true">{stat.emoji}</span>
            <div>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </div>
          </article>
        ))}
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Recent orders</h2>
          <Link to="/admin/orders">View all →</Link>
        </div>

        {!isFirebaseConfigured ? (
          <EmptyState
            emoji="🔒"
            title="Orders need Firebase"
            message="Configure Firebase in .env — orders placed on the store will then appear here."
          />
        ) : loading ? (
          <Loader label="Loading orders…" />
        ) : error ? (
          <EmptyState emoji="😵" title="Could not load orders" message={error}>
            <Button onClick={() => void reload()}>Try again</Button>
          </EmptyState>
        ) : recent.length === 0 ? (
          <EmptyState emoji="📭" title="No orders yet" message="New orders will show up here." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.mono}>#{order.id.slice(0, 6).toUpperCase()}</td>
                    <td>
                      {order.customer.name}
                      <small className={styles.sub}>{order.customer.phone}</small>
                    </td>
                    <td>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <span className={`${styles.status} ${styles[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
