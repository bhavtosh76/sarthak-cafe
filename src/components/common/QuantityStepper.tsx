import styles from './QuantityStepper.module.css'

interface Props {
  quantity: number
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
  /** Accessible label of the item this stepper controls */
  itemName: string
  compact?: boolean
}

/**
 * "Add" pill that turns into a −/qty/+ stepper once the item is in the cart.
 * Used on menu cards and cart rows.
 */
export function QuantityStepper({
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  itemName,
  compact = false,
}: Props) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        className={`${styles.add} ${compact ? styles.compact : ''}`}
        onClick={onAdd}
        aria-label={`Add ${itemName} to cart`}
      >
        ADD
      </button>
    )
  }

  return (
    <div className={`${styles.stepper} ${compact ? styles.compact : ''}`} role="group">
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Remove one ${itemName}`}
        className={styles.control}
      >
        −
      </button>
      <span className={styles.count} aria-label={`${itemName} quantity: ${quantity}`}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Add one more ${itemName}`}
        className={styles.control}
      >
        +
      </button>
    </div>
  )
}
