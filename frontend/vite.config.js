//Import function to define vite config
import { defineConfig } from 'vite';
//Import React plugin to support vite and react
import react from '@vitejs/plugin-react';
//Export vite configuration
export default defineConfig({
  plugins: [react()], //Enable React plugin
  server: {
    port: 3000, //Run dev server on port 3000
  }
});