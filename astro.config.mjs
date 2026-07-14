import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ame-studio.example",
  build: { format: "directory" },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
