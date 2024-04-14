import _ from "lodash";
import data from "./data.json";
import url from "./data.json?url";
import { browser } from "$app/environment";
import { PREV_YEAR } from "./constants";
import type {
	GESData,
	FlatRecord,
	WinnersRecord,
	YearlyRecord,
} from "$lib/types";

type _IntermediateSearchResult = {
	record: GESData;
	score: number;
};

/** Helper to flatten the data for simpler processing */
function getFlattened(): FlatRecord[] {
	return _.flatMap(degrees, (item) => {
		return item.data.map((d) => {
			return {
				university: item.university,
				school: item.school,
				degree: item.degree,
				slug: item.slug,
				...d,
			};
		});
	});
}

export let local: GESData[];

if (browser) {
	fetch(url).then(async (request) => {
		local = await request.json();
	});
}

export const degrees: GESData[] = data;

export function topK(
	year: number = PREV_YEAR,
	K: number = 1_000_000
): FlatRecord[] {
	let filtered = getFlattened();
	filtered = _.filter(filtered, { year: year });
	filtered = _.orderBy(
		filtered,
		["gross_monthly_median", "gross_mthly_75_percentile", "gross_monthly_mean"],
		["desc", "desc", "desc"]
	);
	return _.take(filtered, K);
}

/**
 * Simple token / term frequency based search on slugs which
 * in turn is a concatenation of <slugify(degree)>-<nus|smu|ntu|suss|sutd|sit>
 */
export function search(
	data: GESData[],
	query: string | null,
	exactMatch: boolean = false
) {
	const results: _IntermediateSearchResult[] = [];
	if (!query) return [];

	const terms = query.toLowerCase().trim().split(/\s+/);

	for (const record of data) {
		let score = 0;
		let match = true;
		const slug = record.slug.toLowerCase();

		for (const term of terms) {
			if (exactMatch) {
				if (slug != term) {
					match = false;
					break;
				}
			} else if (!slug.includes(term)) {
				match = false;
				break;
			}
			score += 1 + slug.indexOf(term) / slug.length;
		}
		if (match) {
			results.push({ record, score });
		}
	}

	// sort by score
	_.orderBy(results, ["score"], ["desc"]);

	return results.map((result) => result.record);
}

export function getMovement(
	year: number,
	k: number = 5,
	q: number = 5,
	lag: number = 1,
	metric: keyof YearlyRecord = "gross_monthly_median"
): Record<string, WinnersRecord[]> {
	// filter data for year & year - 1
	const eligibleRecords = data.filter((record) => {
		const currentYearData = record.data.find((d) => d.year === year);
		const previousYearData = record.data.find((d) => d.year === year - lag);
		return currentYearData && previousYearData;
	});

	// Calculate percentage change and add it to the record
	const recordsWithPctChange = eligibleRecords.map((record) => {
		const currentYearData = record.data.find((d) => d.year === year)!;
		const previousYearData = record.data.find((d) => d.year === year - lag)!;
		const x1 = previousYearData[metric];
		const x2 = currentYearData[metric];
		const pctChange = x1 && x2 ? ((x2 - x1) / x1) * 100 : -Infinity;
		return { ...record, pctChange };
	});

	// Sort by percentage change in descending order
	const sortedRecords = _.orderBy(
		recordsWithPctChange,
		["pctChange"],
		["desc"]
	);

	const topKWinners = sortedRecords.filter((r) => r.pctChange > 0).slice(0, k);
	const bottomQLosers = _.orderBy(
		sortedRecords.filter((r) => r.pctChange < 0).slice(-q),
		["pctChange"],
		["asc"]
	);

	return {
		best: topKWinners,
		worst: bottomQLosers,
	};
}
