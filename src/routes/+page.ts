import { topK } from "$lib/data";

export async function load() {
	const yr = new Date().getFullYear();
	const top = topK(yr - 1, 100);
	return { top };
}
