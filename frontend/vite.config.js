import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mui/material': '@mui/material',
      '@mui/icons-material': '@mui/icons-material',
      '@emotion/react': '@emotion/react',
      '@emotion/styled': '@emotion/styled'
    }
  }
})
