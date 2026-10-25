import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vendor splitting: framework and Firebase change rarely compared to app
    // code, so keeping them in their own hashed chunks means a redeploy of the
    // app does not invalidate the (large) library downloads in users' caches.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules[\\/]@firebase[\\/]firestore[\\/]/,
              name: 'vendor-firebase-firestore',
            },
            { test: /node_modules[\\/](firebase|@firebase)[\\/]/, name: 'vendor-firebase' },
            { test: /node_modules[\\/](react|react-dom|react-router)[\\/]/, name: 'vendor-react' },
          ],
        },
      },
    },
  },
})
