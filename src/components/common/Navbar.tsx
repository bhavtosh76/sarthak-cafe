import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CAFE_NAME } from '../../constants'
import { useCart } from '../../context/CartContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About & Contact' },
]

/** Sticky top navigation with cart badge and a mobile menu. */
export function Navbar() {
  const { totalItems } = useCart()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label={`${CAFE_NAME} home`}>
          <img src="/favicon.svg" alt="" width={34} height={34} />
          <span className={styles.brandText}>
            <strong>{CAFE_NAME}</strong>
            <small>{'Fresh food, delivered hot'}</small>
          </span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/admin" className={styles.adminLink} onClick={() => setOpen(false)}>
            Admin
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.cart} aria-label={`Cart, ${totalItems} items`}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M3 4h2l2.4 11.2A2 2 0 0 0 9.36 17h7.5a2 2 0 0 0 1.96-1.6L20.5 8H6.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1.4" fill="currentColor" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </Link>

          <Link to="/menu" className={styles.orderNow}>
            Order Now
          </Link>

          <button
            type="button"
            className={styles.burger}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
