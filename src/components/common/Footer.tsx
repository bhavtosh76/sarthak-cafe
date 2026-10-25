import { Link } from 'react-router-dom'
import {
  CAFE_ADDRESS,
  CAFE_EMAIL,
  CAFE_HOURS,
  CAFE_INSTAGRAM,
  CAFE_NAME,
  CAFE_PHONE,
  CAFE_PHONE_TEL,
} from '../../constants'
import styles from './Footer.module.css'

/** © year — computed once at module load (avoids impure render). */
const CURRENT_YEAR = new Date().getFullYear()

/** Site footer: brand, quick links and contact details. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <img src="/favicon.svg" alt="" width={30} height={30} />
            <strong>{CAFE_NAME}</strong>
          </div>
          <p>{CAFE_HOURS}. Freshly prepared food, hygienic kitchen, doorstep delivery.</p>
        </div>

        <nav aria-label="Footer navigation">
          <h3>Explore</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
            <li>
              <Link to="/about">About & Contact</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3>Contact</h3>
          <ul>
            <li>
              <a href={`tel:${CAFE_PHONE_TEL}`}>{CAFE_PHONE}</a>
            </li>
            <li>
              <a href={`mailto:${CAFE_EMAIL}`}>{CAFE_EMAIL}</a>
            </li>
            <li>{CAFE_ADDRESS}</li>
          </ul>
        </div>

        <div>
          <h3>Follow us</h3>
          <ul>
            <li>
              <a href={CAFE_INSTAGRAM} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <Link to="/admin">Partner / Admin login</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          © {CURRENT_YEAR} {CAFE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
