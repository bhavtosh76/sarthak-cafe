import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAFE_HOURS } from '../constants'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { isFirebaseConfigured } from '../config/firebase'
import { createOrder } from '../services/order.service'
import { computeOrderSummary } from '../utils/pricing'
import { formatCurrency } from '../utils/format'
import { Button } from '../components/common/Button'
import { VegBadge } from '../components/common/VegBadge'
import type { CustomerDetails, PaymentMethod } from '../types'
import styles from './CheckoutPage.module.css'

interface FormErrors {
  name?: string
  phone?: string
  address?: string
}

function validate(customer: CustomerDetails): FormErrors {
  const errors: FormErrors = {}
  if (customer.name.trim().length < 2) errors.name = 'Please enter your full name'
  if (!/^[6-9]\d{9}$/.test(customer.phone.trim()))
    errors.phone = 'Enter a valid 10-digit mobile number'
  if (customer.address.trim().length < 10)
    errors.address = 'Add a complete delivery address (min. 10 characters)'
  return errors
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    address: '',
    note: '',
  })
  const [payment, setPayment] = useState<PaymentMethod>('cod')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  // Set synchronously before the cart is cleared, so the empty-cart redirect
  // below never races the navigation to the order-confirmation page.
  const orderPlacedRef = useRef(false)

  const summary = computeOrderSummary(subtotal)

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) navigate('/cart', { replace: true })
  }, [items.length, navigate])

  const update = (field: keyof CustomerDetails, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(customer)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      showToast('Please fix the highlighted fields', 'error')
      return
    }

    setSubmitting(true)
    try {
      const note = customer.note?.trim()
      const orderId = await createOrder({
        items,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          // Firestore rejects `undefined`, so only send the note when present.
          ...(note ? { note } : {}),
        },
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        total: summary.total,
        paymentMethod: payment,
        status: 'placed',
      })
      orderPlacedRef.current = true
      clearCart()
      navigate(`/order-success/${orderId}`, { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not place the order'
      showToast(message, 'error')
      setSubmitting(false)
    }
  }

  return (
    <div className="section">
      <div className="container">
        <header className={styles.head}>
          <h1>Checkout</h1>
          <p>Step 2 of 2 — delivery details &amp; payment</p>
        </header>

        {!isFirebaseConfigured && (
          <div className={styles.notice} role="alert">
            <strong>Setup required:</strong> Firebase keys are missing, so the order cannot be
            saved yet. Add keys to <code>.env</code> and restart the dev server to place real
            orders.
          </div>
        )}

        <div className={styles.layout}>
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <section className={styles.card}>
              <h2>Delivery details</h2>

              <div className={styles.fields}>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Rahul Sharma"
                    value={customer.name}
                    onChange={(event) => update('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="fieldError">{errors.name}</span>}
                </div>

                <div className="field">
                  <label htmlFor="phone">Mobile number</label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={customer.phone}
                    onChange={(event) => update('phone', event.target.value.replace(/\D/g, ''))}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <span className="fieldError">{errors.phone}</span>}
                </div>

                <div className="field">
                  <label htmlFor="address">Delivery address</label>
                  <textarea
                    id="address"
                    rows={3}
                    autoComplete="street-address"
                    placeholder="Flat / house no., street, landmark, city"
                    value={customer.address}
                    onChange={(event) => update('address', event.target.value)}
                    aria-invalid={Boolean(errors.address)}
                  />
                  {errors.address && <span className="fieldError">{errors.address}</span>}
                </div>

                <div className="field">
                  <label htmlFor="note">Instructions for the kitchen (optional)</label>
                  <input
                    id="note"
                    type="text"
                    placeholder="Less spicy, no onions…"
                    value={customer.note ?? ''}
                    onChange={(event) => update('note', event.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2>Payment method</h2>
              <div className={styles.payments}>
                <label className={styles.payOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={payment === 'cod'}
                    onChange={() => setPayment('cod')}
                  />
                  <span>
                    <strong>Cash on delivery</strong>
                    <small>Pay the rider when your food arrives</small>
                  </span>
                </label>
                <label className={styles.payOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={payment === 'upi'}
                    onChange={() => setPayment('upi')}
                  />
                  <span>
                    <strong>UPI on delivery</strong>
                    <small>GPay / PhonePe / Paytm at your door</small>
                  </span>
                </label>
              </div>
            </section>

            <Button type="submit" size="lg" fullWidth loading={submitting} disabled={!isFirebaseConfigured}>
              {submitting ? 'Placing order…' : `Place order · ${formatCurrency(summary.total)}`}
            </Button>
          </form>

          <aside className={styles.summary}>
            <h2>Order summary</h2>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.itemId}>
                  <span className={styles.itemName}>
                    <VegBadge isVeg={item.isVeg} />
                    {item.name} <small>× {item.quantity}</small>
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

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
                <dt>Delivery fee</dt>
                <dd>{formatCurrency(summary.deliveryFee)}</dd>
              </div>
              <div className={styles.total}>
                <dt>To pay</dt>
                <dd>{formatCurrency(summary.total)}</dd>
              </div>
            </dl>

            <p className={styles.eta}>
              🛵 Estimated delivery in 30 minutes · {CAFE_HOURS}
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
