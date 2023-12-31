var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.mjs
import { defineConfig } from "file:///C:/Programming/sycpiano/.yarn/__virtual__/vite-virtual-69ac4a7b3d/0/cache/vite-npm-5.0.10-8371795915-5421e9c7f8.zip/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Programming/sycpiano/.yarn/__virtual__/@vitejs-plugin-react-virtual-d7218c18dd/0/cache/@vitejs-plugin-react-npm-4.2.1-8b9705c544-d7fa6dacd3.zip/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { visualizer } from "file:///C:/Programming/sycpiano/.yarn/__virtual__/rollup-plugin-visualizer-virtual-a5213b391f/0/cache/rollup-plugin-visualizer-npm-5.12.0-a9cce23360-47358feb67.zip/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { splitVendorChunkPlugin } from "file:///C:/Programming/sycpiano/.yarn/__virtual__/vite-virtual-69ac4a7b3d/0/cache/vite-npm-5.0.10-8371795915-5421e9c7f8.zip/node_modules/vite/dist/node/index.js";
import * as path from "path";
var __vite_injected_original_dirname = "C:\\Programming\\sycpiano\\packages\\web";
__require("file:///C:/Programming/sycpiano/.yarn/cache/dotenv-npm-16.3.1-e6d380a398-dbb778237e.zip/node_modules/dotenv/lib/main.js").config({ override: true, path: "../../.env" });
var staticPrefix = "/static";
var vite_config_default = defineConfig({
  root: path.resolve(__vite_injected_original_dirname, "src"),
  resolve: {
    alias: {
      src: path.resolve(__vite_injected_original_dirname, "src"),
      path: "path-browserify",
      gsap: "gsap/dist/gsap"
    },
    dedupe: ["polished"]
  },
  define: {
    BINARY_PATH: JSON.stringify(`${staticPrefix}/binary`),
    IMAGES_PATH: JSON.stringify(`${staticPrefix}/images`),
    MUSIC_PATH: JSON.stringify(`${staticPrefix}/music`),
    VIDEOS_PATH: JSON.stringify(`${staticPrefix}/videos`),
    GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
    STRIPE_PUBLIC_KEY: JSON.stringify(process.env.STRIPE_PUBLIC_KEY),
    preventAssignment: true
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    visualizer()
  ],
  build: {
    target: ["es2015"],
    manifest: true,
    outDir: path.resolve(__vite_injected_original_dirname, "build"),
    assetsDir: "static/scripts/web",
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcUHJvZ3JhbW1pbmdcXFxcc3ljcGlhbm9cXFxccGFja2FnZXNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxQcm9ncmFtbWluZ1xcXFxzeWNwaWFub1xcXFxwYWNrYWdlc1xcXFx3ZWJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Qcm9ncmFtbWluZy9zeWNwaWFuby9wYWNrYWdlcy93ZWIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInO1xyXG5pbXBvcnQgeyBzcGxpdFZlbmRvckNodW5rUGx1Z2luIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbnJlcXVpcmUoJ2RvdGVudicpLmNvbmZpZyh7IG92ZXJyaWRlOiB0cnVlLCBwYXRoOiAnLi4vLi4vLmVudicgfSk7XHJcblxyXG5jb25zdCBzdGF0aWNQcmVmaXggPSAnL3N0YXRpYyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgIHNyYzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICAgICAgICBwYXRoOiAncGF0aC1icm93c2VyaWZ5JyxcclxuICAgICAgICAgICAgZ3NhcDogJ2dzYXAvZGlzdC9nc2FwJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlZHVwZTogWydwb2xpc2hlZCddLFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAgIEJJTkFSWV9QQVRIOiBKU09OLnN0cmluZ2lmeShgJHtzdGF0aWNQcmVmaXh9L2JpbmFyeWApLFxyXG4gICAgICAgIElNQUdFU19QQVRIOiBKU09OLnN0cmluZ2lmeShgJHtzdGF0aWNQcmVmaXh9L2ltYWdlc2ApLFxyXG4gICAgICAgIE1VU0lDX1BBVEg6IEpTT04uc3RyaW5naWZ5KGAke3N0YXRpY1ByZWZpeH0vbXVzaWNgKSxcclxuICAgICAgICBWSURFT1NfUEFUSDogSlNPTi5zdHJpbmdpZnkoYCR7c3RhdGljUHJlZml4fS92aWRlb3NgKSxcclxuICAgICAgICBHQVBJX0tFWTogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuR0FQSV9LRVlfQVBQKSxcclxuICAgICAgICBTVFJJUEVfUFVCTElDX0tFWTogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuU1RSSVBFX1BVQkxJQ19LRVkpLFxyXG4gICAgICAgIHByZXZlbnRBc3NpZ25tZW50OiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICByZWFjdCh7XHJcbiAgICAgICAgICAgIGpzeEltcG9ydFNvdXJjZTogJ0BlbW90aW9uL3JlYWN0JyxcclxuICAgICAgICAgICAgYmFiZWw6IHtcclxuICAgICAgICAgICAgICAgIHBsdWdpbnM6IFsnQGVtb3Rpb24vYmFiZWwtcGx1Z2luJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdmlzdWFsaXplcigpLFxyXG4gICAgXSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBbJ2VzMjAxNSddLFxyXG4gICAgICAgIG1hbmlmZXN0OiB0cnVlLFxyXG4gICAgICAgIG91dERpcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2J1aWxkJyksXHJcbiAgICAgICAgYXNzZXRzRGlyOiAnc3RhdGljL3NjcmlwdHMvd2ViJyxcclxuICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7QUFBMFMsU0FBUyxvQkFBb0I7QUFDdlUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsOEJBQThCO0FBQ3ZDLFlBQVksVUFBVTtBQUp0QixJQUFNLG1DQUFtQztBQUt6QyxVQUFRLHlIQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsTUFBTSxNQUFNLGFBQWEsQ0FBQztBQUUvRCxJQUFNLGVBQWU7QUFFckIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsTUFBVyxhQUFRLGtDQUFXLEtBQUs7QUFBQSxFQUNuQyxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFVLGFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQ2xDLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNWO0FBQUEsSUFDQSxRQUFRLENBQUMsVUFBVTtBQUFBLEVBQ3ZCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixhQUFhLEtBQUssVUFBVSxHQUFHLFlBQVksU0FBUztBQUFBLElBQ3BELGFBQWEsS0FBSyxVQUFVLEdBQUcsWUFBWSxTQUFTO0FBQUEsSUFDcEQsWUFBWSxLQUFLLFVBQVUsR0FBRyxZQUFZLFFBQVE7QUFBQSxJQUNsRCxhQUFhLEtBQUssVUFBVSxHQUFHLFlBQVksU0FBUztBQUFBLElBQ3BELFVBQVUsS0FBSyxVQUFVLFFBQVEsSUFBSSxZQUFZO0FBQUEsSUFDakQsbUJBQW1CLEtBQUssVUFBVSxRQUFRLElBQUksaUJBQWlCO0FBQUEsSUFDL0QsbUJBQW1CO0FBQUEsRUFDdkI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxNQUNGLGlCQUFpQjtBQUFBLE1BQ2pCLE9BQU87QUFBQSxRQUNILFNBQVMsQ0FBQyx1QkFBdUI7QUFBQSxNQUNyQztBQUFBLElBQ0osQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLEVBQ2Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDakIsVUFBVTtBQUFBLElBQ1YsUUFBYSxhQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN2QyxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsRUFDakI7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
