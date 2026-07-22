

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://service.fongai.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/WebAPI/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://fongai.co')
            proxyReq.setHeader('Referer', 'https://fongai.co/')
          })
        },
      },
    },
  },
});