import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isFirebaseConfigured } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/common/Button'
import styles from './AdminLoginPage.module.css'

const SETUP_STEPS = [
  'Create a project at console.firebase.google.com and add a Web app.',
  'Copy the config into .env (see .env.example), then restart the dev server.',
  'Enable Authentication → Sign-in method → Email/Password, and create an admin user.',
]

/** Admin sign-in (Firebase Auth email/password). */
export default function AdminLoginPage() {
  const { signIn, user, loading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) navigate('/admin', { replace: true })
  }, [user, loading, navigate])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!email.trim() || !password) {
      setFormError('Enter your email and password')
      return
    }
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      showToast('Welcome back, admin!', 'success')
      navigate('/admin', { replace: true })
    } catch (error) {
      const code = (error as { code?: string }).code ?? ''
      if (code.includes('invalid-credential') || code.includes('wrong-password')) {
        setFormError('Incorrect email or password')
      } else if (code.includes('too-many-requests')) {
        setFormError('Too many attempts — try again later')
      } else {
        setFormError(error instanceof Error ? error.message : 'Could not sign in')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/favicon.svg" alt="" width={40} height={40} />
          <div>
            <h1>Sarthak Cafe Admin</h1>
            <p>Manage menu &amp; orders</p>
          </div>
        </div>

        {!isFirebaseConfigured && (
          <div className={styles.setup} role="alert">
            <strong>Firebase setup pending</strong>
            <ol>
              {SETUP_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="bhavtosh555@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth loading={submitting} disabled={!isFirebaseConfigured}>
            Sign in
          </Button>
        </form>

        <a href="/" className={styles.back}>
          ← Back to store
        </a>
      </div>
    </div>
  )
}
