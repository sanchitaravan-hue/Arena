import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      // Multi-page app: main (combined), admin-only, student-only
      input: {
        main: './index.html',       // Combined app → http://localhost:5173/
        admin: './admin.html',      // Admin-only  → http://localhost:5173/admin.html
        student: './student.html',  // Student-only → http://localhost:5173/student.html
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-deps';
          }
        },
      },
    },
  },
});
