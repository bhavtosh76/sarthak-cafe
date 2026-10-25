/**
 * Sarthak Cafe — deploy wrapper
 * -----------------------------
 * Runs the Firebase Hosting + Firestore rules deploy. If the CLI is not
 * logged in, it points Firebase at the service account key used by the seed
 * script (`serviceAccount.json`), so a deploy works non-interactively.
 *
 * Usage:  npm run deploy
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const env = { ...process.env }
if (!env.FIREBASE_TOKEN && !env.GOOGLE_APPLICATION_CREDENTIALS) {
  const key = resolve(ROOT, 'serviceAccount.json')
  if (existsSync(key)) env.GOOGLE_APPLICATION_CREDENTIALS = key
  else
    console.log(
      '\nℹ  No serviceAccount.json found — the CLI will ask you to log in.\n' +
        '   (Project settings → Service accounts → Generate new private key)\n',
    )
}

const result = spawnSync(
  'npx',
  ['firebase-tools', 'deploy', '--only', 'hosting,firestore:rules'],
  { cwd: ROOT, env, stdio: 'inherit', shell: process.platform === 'win32' },
)

process.exit(result.status ?? 1)
