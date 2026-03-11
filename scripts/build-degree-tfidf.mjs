import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import degrees from "../src/lib/data.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultOutputPath = path.join(
	repoRoot,
	"src/lib/generated/degree-tfidf.json"
);
const defaultRecommendationsPath = path.join(
	repoRoot,
	"src/lib/generated/degree-recommendations.json"
);

const FIELD_CONFIG = {
	degree: {
		weight: 3,
		includeBigrams: true,
	},
	school: {
		weight: 0,
		includeBigrams: false,
	},
	university: {
		weight: 0,
		includeBigrams: false,
	},
};

const STOPWORDS = new Set([
	"a",
	"an",
	"and",
	"arts",
	"at",
	"bachelor",
	"bachelors",
	"college",
	"cum",
	"degree",
	"diploma",
	"direct",
	"discipline",
	"education",
	"faculty",
	"for",
	"foundation",
	"glasgow",
	"hons",
	"honours",
	"in",
	"integrated",
	"laude",
	"major",
	"majoring",
	"newcastle",
	"of",
	"programme",
	"school",
	"sciences",
	"singapore",
	"studies",
	"technology",
	"university",
	"with",
	"year",
]);

const GENERIC_UNIGRAMS = new Set(["art", "engineering", "science"]);

const CONTEXT_STOPWORDS = new Set([
	"college",
	"faculty",
	"glasgow",
	"digipen",
	"institute",
	"medicine",
	"national",
	"nanyang",
	"newcastle",
	"nus",
	"school",
	"singapore",
	"sit",
	"technological",
	"technology",
	"university",
	"yong",
	"loo",
	"lin",
]);

const TOKEN_REPLACEMENTS = new Map([
	["arts", "art"],
	["laws", "law"],
	["sciences", "science"],
	["studies", "study"],
	["systems", "system"],
]);

const PHRASE_REPLACEMENTS = [
	[/\bbachelor(?:s)? of\b/g, " "],
	[/\bwith honours\b/g, " "],
	[/\bwith honor\b/g, " "],
	[/\bhonours programme\b/g, " "],
	[/\bdirect honours programme\b/g, " "],
	[/\bcum laude and above\b/g, " "],
	[/\bcum laude\b/g, " "],
	[/\bmajoring in\b/g, " "],
	[/\bmajor in\b/g, " "],
	[/\bdouble degree in\b/g, "double degree "],
	[/\binterdisciplinary double \/ integrated major\b/g, "interdisciplinary double integrated"],
];

function parseArgs(argv) {
	const args = {
		output: defaultOutputPath,
		recommendationsOutput: defaultRecommendationsPath,
		topK: 8,
		minScore: 0.15,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--output") {
			args.output = path.resolve(repoRoot, argv[index + 1]);
			index += 1;
		} else if (arg === "--recommendations-output") {
			args.recommendationsOutput = path.resolve(repoRoot, argv[index + 1]);
			index += 1;
		} else if (arg === "--top-k") {
			args.topK = Number.parseInt(argv[index + 1], 10);
			index += 1;
		} else if (arg === "--min-score") {
			args.minScore = Number.parseFloat(argv[index + 1]);
			index += 1;
		}
	}

	if (!Number.isFinite(args.topK) || args.topK <= 0) {
		throw new Error("--top-k must be a positive integer");
	}

	if (!Number.isFinite(args.minScore) || args.minScore < 0) {
		throw new Error("--min-score must be a non-negative number");
	}

	return args;
}

function normalizeText(value) {
	let normalized = value.toLowerCase();
	for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
		normalized = normalized.replace(pattern, replacement);
	}

	return normalized
		.replace(/&/g, " and ")
		.replace(/\+/g, " plus ")
		.replace(/[()\/,-]/g, " ")
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeToken(token) {
	return TOKEN_REPLACEMENTS.get(token) ?? token;
}

function tokenize(value, extraStopwords = new Set()) {
	return normalizeText(value)
		.split(" ")
		.map((token) => normalizeToken(token.trim()))
		.filter(
			(token) =>
				token.length >= 2 &&
				!STOPWORDS.has(token) &&
				!extraStopwords.has(token)
		);
}

function buildBigrams(tokens) {
	const bigrams = [];
	for (let index = 0; index < tokens.length - 1; index += 1) {
		bigrams.push(`${tokens[index]}_${tokens[index + 1]}`);
	}
	return bigrams;
}

function buildDocument(record) {
	const tokenCounts = new Map();
	const fieldTokens = {
		degree: tokenize(record.degree),
		school: tokenize(record.school ?? "", CONTEXT_STOPWORDS),
		university: tokenize(record.university, CONTEXT_STOPWORDS),
	};

	for (const [field, tokens] of Object.entries(fieldTokens)) {
		const config = FIELD_CONFIG[field];
		const unigrams = tokens.filter((token) => !GENERIC_UNIGRAMS.has(token));
		const expanded = config.includeBigrams
			? [...unigrams, ...buildBigrams(tokens)]
			: unigrams;
		const weight = config.weight;
		if (weight <= 0) continue;
		for (const token of expanded) {
			tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + weight);
		}
	}

	return {
		slug: record.slug,
		degree: record.degree,
		school: record.school,
		university: record.university,
		tokenCounts,
	};
}

function computeIdf(documents) {
	const docFreq = new Map();
	for (const document of documents) {
		for (const token of document.tokenCounts.keys()) {
			docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
		}
	}

	const totalDocs = documents.length;
	const idf = new Map();
	for (const [token, frequency] of docFreq.entries()) {
		idf.set(token, Math.log((1 + totalDocs) / (1 + frequency)) + 1);
	}

	return { docFreq, idf };
}

function vectorizeDocument(document, idf) {
	const totalCount = [...document.tokenCounts.values()].reduce(
		(sum, count) => sum + count,
		0
	);
	const features = [];
	let normSquared = 0;

	for (const [token, count] of document.tokenCounts.entries()) {
		const tf = count / totalCount;
		const weight = tf * (idf.get(token) ?? 0);
		normSquared += weight * weight;
		features.push({ term: token, tf, weight });
	}

	features.sort((left, right) => right.weight - left.weight);

	return {
		...document,
		totalCount,
		norm: Math.sqrt(normSquared),
		unigramCount: features.filter((feature) => !feature.term.includes("_")).length,
		features,
	};
}

function cosineSimilarity(left, right) {
	if (left.norm === 0 || right.norm === 0) return 0;

	const rightWeights = new Map(
		right.features.map((feature) => [feature.term, feature.weight])
	);
	let dot = 0;
	for (const feature of left.features) {
		dot += feature.weight * (rightWeights.get(feature.term) ?? 0);
	}
	return dot / (left.norm * right.norm);
}

function getSharedTermStats(left, right, limit = 3) {
	const rightWeights = new Map(
		right.features.map((feature) => [feature.term, feature.weight])
	);

	const scoredTerms = left.features
		.map((feature) => ({
			term: feature.term,
			score: feature.weight * (rightWeights.get(feature.term) ?? 0),
		}))
		.filter((feature) => feature.score > 0)
		.sort((a, b) => b.score - a.score);

	return {
		sharedTerms: scoredTerms.slice(0, limit).map((feature) => feature.term),
		sharedTermCount: scoredTerms.length,
		sharedBigramCount: scoredTerms.filter((feature) => feature.term.includes("_")).length,
	};
}

function buildNeighbors(documents, topK, minScore) {
	return documents.map((document) => {
		const neighbors = documents
			.filter((candidate) => candidate.slug !== document.slug)
			.map((candidate) => {
				const score = cosineSimilarity(document, candidate);
				const shared = getSharedTermStats(document, candidate);

				return {
					slug: candidate.slug,
					degree: candidate.degree,
					score,
					sharedTerms: shared.sharedTerms,
					sharedTermCount: shared.sharedTermCount,
					sharedBigramCount: shared.sharedBigramCount,
				};
			})
			.filter((candidate) => candidate.score >= minScore)
			.sort((left, right) => right.score - left.score)
			.slice(0, topK);

		return {
			slug: document.slug,
			neighbors,
		};
	});
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const baseDocuments = degrees.map(buildDocument);
	const { docFreq, idf } = computeIdf(baseDocuments);
	const documents = baseDocuments.map((document) => vectorizeDocument(document, idf));
	const neighbors = buildNeighbors(documents, args.topK, args.minScore);

	const artifact = {
		generatedAt: new Date().toISOString(),
		options: {
			topK: args.topK,
			minScore: args.minScore,
			fieldWeights: Object.fromEntries(
				Object.entries(FIELD_CONFIG).map(([field, config]) => [field, config.weight])
			),
		},
		stats: {
			documents: documents.length,
			vocabularySize: idf.size,
		},
		vocabulary: [...idf.entries()]
			.map(([term, idfValue]) => ({
				term,
				idf: Number(idfValue.toFixed(6)),
				docFreq: docFreq.get(term) ?? 0,
			}))
			.sort((left, right) => right.idf - left.idf || left.term.localeCompare(right.term)),
		documents: documents.map((document) => ({
			slug: document.slug,
			degree: document.degree,
			school: document.school,
			university: document.university,
			featureCount: document.features.length,
			topFeatures: document.features.slice(0, 25).map((feature) => ({
				term: feature.term,
				tf: Number(feature.tf.toFixed(6)),
				weight: Number(feature.weight.toFixed(6)),
			})),
		})),
		neighbors,
	};

	const recommendationIndex = {
		generatedAt: artifact.generatedAt,
		neighbors: Object.fromEntries(
			neighbors.map((entry) => [
				entry.slug,
				entry.neighbors.map((neighbor) => ({
					slug: neighbor.slug,
					score: Number(neighbor.score.toFixed(6)),
					sharedTerms: neighbor.sharedTerms,
				})),
			])
		),
	};

	await fs.mkdir(path.dirname(args.output), { recursive: true });
	await fs.writeFile(args.output, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
	await fs.mkdir(path.dirname(args.recommendationsOutput), { recursive: true });
	await fs.writeFile(
		args.recommendationsOutput,
		`${JSON.stringify(recommendationIndex, null, 2)}\n`,
		"utf8"
	);

	console.log(`Wrote TF-IDF artifact to ${path.relative(repoRoot, args.output)}`);
	console.log(
		`Wrote recommendation index to ${path.relative(repoRoot, args.recommendationsOutput)}`
	);
	console.log(
		`Indexed ${artifact.stats.documents} degrees with ${artifact.stats.vocabularySize} terms`
	);
}

await main();
