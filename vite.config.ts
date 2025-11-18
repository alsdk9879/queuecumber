import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "Queuecumber",
            fileName: (format) => {
                if (format === "es") return "index.js";
                if (format === "cjs") return "index.cjs";
                return `index.${format}.js`;
            },
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: [],
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            rollupTypes: false,
            include: ["src/**/*.ts"],
        }),
    ],
});
