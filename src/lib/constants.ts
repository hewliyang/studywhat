import { ntu, nus, sutd, sit, smu, suss } from "$lib/logos";
import dataset from "./data.json";

// institution names

export const short2long: Record<string, string> = {
	SUSS: "Singapore University of Social Sciences",
	SUTD: "Singapore University of Technology and Design",
	SIT: "Singapore Institute of Technology",
	SMU: "Singapore Management University",
	NUS: "National University of Singapore",
	NTU: "Nanyang Technological University",
};

export const long2short = Object.fromEntries(
	Object.entries(short2long).map(([k, v]) => [v, k])
);

export const short2img: Record<string, string> = {
	SUSS: suss,
	SUTD: sutd,
	SIT: sit,
	SMU: smu,
	NUS: nus,
	NTU: ntu,
};

export const PREV_YEAR = Math.max(
	...dataset.flatMap((degree) => degree.data.map((entry) => entry.year))
);

export const YEARS = Array.from(
	{ length: PREV_YEAR + 1 - 2009 },
	(_, i) => 2009 + i
);

// color palletes

export const palette = [
	"#2563eb",
	"#e45c3a",
	"#7c3aed",
	"#0d9488",
	"#d946ef",
	"#ca8a04",
	"#059669",
	"#dc2626",
	"#6366f1",
	"#ea580c",
	"#0284c7",
	"#be185d",
];
