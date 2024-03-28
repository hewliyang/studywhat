import { PREV_YEAR } from "$lib/constants";
import { topK } from "$lib/data";

export async function load({ url }) {
	const year = Number(url.searchParams.get("year")) || PREV_YEAR;
	const top = topK(year);
	return { year, top };
}
