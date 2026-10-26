# ☕ Sarthak Cafe — Food Ordering Web App

Zomato-style food ordering app for **Sarthak Cafe** — built with **React + Vite + TypeScript** and
**Firebase** (Firestore, Auth, Hosting).

| Feature | Where |
| --- | --- |
| Landing page (hero, search, offers, categories, must-try dishes) | `/` |
| Menu with search, category filters, veg-only toggle | `/menu` |
| Cart (localStorage), bill + GST, checkout with validation | `/cart`, `/checkout` |
| Order confirmation with live status timeline | `/order-success/:id` |
| About + contact form (saved to Firestore) | `/about` |
| Admin dashboard — stats & recent orders | `/admin` |
| Admin menu manager — add/edit/delete (photo optional, bundled placeholder fallback) | `/admin/menu` |
| Admin orders — status pipeline (placed → delivered) | `/admin/orders` |

---

## 1. Quick start

```bash
npm install
cp .env.example .env     # then fill in your Firebase keys (see step 2)
npm run dev              # http://localhost:5173
```

> **Without Firebase keys the app runs in demo mode** (local menu data, a yellow banner tells you
> what's missing). Orders/admin need real keys.

## 2. Firebase setup (one time)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
   (Analytics optional).
2. **Project settings → Your apps → Web (`</>`)** → register the app → copy the config values.
3. Paste them into `.env`:

   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc
   ```

4. **Build → Firestore Database → Create database** (production mode, pick a region near you).
5. **Authentication → Sign-in method → Email/Password → Enable** (admin login).
6. Deploy the security rules shipped in this repo (they lock menu writes to admins only):

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
     npx firebase-tools deploy --only firestore:rules
   ```

> **Firebase Storage (optional):** dish photos live in `public/menu-images/` and are served by
> Hosting, so **no Storage bucket and no Blaze plan are needed**. If you enable Storage, the admin
> panel automatically switches to real photo uploads (max 5 MB).

## 3. Seed the menu (images → `public/menu-images/`, data → Firestore)

1. **Project settings → Service accounts → Generate new private key**.
2. Save the downloaded JSON as `serviceAccount.json` in the project root (git-ignored).
3. Optionally set the admin login in `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. Run:

   ```bash
   npm run seed
   ```

   This seeds the 18 menu docs in **Firestore** and creates the admin user. Each dish uses its real
   photo at `public/menu-images/<id>.jpg` when present, otherwise it writes a branded SVG fallback.

### Dish photos (Pexels, free license)

All 18 dishes use royalty-free photos downloaded from [Pexels](https://www.pexels.com) (license:
free for commercial use, no attribution required), cropped to 800×520 and stored in
`public/menu-images/<dish-id>.jpg`.

- To repoint Firestore at the JPGs after re-seeding: `npm run update-images`
- To swap a photo: drop a new `<dish-id>.jpg` in `public/menu-images/`, then `npm run deploy`
  (no code change needed — the Firestore `imageUrl` already points at that path).
- `public/menu-images/placeholder.svg` remains as the admin-panel fallback for items added
  without a photo.

## 4. Admin panel

- URL: **`/admin`** → redirects to `/admin/login` (Firebase Auth).
- **Dashboard** — menu size, order counts, pending orders, revenue.
- **Menu** — add/edit/delete items; a photo is optional (the app falls back to the bundled
  placeholder, and uploads to Storage automatically if the Blaze plan is enabled). Toggle
  *Available* (sold out) and *Featured* (home page rail) inline.
- **Orders** — filter by status, update the fulfilment status; customers see it on their
  confirmation page.

## 5. Deploy to Firebase Hosting

```bash
# one-time: Project settings → Service accounts → Generate new private key
#           → save it as serviceAccount.json in the project root
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  npx firebase-tools deploy --only hosting,firestore:rules --project YOUR_PROJECT_ID
```

Prefer the interactive CLI? `npx firebase-tools login` works too — no service account needed.

`firebase.json` already contains the SPA rewrite (deep links like `/admin/menu` work) and cache
headers.

---

## Project structure

```
src/
├── components/
│   ├── common/      Button, Navbar, Footer, Loader, badges, ErrorBoundary, guards
│   ├── home/        Hero, OffersCarousel, CategoryGrid, FeaturedItems
│   └── menu/        MenuCard
├── config/          firebase.ts (config + friendly "not configured" errors)
├── constants/       brand info, categories, pricing rules, order statuses
├── context/         Cart (reducer + localStorage), Auth, Toast
├── hooks/           useMenu, useOrders, useDebounce
├── pages/           route components (+ admin/)
├── services/        menu · order · storage · auth · message services (all Firebase I/O)
├── styles/          global.css — design tokens & shared form styles
├── types/           shared TypeScript models + env typings
└── utils/           currency/date formatting, order money math
scripts/seed.mjs     writes menu images to public/ + menu data to Firestore
scripts/update-images.mjs  points Firestore imageUrl fields at the real .jpg photos
scripts/deploy.mjs   build + Firebase Hosting/Firestore rules deploy
```

## Coding practices used

- **TypeScript strict** — no `any`, shared domain types in `src/types`.
- **Layered architecture** — components → hooks → services → Firebase; UI never talks to the SDK
  directly.
- **Single source of truth for money** — `utils/pricing.ts` computes bill totals everywhere.
- **Route-level code splitting** (`React.lazy` + `Suspense`) and a global `ErrorBoundary`.
- **State machines via `useReducer`** for the cart, persisted to `localStorage` (versioned key).
- **URL as state** — menu search/filters live in the query string (shareable, refresh-safe).
- **Security rules** shipped with the repo; secrets only in `.env` (git-ignored).
- **Accessible UI** — semantic landmarks, labels, `aria-*`, focus states, reduced-motion support.
- **Responsive & mobile-first** — CSS custom properties design tokens + scoped CSS Modules.
- **No warnings** — `npm run lint` and `npm run typecheck` both pass clean.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc` project build |
| `npm run seed` | Write menu images to `public/menu-images/` + menu data to Firestore |
| `npm run set-admin` | Create or reset the Firebase Auth admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `npm run update-images` | Repoint Firestore `imageUrl` fields at `public/menu-images/*.jpg` |
| `npm run deploy` | Build + deploy Hosting and Firestore rules (service account aware) |
