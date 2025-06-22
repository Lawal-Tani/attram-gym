
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add this to fix 404 errors on page refresh
    historyApiFallback: true,
    // Enable CORS for Supabase requests
    cors: true
  },
  optimizeDeps: {
    exclude: ['@fontsource/*'],
    // Add react-router-dom to optimize dependencies
    include: ['react-router-dom']
  },
  plugins: [
    react({
      // Add SWC plugin options for better JSX handling
      jsxImportSource: '@emotion/react',
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add path aliases for common auth directories
      "@auth": path.resolve(__dirname, "./src/auth"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  build: {
    // Configure build output for SPA
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      // Ensure react-router-dom is not externalized
      external: []
    },
    // Enable sourcemaps for debugging
    sourcemap: mode === 'development'
  },
  // Add base URL for proper routing
  base: '/',
  // Configure proxy for API requests if needed
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, '')
    }
  }
}));
