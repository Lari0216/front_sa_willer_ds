import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler: memoiza componentes e valores automaticamente no build.
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    // Avisa se algum arquivo JS passar de ~500 kB (antes do gzip).
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        // Separa bibliotecas em arquivos próprios: mudam pouco, então ficam em cache no navegador
        // entre um deploy e outro. O Recharts só é baixado quando o dashboard é aberto.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/, priority: 20 },
            { name: 'charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|decimal\.js-light|@reduxjs|reselect|immer|redux|react-redux|use-sync-external-store|eventemitter3|es-toolkit|tiny-invariant|clsx)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
