import { PREV_YEAR } from "$lib/constants";
import { topK, getGainAndLoss } from "$lib/data";

export async function load({ url }) {
	const year = Number(url.searchParams.get("year")) || PREV_YEAR;
	const top = topK(year);
	const gainAndLoss = getGainAndLoss(year, 5);
	return { year, top, gainAndLoss };
}
