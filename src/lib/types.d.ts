interface BaseSalary {
	basic_monthly_mean: number | null;
	basic_monthly_median: number | null;
}

interface GrossSalary {
	gross_monthly_mean: number | null;
	gross_monthly_median: number | null;
	gross_mthly_25_percentile: number | null;
	gross_mthly_75_percentile: number | null;
}

interface EmploymentRates {
	employment_rate_overall: number;
	employment_rate_ft_perm: number;
}

export type YearlyRecord = { year: number } & EmploymentRates &
	BaseSalary &
	GrossSalary;

export interface GESData {
	university: string;
	degree: string;
	school: string | null;
	slug: string;
	data: YearlyRecord[];
}

export interface DegreeRecommendation extends GESData {
	score: number;
	sharedTerms: string[];
}

export type FlatRecord = Omit<GESData & YearlyRecord, "data">;

export interface WinnersRecord extends GESData {
	pctChange: number;
}
