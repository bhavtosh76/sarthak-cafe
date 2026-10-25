import { isFirebaseConfigured } from '../../config/firebase'
import styles from './SetupBanner.module.css'

/**
 * Shown only in development while `.env` has no Firebase keys — explains why
 * the app runs in demo mode. Never appears once configured.
 */
export function SetupBanner() {
  if (isFirebaseConfigured || !import.meta.env.DEV) return null

  return (
    <div className={styles.banner} role="status">
      <strong>Demo mode:</strong>&nbsp; Firebase keys missing — menu is showing local demo data.
      Copy <code>.env.example</code> → <code>.env</code>, fill your project keys, then run{' '}
      <code>npm run seed</code>.
    </div>
  )
}
