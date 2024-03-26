import { PREV_YEAR } from "$lib/constants";
import { topK } from "$lib/data";

export async function load() {
	const top = topK(PREV_YEAR);
	return { top };
}
