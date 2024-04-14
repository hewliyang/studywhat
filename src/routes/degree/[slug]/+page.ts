import { local } from "$lib/data";
import { error } from "@sveltejs/kit";
import type { GESData } from "$lib/types";

export async function load({ fetch, params }) {
	const slug = params.slug;
	let degree: GESData | undefined;

	if (local) {
		degree = local.find((d) => d.slug === slug);
		if (!degree) error(404);
	} else {
		const response = await fetch(`/api/degree/${slug}`);
		if (!response.ok) error(response.status);
		degree = (await response.json()) as GESData;
	}

	return { degree };
}
