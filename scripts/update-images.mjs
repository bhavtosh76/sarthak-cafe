/**
 * One-off utility: point every seeded menu doc at its real photo
 * (`/menu-images/<id>.jpg`) instead of the branded SVG placeholder.
 *
 * Usage: npm run update-images
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credentialsPath = join(root, "serviceAccount.json");

if (!existsSync(credentialsPath)) {
  console.error("serviceAccount.json not found — cannot update images.");
  process.exit(1);
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(credentialsPath, "utf8"))),
});

const db = getFirestore();
const imageDir = join(root, "public", "menu-images");
const available = new Set(readdirSync(imageDir).map((f) => f.toLowerCase()));

const snapshot = await db.collection("menu").get();
let updated = 0;
let skipped = 0;

for (const doc of snapshot.docs) {
  const id = doc.id;
  const fileName = `${id}.jpg`;
  if (!available.has(fileName)) {
    console.warn(`  skip ${id} — no ${fileName} in public/menu-images`);
    skipped += 1;
    continue;
  }
  await doc.ref.update({ imageUrl: `/menu-images/${fileName}` });
  console.log(`  ok   ${id} -> /menu-images/${fileName}`);
  updated += 1;
}

console.log(`\n${updated} menu images updated, ${skipped} skipped.`);
process.exit(skipped > 0 ? 1 : 0);
