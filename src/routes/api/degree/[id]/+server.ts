import { error, json } from "@sveltejs/kit";
import { degrees } from "$lib/data";

export function GET({ params }) {
	const id = Number(params.id);
	const record = degrees.find((r) => r.id === id);
	if (!record) error(404);
	return json(record);
}
