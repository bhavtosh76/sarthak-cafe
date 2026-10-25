import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedItems } from '../components/home/FeaturedItems'
import { Hero } from '../components/home/Hero'
import { OffersCarousel } from '../components/home/OffersCarousel'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { Loader } from '../components/common/Loader'
import { useMenu } from '../hooks/useMenu'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const PROMISES = [
  {
    emoji: '⏱️',
    title: '30-minute delivery',
    text: 'Cooked after you order and packed to stay hot.',
  },
  {
    emoji: '🧼',
    title: 'Hygienic kitchen',
    text: 'FSSAI certified kitchen, sanitised every 4 hours.',
  },
  {
    emoji: '🥕',
    title: 'Fresh ingredients',
    text: 'Vegetables and dairy sourced daily from local markets.',
  },
  {
    emoji: '👛',
    title: 'Honest pricing',
    text: 'No hidden charges — what you see is what you pay.',
  },
]

export default function HomePage() {
  const { data: items, loading, error, reload } = useMenu()

  return (
    <>
      <Hero />
      <CategoryGrid />
      <OffersCarousel />

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div>
              <h2>Must-try at Sarthak Cafe</h2>
              <p>Our most-loved dishes this week</p>
            </div>
            <Link to="/menu" className={styles.viewAll}>
              See all →
            </Link>
          </div>

          {loading && <Loader label="Loading dishes…" />}

          {!loading && error && (
            <EmptyState emoji="😵" title="Could not load the menu" message={error}>
              <Button onClick={() => void reload()}>Try again</Button>
            </EmptyState>
          )}

          {!loading && !error && items && <FeaturedItems items={items} />}
        </div>
      </section>

      <section className={styles.promises}>
        <div className="container">
          <div className={styles.grid}>
            {PROMISES.map((promise) => (
              <article key={promise.title} className={styles.promise}>
                <span aria-hidden="true">{promise.emoji}</span>
                <div>
                  <h3>{promise.title}</h3>
                  <p>{promise.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
