import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import fs from 'fs/promises'
import gltf from 'vite-plugin-gltf'
import { textureResize } from '@gltf-transform/functions'

// https://vitejs.dev/config/

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
    },
  },
  base: './',
  plugins: [
    react(),
    glsl(),
    gltf({
      transforms: [textureResize({ size: [1024, 1024] })],
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async args => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8'),
            }))
          },
        },
      ],
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
  },
})
