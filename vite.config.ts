import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-renderer', test: /node_modules\/three\/src\/renderers\//, priority: 30 },
            { name: 'three-shaders', test: /node_modules\/three\/src\/renderers\/shaders\//, priority: 40 },
            { name: 'three-core', test: /node_modules\/three\/src\//, priority: 20 },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
