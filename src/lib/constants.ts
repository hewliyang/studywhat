// institution names

export const short2long = {
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
