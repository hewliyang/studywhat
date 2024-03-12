import data from "./data.json";
import url from "./data.json?url";
import { browser } from "$app/environment";
import type { DataRecord } from "./types";

export let local: DataRecord[];

if (browser) {
	fetch(url).then(async (request) => {
		local = await request.json();
	});
}

export const degrees = data as DataRecord[];

export function top10(year: number) {
	return degrees
		.filter((d) => d.year === year)
		.sort((a, b) => {
			return b.gross_monthly_median - a.gross_monthly_mean;
		})
		.slice(0, 10);
}

export function search(data: DataRecord[], query: string | null) {
	const results: DataRecord[] = [];
	if (!query) return results;

	const q = query.toLowerCase().trim();

	for (const record of data) {
		if (
			record.degree.toLowerCase().includes(q) ||
			record.school.toLowerCase().includes(q) ||
			record.university.toLowerCase().includes(q)
		) {
			results.push(record);

			// limit to 200
			if (results.length === 20) break;
		}

		// prefer recent
		results.sort((a, b) => {
			return b.year - a.year;
		});
	}

	return results;
}
