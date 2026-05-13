import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'framer-motion', 'axios', 'react-router-dom'],
  },
  server: {
    hmr: {
      overlay: false, // Désactive l'overlay d'erreur pour éviter les blocages visuels
    },
    watch: {
      usePolling: true, // Parfois nécessaire sur Windows/WSL pour détecter les changements rapidement
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
