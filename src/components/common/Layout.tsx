import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { SetupBanner } from './SetupBanner'
import styles from './Layout.module.css'

/** Public shell: demo banner + navbar + page content + footer. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <SetupBanner />
      <Navbar />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
