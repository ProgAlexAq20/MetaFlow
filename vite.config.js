import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages configuration
// Se seu repo for github.com/username/MetaFlow, use "/MetaFlow/"
// Se usar domínio próprio, deixe "/"
// A variável de ambiente VITE_REPO_NAME deve ser definida no .env ou no CI
const getBasePath = () => {
  // Em produção (GitHub Pages), usa o nome do repositório
  const repoName = process.env.VITE_REPO_NAME;
  if (repoName && repoName.trim() !== '') {
    return `/${repoName}/`;
  }
  // Padrão para domínio próprio ou desenvolvimento local
  return '/';
};

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
  define: {
    // Define o base path para ser usado no client-side
    'import.meta.env.VITE_BASE_PATH': JSON.stringify(getBasePath()),
  },
});