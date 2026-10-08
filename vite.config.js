import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forwards API calls to your Express back end during development
      '/api': 'http://localhost:4000',
    },
  },
});
