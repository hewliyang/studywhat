import { error, json } from "@sveltejs/kit";
import { degrees } from "$lib/data";

export function GET({ params }) {
	const record = degrees.find((r) => r.slug === params.slug);
	if (!record) error(404);
	return json(record);
}
