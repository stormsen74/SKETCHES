// vite.config.js
import { resolve } from "path";
import react from "file:///C:/LocalDevelop/SKETCHES/node_modules/@vitejs/plugin-react/dist/index.mjs";
import glsl from "file:///C:/LocalDevelop/SKETCHES/node_modules/vite-plugin-glsl/src/index.js";
import { defineConfig } from "file:///C:/LocalDevelop/SKETCHES/node_modules/vite/dist/node/index.js";
import fs from "fs/promises";
import gltf from "file:///C:/LocalDevelop/SKETCHES/node_modules/vite-plugin-gltf/dist/vite.cjs";
import { textureResize } from "file:///C:/LocalDevelop/SKETCHES/node_modules/@gltf-transform/functions/dist/functions.modern.js";
var __vite_injected_original_dirname = "C:\\LocalDevelop\\SKETCHES";
var vite_config_default = defineConfig({
  server: {
    port: 3e3
  },
  resolve: {
    alias: {
      "@src": resolve(__vite_injected_original_dirname, "./src")
    }
  },
  base: "./",
  plugins: [
    react(),
    glsl(),
    gltf({
      transforms: [textureResize({ size: [1024, 1024] })]
    })
  ],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: "jsx",
              contents: await fs.readFile(args.path, "utf8")
            }));
          }
        }
      ],
      loader: {
        ".js": "jsx",
        ".ts": "tsx"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxMb2NhbERldmVsb3BcXFxcU0tFVENIRVNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXExvY2FsRGV2ZWxvcFxcXFxTS0VUQ0hFU1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovTG9jYWxEZXZlbG9wL1NLRVRDSEVTL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgZ2xzbCBmcm9tICd2aXRlLXBsdWdpbi1nbHNsJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBmcyBmcm9tICdmcy9wcm9taXNlcydcbmltcG9ydCBnbHRmIGZyb20gJ3ZpdGUtcGx1Z2luLWdsdGYnXG5pbXBvcnQgeyB0ZXh0dXJlUmVzaXplIH0gZnJvbSAnQGdsdGYtdHJhbnNmb3JtL2Z1bmN0aW9ucydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQHNyYyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBiYXNlOiAnLi8nLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBnbHNsKCksXG4gICAgZ2x0Zih7XG4gICAgICB0cmFuc2Zvcm1zOiBbdGV4dHVyZVJlc2l6ZSh7IHNpemU6IFsxMDI0LCAxMDI0XSB9KV0sXG4gICAgfSksXG4gIF0sXG4gIGVzYnVpbGQ6IHtcbiAgICBsb2FkZXI6ICdqc3gnLFxuICAgIGluY2x1ZGU6IC9zcmNcXC8uKlxcLmpzeD8kLyxcbiAgICBleGNsdWRlOiBbXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdsb2FkLWpzLWZpbGVzLWFzLWpzeCcsXG4gICAgICAgICAgc2V0dXAoYnVpbGQpIHtcbiAgICAgICAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogL3NyY1xcLy4qXFwuanMkLyB9LCBhc3luYyBhcmdzID0+ICh7XG4gICAgICAgICAgICAgIGxvYWRlcjogJ2pzeCcsXG4gICAgICAgICAgICAgIGNvbnRlbnRzOiBhd2FpdCBmcy5yZWFkRmlsZShhcmdzLnBhdGgsICd1dGY4JyksXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGxvYWRlcjoge1xuICAgICAgICAnLmpzJzogJ2pzeCcsXG4gICAgICAgICcudHMnOiAndHN4JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdRLFNBQVMsZUFBZTtBQUN4UixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sUUFBUTtBQUNmLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQU45QixJQUFNLG1DQUFtQztBQVV6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsUUFBUSxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUNwQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILFlBQVksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztBQUFBLElBQ3BELENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUM7QUFBQSxFQUNaO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixnQkFBZ0I7QUFBQSxNQUNkLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNLE9BQU87QUFDWCxrQkFBTSxPQUFPLEVBQUUsUUFBUSxlQUFlLEdBQUcsT0FBTSxVQUFTO0FBQUEsY0FDdEQsUUFBUTtBQUFBLGNBQ1IsVUFBVSxNQUFNLEdBQUcsU0FBUyxLQUFLLE1BQU0sTUFBTTtBQUFBLFlBQy9DLEVBQUU7QUFBQSxVQUNKO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
