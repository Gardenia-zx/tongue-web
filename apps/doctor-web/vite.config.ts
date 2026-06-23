import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: "@tongue/shared/styles/base.css",
        replacement: fileURLToPath(new URL("../../packages/shared/src/styles/base.css", import.meta.url)),
      },
      {
        find: "@tongue/shared",
        replacement: fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
      },
    ],
  },
});
