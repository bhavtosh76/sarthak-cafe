import type { MenuItem } from '../../types'
import { MenuCard } from '../menu/MenuCard'
import styles from './FeaturedItems.module.css'

interface Props {
  items: MenuItem[]
}

/**
 * Home-page grid of items flagged as "featured" in the admin panel.
 * The section heading lives in HomePage so loading/error states share it.
 */
export function FeaturedItems({ items }: Props) {
  const featured = items.filter((item) => item.isFeatured && item.isAvailable).slice(0, 6)
  if (featured.length === 0) return null

  return (
    <div className={styles.grid}>
      {featured.map((item) => (
        <MenuCard key={item.id} item={item} compact />
      ))}
    </div>
  )
}
