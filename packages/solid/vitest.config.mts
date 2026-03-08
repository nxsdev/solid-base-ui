import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid({ hot: false, dev: false })],
  resolve: {
    alias: {
      "solid-js/web": "/src/internal/solid-web-compat.ts",
      "@floating-ui/dom": "/src/internal/floating/floating-dom.mock.ts",
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: ["@solidjs/testing-library", "solid-js", "@solidjs/web"],
      },
    },
  },
});
