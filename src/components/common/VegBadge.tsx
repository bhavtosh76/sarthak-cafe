import styles from './VegBadge.module.css'

/** Indian veg / non-veg indicator (green or red square with a dot). */
export function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`${styles.badge} ${isVeg ? styles.veg : styles.nonVeg}`}
      role="img"
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={styles.dot} />
    </span>
  )
}
