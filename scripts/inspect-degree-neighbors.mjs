import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultInputPath = path.join(
	repoRoot,
	"src/lib/generated/degree-tfidf.json"
);

function parseArgs(argv) {
	const args = {
		input: defaultInputPath,
		query: "",
		limit: 5,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--input") {
			args.input = path.resolve(repoRoot, argv[index + 1]);
			index += 1;
		} else if (arg === "--query") {
			args.query = argv[index + 1];
			index += 1;
		} else if (arg === "--limit") {
			args.limit = Number.parseInt(argv[index + 1], 10);
			index += 1;
		}
	}

	if (!args.query.trim()) {
		throw new Error("Pass --query with part of a slug or degree name");
	}

	return args;
}

function formatTerms(terms) {
	return terms.length > 0 ? terms.join(", ") : "no shared terms recorded";
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const raw = await fs.readFile(args.input, "utf8");
	const artifact = JSON.parse(raw);
	const needle = args.query.toLowerCase();

	const candidates = artifact.documents.filter(
		(candidate) =>
			candidate.slug.toLowerCase().includes(needle) ||
			candidate.degree.toLowerCase().includes(needle)
	);

	const document = candidates.sort((left, right) => {
		const leftSlug = left.slug.toLowerCase();
		const rightSlug = right.slug.toLowerCase();
		const leftDegree = left.degree.toLowerCase();
		const rightDegree = right.degree.toLowerCase();

		const leftExact = Number(leftSlug === needle || leftDegree === needle);
		const rightExact = Number(rightSlug === needle || rightDegree === needle);
		if (leftExact !== rightExact) return rightExact - leftExact;

		const leftStarts = Number(leftSlug.startsWith(needle) || leftDegree.startsWith(needle));
		const rightStarts = Number(rightSlug.startsWith(needle) || rightDegree.startsWith(needle));
		if (leftStarts !== rightStarts) return rightStarts - leftStarts;

		return leftSlug.length - rightSlug.length;
	})[0];

	if (!document) {
		throw new Error(`No degree matched "${args.query}"`);
	}

	const neighborSet =
		artifact.neighbors.find((candidate) => candidate.slug === document.slug)?.neighbors ?? [];

	console.log(`${document.degree} (${document.slug})`);
	console.log(`Top features: ${formatTerms(document.topFeatures.slice(0, 10).map((x) => x.term))}`);
	console.log("");

	for (const neighbor of neighborSet.slice(0, args.limit)) {
		console.log(
			`${neighbor.score.toFixed(3)}  ${neighbor.degree} (${neighbor.slug})`
		);
		console.log(`       shared: ${formatTerms(neighbor.sharedTerms)}`);
	}
}

await main();
