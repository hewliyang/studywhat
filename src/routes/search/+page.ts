import { local, search } from "$lib/data";
import type { GESData } from "$lib/types";

export async function load({ fetch, url }) {
	const query = url.searchParams.get("q");
	let degrees: GESData[];

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
