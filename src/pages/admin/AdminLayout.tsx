import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import styles from './AdminLayout.module.css'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️', end: false },
  { to: '/admin/orders', label: 'Orders', icon: '🧾', end: false },
]

/** Authenticated admin shell: sidebar + page content. */
export function AdminLayout() {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    showToast('Signed out', 'info')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/favicon.svg" alt="" width={30} height={30} />
          <div>
            <strong>Sarthak Cafe</strong>
            <small>Admin panel</small>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.user} title={user?.email ?? ''}>
            {user?.email ?? 'Admin'}
          </span>
          <div className={styles.footerActions}>
            <a href="/" className={styles.storeLink}>
              View store
            </a>
            <button type="button" onClick={() => void handleSignOut()}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
