import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Hero.module.css'

const POPULAR = ['Paneer Tikka', 'Biryani', 'Cold Coffee', 'Brownie']

/** Landing hero: headline + food search + trust stats. */
export function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const goToMenu = (term: string) => {
    const trimmed = term.trim()
    navigate(trimmed ? `/menu?q=${encodeURIComponent(trimmed)}` : '/menu')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    goToMenu(query)
  }

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>🍕 Free delivery above ₹199</span>
          <h1>
            Craving something tasty?
            <br />
            Order from <span>Sarthak Cafe</span>
          </h1>
          <p>
            Hot meals, snacks and beverages from our hygienic kitchen — delivered to your door in
            about 30 minutes.
          </p>

          <form className={styles.search} onSubmit={onSubmit} role="search">
            <input
              type="search"
              placeholder="Search for biryani, coffee, dessert…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search the menu"
            />
            <button type="submit">Search</button>
          </form>

          <div className={styles.popular}>
            <span>Popular:</span>
            {POPULAR.map((term) => (
              <button key={term} type="button" onClick={() => goToMenu(term)}>
                {term}
              </button>
            ))}
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>4.5 ★</dt>
              <dd>2,500+ ratings</dd>
            </div>
            <div>
              <dt>30 min</dt>
              <dd>Average delivery</dd>
            </div>
            <div>
              <dt>60+</dt>
              <dd>Dishes on menu</dd>
            </div>
          </dl>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.plate}>
            <span>🍛</span>
          </div>
          <span className={`${styles.float} ${styles.f1}`}>🥟</span>
          <span className={`${styles.float} ${styles.f2}`}>🥤</span>
          <span className={`${styles.float} ${styles.f3}`}>🍰</span>
          <div className={`${styles.chip} ${styles.chip1}`}>
            <strong>Hygienic kitchen</strong>
            <span>FSSAI certified</span>
          </div>
          <div className={`${styles.chip} ${styles.chip2}`}>
            <strong>Hot & fresh</strong>
            <span>Cooked after you order</span>
          </div>
        </div>
      </div>
    </section>
  )
}
