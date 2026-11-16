import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // "dist" já é usado pelo tsc (npm run build)
    outDir: "dist-web",
    target: "es2022",
  },
});
