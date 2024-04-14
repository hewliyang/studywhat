import { PREV_YEAR } from "$lib/constants";
import { topK, getMovement } from "$lib/data";

export async function load({ url }) {
	const year = Number(url.searchParams.get("year")) || PREV_YEAR;
	const top = topK(year);
	const gainAndLoss = getMovement(year);
	return { year, top, gainAndLoss };
}
