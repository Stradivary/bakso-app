/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "./src/main.tsx"],
    },
    exclude: ["**/node_modules/**", "./src/main.tsx"],
    environment: "jsdom",
    setupFiles: "./src/tests.setup.ts",
    snapshotSerializers: ["./mantine.serializer.js"],
    alias: [
      { find: "@/", replacement: "/src/" },
    ]
  },
});
