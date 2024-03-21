import { ntu, nus, sutd, sit, smu, suss } from "$lib/logos";

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
