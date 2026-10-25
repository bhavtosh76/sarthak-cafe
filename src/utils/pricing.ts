import { DELIVERY_FEE, FREE_DELIVERY_ABOVE, GST_RATE } from '../constants'

export interface OrderSummary {
  subtotal: number
  deliveryFee: number
  gst: number
  total: number
  /** Amount saved via free delivery (0 when not applicable) */
  deliverySavings: number
}

/** Single source of truth for cart/order money math. */
export function computeOrderSummary(subtotal: number): OrderSummary {
  const isFreeDelivery = subtotal > 0 && subtotal >= FREE_DELIVERY_ABOVE
  const deliveryFee = subtotal === 0 || isFreeDelivery ? 0 : DELIVERY_FEE
  const gst = Math.round(subtotal * GST_RATE)
  return {
    subtotal,
    deliveryFee,
    gst,
    total: subtotal + deliveryFee + gst,
    deliverySavings: isFreeDelivery ? DELIVERY_FEE : 0,
  }
}
