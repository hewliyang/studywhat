import { getMovement } from "$lib/data";
import { PREV_YEAR } from "$lib/constants";
import type { YearlyRecord } from "$lib/types.js";

export function load({ url }) {
	const year = Number(url.searchParams.get("year")) || PREV_YEAR;
	const lag = Number(url.searchParams.get("lag")) || 1;
	const metric = (url.searchParams.get("metric") ||
		"gross_monthly_median") as keyof YearlyRecord;

	const { best, worst } = getMovement(year, 1000000, 1000000, lag, metric);
	return { best, worst, year, lag, metric };
}
