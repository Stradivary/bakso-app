/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "**/node_modules/**",
        "./src/main.tsx",
        "./**/*.d.ts",
        "./**/*.types.ts",
        "**/*.test.tsx",
        "**/*.test.ts",
      ],
      reporter: ["text", "json", "lcov", "html"],
      include: ["src/**/*"],
    },
    exclude: [
      "**/node_modules/**",
      "./src/main.tsx",
      "./**/*.d.ts",
      "./**/*.types.ts",
    ],
    environment: "jsdom",
    setupFiles: "./src/tests.setup.ts",
    snapshotSerializers: ["./mantine.serializer.js"],

    alias: [{ find: "@/", replacement: "/src/" }],
  },
});
