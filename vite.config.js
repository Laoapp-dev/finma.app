import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/,
// so all asset URLs need that /<repo>/ prefix. Set BASE_PATH in the
// GitHub Actions workflow (see .github/workflows/deploy.yml). Locally,
// `npm run dev` / `npm run build` default to "/" so nothing changes for you.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || "/",
  server: { port: 5173 },
});
