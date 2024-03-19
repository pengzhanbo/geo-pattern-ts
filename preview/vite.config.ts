import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: path.join(__dirname, 'dist'),
  },
})
