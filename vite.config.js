import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/.
// Using a RELATIVE base ("./") makes every built asset path relative to
// index.html, so it works identically whether the app is served from the
// domain root, a /<repo>/ subfolder, or Firebase Hosting — no repo-name
// configuration needed. (An absolute base like "/" is the #1 cause of a
// white screen on GitHub Pages: the JS/CSS chunks 404 because they're
// requested from the domain root instead of the /<repo>/ subfolder.)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5173 },
});
