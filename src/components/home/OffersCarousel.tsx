import { useRef, useState } from 'react'
import { OFFERS } from '../../constants'
import { useToast } from '../../context/ToastContext'
import styles from './OffersCarousel.module.css'

/** Horizontally scrollable offer cards with prev/next controls. */
export function OffersCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ prev: false, next: true })
  const { showToast } = useToast()

  const updateArrows = () => {
    const el = trackRef.current
    if (!el) return
    setCanScroll({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.8, 360), behavior: 'smooth' })
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      showToast(`Code ${code} copied!`, 'success')
    } catch {
      showToast(`Use code: ${code}`, 'info')
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="sectionHead">
          <div>
            <h2>Best offers for you</h2>
            <p>Apply a code at checkout & save more</p>
          </div>
          <div className={styles.arrows}>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScroll.prev}
              aria-label="Previous offers"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScroll.next}
              aria-label="More offers"
            >
              ›
            </button>
          </div>
        </div>

        <div className={styles.track} ref={trackRef} onScroll={updateArrows}>
          {OFFERS.map((offer) => (
            <article
              key={offer.id}
              className={styles.card}
              style={{ background: `linear-gradient(125deg, ${offer.from}, ${offer.to})` }}
            >
              <span className={styles.code}>{offer.code}</span>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <button type="button" onClick={() => copyCode(offer.code)}>
                Copy code
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
