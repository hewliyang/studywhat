import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (
						id.includes('node_modules/svelte/') ||
						id.includes('@vincjo/datatables') ||
						id.includes('.svelte-kit/generated/root.svelte')
					) {
						return 'svelte-core';
					}
				}
			}
		}
	}
});
