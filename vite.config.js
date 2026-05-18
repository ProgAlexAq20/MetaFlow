import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Git hub Pages: Se seu repo for github.com/user/metaflow, use "/metaflow/"
// Se usar domínio próprio, deixe "/"
const repoName = process.env.VITE_REPO_NAME || '';
const base = repoName ? `/${repoName}/` : '/';

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
