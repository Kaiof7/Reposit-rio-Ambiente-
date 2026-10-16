// Lightweight Next profile (no database): official presets, 350-line budget
// and no direct console in app code. See docs/quality.md.
import { defineConfig } from "eslint/config";
import base from "./eslint-rules/next-base.mjs";

export default defineConfig([
  ...base,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "quality/no-direct-console": ["error", { logger: "the server logger (remove client debug output)" }],
    },
  },
]);
