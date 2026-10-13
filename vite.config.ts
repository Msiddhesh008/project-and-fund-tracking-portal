import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/project-and-fund-tracking-portal/',
  plugins: [react()],
})
