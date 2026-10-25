/**
 * Sarthak Cafe — database seeder
 * --------------------------------
 * 1. Generates a food image (SVG) for every dish and writes it to
 *    public/menu-images/… (served by the app; no Storage/billing needed)
 * 2. Writes the menu document to Firestore (`menu` collection)
 * 3. Optionally creates the admin login (ADMIN_EMAIL / ADMIN_PASSWORD)
 *
 * Usage:
 *   cp .env.example .env      # fill in values (service account path, admin login)
 *   npm run seed
 *
 * Auth: place a firebase-admin service account JSON at the path in
 * FIREBASE_SERVICE_ACCOUNT (default ./serviceAccount.json), or set the
 * standard GOOGLE_APPLICATION_CREDENTIALS environment variable.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

/* ------------------------------------------------------------------ */
/* Environment (.env is parsed manually so no extra dependency is      */
/* needed; Vite-style files are simple KEY=VALUE lines).               */
/* ------------------------------------------------------------------ */

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
const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID
const SERVICE_ACCOUNT_PATH = resolve(ROOT, env.FIREBASE_SERVICE_ACCOUNT || './serviceAccount.json')

/* ------------------------------------------------------------------ */
/* Menu data — id is stable, so re-running the seed updates in place.  */
/* ------------------------------------------------------------------ */

const MENU = [
  ['paneer-tikka', 'Paneer Tikka', 'Char-grilled cottage cheese marinated in smoky spices', 229, 'starters', true, true, 4.6, 20, '🧀', '#f7971e', '#ffd200'],
  ['chicken-seekh-kebab', 'Chicken Seekh Kebab', 'Juicy minced chicken kebabs with mint chutney', 259, 'starters', false, false, 4.5, 25, '🍢', '#c33764', '#1d2671'],
  ['crispy-corn-chaat', 'Crispy Corn Chaat', 'Sweet corn tossed with chilli, lime and chaat masala', 149, 'starters', true, false, 4.4, 15, '🌽', '#11998e', '#38ef7d'],
  ['shahi-paneer', 'Shahi Paneer', 'Paneer cubes in a rich, mildly sweet cashew-tomato gravy', 249, 'main-course', true, true, 4.7, 25, '🍛', '#e23744', '#ff8a5c'],
  ['butter-chicken', 'Butter Chicken', 'Tandoori chicken simmered in a velvety butter-tomato gravy', 299, 'main-course', false, true, 4.8, 30, '🍗', '#f12711', '#f5af19'],
  ['dal-tadka', 'Dal Tadka', 'Yellow lentils tempered with garlic and cumin', 179, 'main-course', true, false, 4.3, 20, '🥘', '#8e2de2', '#e23744'],
  ['butter-naan', 'Butter Naan', 'Soft tandoori naan brushed with butter', 49, 'breads', true, false, 4.6, 10, '🫓', '#e6b980', '#eacda3'],
  ['garlic-cheese-kulcha', 'Garlic Cheese Kulcha', 'Stuffed with garlic, coriander and melted cheese', 79, 'breads', true, false, 4.5, 12, '🧄', '#d1913c', '#ffd194'],
  ['hyderabadi-chicken-biryani', 'Hyderabadi Chicken Biryani', 'Long-grain rice layered with spiced chicken and fried onions', 289, 'rice-biryani', false, true, 4.8, 35, '🍚', '#c94b4b', '#4b134f'],
  ['veg-dum-biryani', 'Veg Dum Biryani', 'Fragrant rice slow-cooked with seasonal vegetables', 239, 'rice-biryani', true, false, 4.4, 30, '🥦', '#134e5e', '#71b280'],
  ['chilli-paneer', 'Chilli Paneer (Dry)', 'Crispy paneer tossed with peppers and Sichuan sauce', 219, 'chinese', true, true, 4.5, 20, '🥡', '#de6262', '#ffb88c'],
  ['chicken-hakka-noodles', 'Chicken Hakka Noodles', 'Wok-tossed noodles with vegetables and chilli-soy sauce', 199, 'chinese', false, false, 4.4, 18, '🍜', '#eb3349', '#f45c43'],
  ['grilled-club-sandwich', 'Grilled Club Sandwich', 'Triple-decker with cheese, veggies and mint mayo', 159, 'snacks', true, false, 4.2, 15, '🥪', '#654ea3', '#eaafc8'],
  ['masala-fries', 'Masala Fries', 'Crispy fries dusted with house masala', 99, 'snacks', true, false, 4.3, 12, '🍟', '#f2994a', '#f2c94c'],
  ['cold-coffee', 'Cold Coffee', 'Blended coffee with milk and a scoop of ice cream', 129, 'beverages', true, true, 4.7, 8, '☕', '#6f4e37', '#c8a27d'],
  ['mango-smoothie', 'Mango Smoothie', 'Fresh alphonso mango blended with curd and honey', 119, 'beverages', true, false, 4.5, 8, '🥭', '#fdc830', '#f37335'],
  ['gulab-jamun', 'Gulab Jamun (2 pc)', 'Warm khoya dumplings soaked in cardamom syrup', 89, 'desserts', true, false, 4.6, 6, '🍮', '#b79891', '#94716b'],
  ['chocolate-brownie-sundae', 'Chocolate Brownie Sundae', 'Fudgy brownie, vanilla ice cream, hot chocolate sauce', 179, 'desserts', true, true, 4.8, 10, '🍨', '#3a1c71', '#d76d77'],
]

/* ------------------------------------------------------------------ */
/* Image generation — a branded SVG per dish, written to public/.      */
/* ------------------------------------------------------------------ */

const IMAGE_DIR = resolve(ROOT, 'public', 'menu-images')

const escapeXml = (value) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))

function dishImage(name, emoji, from, to) {
  const label = escapeXml(name)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.55">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="520" fill="url(#bg)"/>
  <rect width="800" height="520" fill="url(#glow)"/>
  <circle cx="400" cy="218" r="138" fill="#ffffff" fill-opacity="0.22"/>
  <circle cx="400" cy="218" r="138" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="4" stroke-dasharray="10 14"/>
  <text x="400" y="272" font-size="150" text-anchor="middle">${emoji}</text>
  <text x="400" y="418" font-size="44" font-family="Inter, Arial, sans-serif" font-weight="800" fill="#ffffff" text-anchor="middle">${label}</text>
  <text x="400" y="462" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="600" fill="#ffffff" fill-opacity="0.85" text-anchor="middle" letter-spacing="4">SARTHAK CAFE</text>
</svg>`,
    'utf8',
  )
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  if (!PROJECT_ID) {
    throw new Error('VITE_FIREBASE_PROJECT_ID missing — fill in .env first (see .env.example).')
  }

  const hasServiceAccount = existsSync(SERVICE_ACCOUNT_PATH)
  const hasGoogleCreds = Boolean(env.GOOGLE_APPLICATION_CREDENTIALS)

  if (!hasServiceAccount && !hasGoogleCreds) {
    throw new Error(
      `Service account not found.\n` +
        `  → Firebase Console > Project settings > Service accounts > Generate new private key\n` +
        `  → Save it as: ${SERVICE_ACCOUNT_PATH}\n` +
        `  (or set GOOGLE_APPLICATION_CREDENTIALS)`,
    )
  }

  initializeApp(
    hasServiceAccount
      ? { projectId: PROJECT_ID, credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))) }
      : { projectId: PROJECT_ID },
  )

  const db = getFirestore()
  const menuCollection = db.collection('menu')

  mkdirSync(IMAGE_DIR, { recursive: true })

  console.log(`\n☕ Seeding ${MENU.length} dishes for Sarthak Cafe (${PROJECT_ID})\n`)

  let written = 0
  for (const [
    id,
    name,
    description,
    price,
    category,
    isVeg,
    isFeatured,
    rating,
    prepTimeMins,
    emoji,
    from,
    to,
  ] of MENU) {
    // Prefer a real photo (public/menu-images/<id>.jpg) when one exists;
    // fall back to the branded SVG placeholder so seeding never crashes.
    const photoPath = `menu-images/${id}.jpg`
    const hasPhoto = existsSync(resolve(IMAGE_DIR, `${id}.jpg`))
    if (!hasPhoto) {
      writeFileSync(resolve(IMAGE_DIR, `${id}.svg`), dishImage(name, emoji, from, to))
      written += 1
    }

    // Served straight by the app (public/ is copied into the build).
    const imagePath = hasPhoto ? photoPath : `menu-images/${id}.svg`
    const imageUrl = `/${imagePath}`

    await menuCollection.doc(id).set(
      {
        name,
        description,
        price,
        category,
        isVeg,
        isAvailable: true,
        isFeatured,
        rating,
        prepTimeMins,
        imageUrl,
        imagePath,
        createdAt: Timestamp.now(),
      },
      { merge: true },
    )

    console.log(`  ✓ ${name.padEnd(30)} ₹${price}`)
  }

  console.log(`\n🖼  ${written} images written to public/menu-images/`)

  // Optional admin account
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const auth = getAuth()
    try {
      await auth.createUser({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        displayName: 'Sarthak Cafe Admin',
      })
      console.log(`  👤 Admin login created: ${env.ADMIN_EMAIL}`)
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`  👤 Admin already exists: ${env.ADMIN_EMAIL}`)
      } else {
        throw error
      }
    }
  }

  console.log('\n✅ Done! Menu is live — open the app and head to /menu\n')
  process.exit(0)
}

main().catch((error) => {
  console.error(`\n❌ Seed failed: ${error.message}\n`)
  process.exit(1)
})
