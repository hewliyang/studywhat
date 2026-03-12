import { degrees, local } from "$lib/data";
import { error } from "@sveltejs/kit";
import recommendations from "$lib/generated/degree-recommendations.json";
import type { DegreeRecommendation, GESData } from "$lib/types";

const recommendationMap = new Map(
	Object.entries(recommendations.neighbors)
);

export async function load({ params }) {
	const slug = params.slug;
	const catalog = local ?? degrees;
	const degree = catalog.find((entry) => entry.slug === slug);

	if (!degree) error(404);

	const recommendationsForDegree =
		recommendationMap
			.get(slug)
			?.map((entry) => {
				const recommendation = catalog.find((candidate) => candidate.slug === entry.slug);
				if (!recommendation) return null;
				return {
					...recommendation,
					score: entry.score,
					sharedTerms: entry.sharedTerms,
				} satisfies DegreeRecommendation;
			})
			.filter((entry): entry is DegreeRecommendation => entry !== null) ?? [];

	return { degree, recommendations: recommendationsForDegree };
}
