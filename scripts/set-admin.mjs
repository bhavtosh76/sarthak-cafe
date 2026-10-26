/**
 * Sarthak Cafe — admin login upsert
 * ----------------------------------
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env and makes sure Firebase Auth
 * actually has a usable admin account with those credentials.
 *
 *   1. Account with ADMIN_EMAIL exists      -> password is reset to ADMIN_PASSWORD
 *   2. No such account, but a legacy admin  -> email + password are migrated
 *      ("Sarthak Cafe Admin" display name)
 *   3. Nothing at all                       -> account is created
 *
 * Usage: npm run set-admin
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const path = resolve(ROOT, '.env')
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = { ...loadEnv(), ...process.env }
const { ADMIN_EMAIL, ADMIN_PASSWORD } = env
const credentialsPath = resolve(ROOT, env.FIREBASE_SERVICE_ACCOUNT || './serviceAccount.json')

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL / ADMIN_PASSWORD missing from .env')
  process.exit(1)
}
if (!existsSync(credentialsPath)) {
  console.error(`❌ Service account not found: ${credentialsPath}`)
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(readFileSync(credentialsPath, 'utf8'))) })
const auth = getAuth()
const LEGACY_NAME = 'Sarthak Cafe Admin'

async function main() {
  // 1. Already using the target address → just sync the password.
  try {
    const user = await auth.getUserByEmail(ADMIN_EMAIL)
    await auth.updateUser(user.uid, { password: ADMIN_PASSWORD })
    console.log(`✅ Password updated for ${ADMIN_EMAIL}`)
    return
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
  }

  // 2. Migrate an older admin account so history (orders, sessions) survives.
  const { users } = await auth.listUsers()
  const legacy = users.find((u) => u.displayName === LEGACY_NAME)
  if (legacy) {
    await auth.updateUser(legacy.uid, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    console.log(`✅ Admin migrated: ${legacy.email} → ${ADMIN_EMAIL}`)
    return
  }

  // 3. Fresh account.
  await auth.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    displayName: LEGACY_NAME,
  })
  console.log(`✅ Admin account created: ${ADMIN_EMAIL}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`❌ ${error.code ?? 'error'}: ${error.message}`)
    process.exit(1)
  })
