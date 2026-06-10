import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets'),
      components: path.resolve(__dirname, './src/components'),
      hooks: path.resolve(__dirname, './src/hooks'),
      views: path.resolve(__dirname, './src/views'),
      layouts: path.resolve(__dirname, './src/layouts'),
      services: path.resolve(__dirname, './src/services'),
      helpers: path.resolve(__dirname, './src/helpers'),
      theme: path.resolve(__dirname, './src/theme'),
      src: path.resolve(__dirname, './src'),
    },
  },
})
