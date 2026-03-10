import { PREV_YEAR, YEARS, short2long } from "$lib/constants";
import { topK, getMovement } from "$lib/data";

export async function load({ url }) {
	const year = Number(url.searchParams.get("year")) || PREV_YEAR;
	const maxLag = Math.max(1, year - Math.min(...YEARS));
	const rawLag = Number(url.searchParams.get("lag")) || 1;
	const lag = Math.min(Math.max(rawLag, 1), maxLag);
	const top = topK(year);
	const gainAndLoss = getMovement(year, 5, 5, lag);

	const hideParam = url.searchParams.get("hide") ?? "";
	const hiddenUniversities = hideParam
		? hideParam.split(",").map((s) => short2long[s.trim()]).filter(Boolean)
		: [];

	return { year, lag, top, gainAndLoss, hiddenUniversities };
}
