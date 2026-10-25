import { Button } from '../components/common/Button'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={`section ${styles.wrap}`}>
      <div className="container">
        <div className={styles.inner}>
          <span className={styles.code}>404</span>
          <h1>This page went out for a delivery 🛵</h1>
          <p>The link you followed doesn&apos;t exist on Sarthak Cafe.</p>
          <div className={styles.actions}>
            <Button to="/">Go home</Button>
            <Button to="/menu" variant="secondary">
              Browse menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
