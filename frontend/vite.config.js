import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    envDir: '../',
    server: {
        port: 5173,
        proxy: {
            '/resume': 'http://localhost:8000',
            '/interview': 'http://localhost:8000',
            '/chat': 'http://localhost:8000',
            '/coding': 'http://localhost:8000',
            '/analytics': 'http://localhost:8000',
            '/health': 'http://localhost:8000',
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate chunks for better browser caching
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-clerk': ['@clerk/clerk-react'],
                    'vendor-editor': ['@monaco-editor/react'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                },
            },
        },
        chunkSizeWarningLimit: 800,
    },
})
