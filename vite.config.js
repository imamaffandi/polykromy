import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the build works on GitHub Pages under any repo name
  // (https://<user>.github.io/<repo>/) as well as on a custom domain.
  base: './',
})
