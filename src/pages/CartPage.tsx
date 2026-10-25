import { Link } from 'react-router-dom'
import { FREE_DELIVERY_ABOVE } from '../constants'
import { useCart } from '../context/CartContext'
import { computeOrderSummary } from '../utils/pricing'
import { formatCurrency } from '../utils/format'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { QuantityStepper } from '../components/common/QuantityStepper'
import { VegBadge } from '../components/common/VegBadge'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, subtotal, totalItems, setQuantity, removeItem } = useCart()
  const summary = computeOrderSummary(subtotal)

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            emoji="🛒"
            title="Your cart is empty"
            message="Add something delicious from the menu to get started."
          >
            <Button to="/menu">Browse menu</Button>
          </EmptyState>
        </div>
      </div>
    )
  }

  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_ABOVE - subtotal)

  return (
    <div className="section">
      <div className="container">
        <header className={styles.head}>
          <h1>Your cart</h1>
          <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
        </header>

        <div className={styles.layout}>
          <ul className={styles.list} role="list">
            {items.map((item) => (
              <li key={item.itemId} className={styles.row}>
                <img src={item.imageUrl} alt="" width={76} height={76} loading="lazy" />
                <div className={styles.info}>
                  <div className={styles.nameLine}>
                    <VegBadge isVeg={item.isVeg} />
                    <h3>{item.name}</h3>
                  </div>
                  <p className={styles.unitPrice}>{formatCurrency(item.price)} each</p>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeItem(item.itemId)}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.actions}>
                  <QuantityStepper
                    quantity={item.quantity}
                    onAdd={() => setQuantity(item.itemId, item.quantity + 1)}
                    onIncrement={() => setQuantity(item.itemId, item.quantity + 1)}
                    onDecrement={() => setQuantity(item.itemId, item.quantity - 1)}
                    itemName={item.name}
                  />
                  <strong className={styles.lineTotal}>
                    {formatCurrency(item.price * item.quantity)}
                  </strong>
                </div>
              </li>
            ))}
          </ul>

          <aside className={styles.summary}>
            <h2>Bill details</h2>

            <dl className={styles.bill}>
              <div>
                <dt>Item total</dt>
                <dd>{formatCurrency(summary.subtotal)}</dd>
              </div>
              <div>
                <dt>GST (5%)</dt>
                <dd>{formatCurrency(summary.gst)}</dd>
              </div>
              <div>
                <dt>
                  Delivery fee
                  {summary.deliverySavings > 0 && <span className={styles.free}>FREE</span>}
                </dt>
                <dd>{formatCurrency(summary.deliveryFee)}</dd>
              </div>
              <div className={styles.grand}>
                <dt>To pay</dt>
                <dd>{formatCurrency(summary.total)}</dd>
              </div>
            </dl>

            {remainingForFreeDelivery > 0 ? (
              <p className={styles.hint}>
                Add items worth <strong>{formatCurrency(remainingForFreeDelivery)}</strong> more for
                free delivery
              </p>
            ) : (
              <p className={`${styles.hint} ${styles.hintOk}`}>
                🎉 You&apos;ve unlocked free delivery!
              </p>
            )}

            <Button to="/checkout" fullWidth size="lg">
              Proceed to checkout
            </Button>
            <Link to="/menu" className={styles.continue}>
              + Add more items
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
