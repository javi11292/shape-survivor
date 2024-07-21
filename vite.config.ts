import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	css: { preprocessorOptions: { scss: { additionalData: `@use "$lib/core/styles" as *;` } } },
	server: { port: 3000 },
	preview: { port: 3000 },
	build: {
		assetsInlineLimit: 0,
	},
});
