import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isFirebaseConfigured } from '../../config/firebase'
import { Loader } from './Loader'

/**
 * Route guard for /admin — renders `<Outlet/>` only for a signed-in admin.
 * Without Firebase config it redirects to the login page, which explains the
 * setup steps.
 */
export function RequireAuth() {
  const { user, loading } = useAuth()

  if (!isFirebaseConfigured) return <Navigate to="/admin/login" replace />
  if (loading) return <Loader label="Checking access…" />
  if (!user) return <Navigate to="/admin/login" replace />

  return <Outlet />
}
