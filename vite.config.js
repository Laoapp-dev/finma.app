import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/.
// A RELATIVE base ("./") makes every built asset path relative to
// index.html, so it works identically at a domain root, a /<repo>/
// subfolder, or Firebase Hosting. (An absolute base is the #1 cause of a
// white screen on GitHub Pages: JS/CSS chunks 404 outside the subfolder.)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5173 },
  build: {
    // Split heavy, rarely-changing vendor code into its own cacheable
    // chunk, and let each calculator page split into its own chunk via
    // React.lazy() in App.jsx. This cuts the JS the browser must parse
    // before the first screen appears — the main cause of "slow to show".
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore"],
          "vendor-xlsx": ["xlsx"],
        },
      },
    },
  },
});
