import { search, degrees } from "$lib/data";
import { json } from "@sveltejs/kit";

export function GET({ url }) {
	const query = url.searchParams.get("q");
	const results = search(degrees, query);
	return json(results);
}
