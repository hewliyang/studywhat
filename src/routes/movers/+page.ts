import { getGainAndLoss } from "$lib/data";
import { PREV_YEAR } from "$lib/constants";

export function load({ url }) {
	const year = Number(url.searchParams.get("year")) || PREV_YEAR;
	const lag = Number(url.searchParams.get("lag")) || 1;

	console.log(year, lag);

	const { best, worst } = getGainAndLoss(year, 1000000, 1000000, lag);
	return { best, worst };
}
