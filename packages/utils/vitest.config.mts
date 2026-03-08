import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [solid({ hot: false, dev: false })],
    resolve: {
        alias: {
            "solid-js/web": "@solidjs/web",
        },
    },
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        server: {
            deps: {
                inline: [
                    "@solidjs/testing-library",
                    "solid-js",
                    "@solidjs/web",
                ],
            },
        },
    },
});
