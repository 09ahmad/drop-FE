import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load env variables based on current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://drop-be-six.vercel.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // For client-side access to env variables
      'import.meta.env': {
        VITE_API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL),
        VITE_CLIENT_ID: JSON.stringify(env.VITE_CLIENT_ID),
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            auth: ['jwt-decode', 'axios'],
            vendor: ['lodash', 'date-fns'],
          },
        },
      },
    },
    preview: {
      port: 8080,
      strictPort: true,
    },
  };
});