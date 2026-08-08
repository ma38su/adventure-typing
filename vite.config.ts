import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const pagesBasePath = process.env.BASE_PATH
  ? `${process.env.BASE_PATH.replace(/^\/+|\/+$/g, '')}/`
  : ''

// https://vite.dev/config/
export default defineConfig({
  base: pagesBasePath ? `/${pagesBasePath}` : '/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
