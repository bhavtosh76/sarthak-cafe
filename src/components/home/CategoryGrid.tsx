import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../constants'
import styles from './CategoryGrid.module.css'

/** "What's on your mind?" category shortcuts. */
export function CategoryGrid() {
  return (
    <section className="section">
      <div className="container">
        <div className="sectionHead">
          <div>
            <h2>What&apos;s on your mind?</h2>
            <p>Jump straight to a category</p>
          </div>
          <Link to="/menu" className={styles.viewAll}>
            View full menu →
          </Link>
        </div>

        <ul className={styles.grid} role="list">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link to={`/menu?category=${category.id}`} className={styles.item}>
                <span className={styles.icon} aria-hidden="true">
                  {category.emoji}
                </span>
                <span className={styles.label}>{category.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
