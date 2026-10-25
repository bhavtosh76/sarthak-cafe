import type { MenuItem } from '../../types'
import { useCart } from '../../context/CartContext'
import { categoryLabel } from '../../constants'
import { formatCurrency } from '../../utils/format'
import { QuantityStepper } from '../common/QuantityStepper'
import { VegBadge } from '../common/VegBadge'
import styles from './MenuCard.module.css'

interface Props {
  item: MenuItem
  compact?: boolean
}

/** Food card used on the home page and the menu grid. */
export function MenuCard({ item, compact = false }: Props) {
  const { addItem, setQuantity, quantityOf } = useCart()
  const quantity = quantityOf(item.id)

  const handleAdd = () => {
    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
    })
  }

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.imageWrap}>
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          width={400}
          height={260}
          onError={(event) => {
            event.currentTarget.style.opacity = '0.4'
          }}
        />
        {!item.isAvailable && <span className={styles.unavailable}>Currently unavailable</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <VegBadge isVeg={item.isVeg} />
          <span className={styles.rating}>
            <span aria-hidden="true">★</span>
            {item.rating.toFixed(1)}
          </span>
          <span className={styles.category}>{categoryLabel(item.category)}</span>
        </div>

        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.desc}>{item.description}</p>

        <div className={styles.footer}>
          <div className={styles.priceCol}>
            <span className={styles.price}>{formatCurrency(item.price)}</span>
            <span className={styles.time}>{item.prepTimeMins} min</span>
          </div>
          <QuantityStepper
            quantity={quantity}
            onAdd={handleAdd}
            onIncrement={() => setQuantity(item.id, quantity + 1)}
            onDecrement={() => setQuantity(item.id, quantity - 1)}
            itemName={item.name}
            compact={compact}
          />
        </div>
      </div>
    </article>
  )
}
