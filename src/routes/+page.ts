import { top10 } from "$lib/data";

export async function load() {
	const yr = new Date().getFullYear();
	const top = top10(yr - 1);
	return { top };
}
