import { local, search } from "$lib/data";
import type { DataRecord } from "$lib/types";

export async function load({ fetch, url }) {
	const query = url.searchParams.get("q");
	let degrees: DataRecord[];

	if (!query) {
		degrees = [];
	} else if (local) {
		degrees = search(local, query);
	} else {
		const response = await fetch(`/api/search?q=${query}`);
		degrees = await response.json();
	}

	return { degrees };
}
