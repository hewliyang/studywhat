import { local } from "$lib/data";
import type { DataRecord } from "$lib/types";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }) {
	const id = Number(params.id);
	let degree: DataRecord | undefined;

	if (local) {
		degree = local.find((d) => d.id === id);
		if (!degree) error(404);
	} else {
		const response = await fetch(`/api/degree/${id}`);
		if (!response.ok) error(response.status);
		degree = (await response.json()) as DataRecord;
	}

	return { degree };
}
