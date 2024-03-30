// data

export interface YearlyRecord {
	year: number;
	employment_rate_overall: number;
	employment_rate_ft_perm: number;
	basic_monthly_mean: number;
	basic_monthly_median: number;
	gross_monthly_mean: number;
	gross_monthly_median: number;
	gross_mthly_25_percentile: number;
	gross_mthly_75_percentile: number;
}

export interface DataRecord {
	university: string;
	degree: string;
	school: string | null;
	slug: string;
	data: YearlyRecord[];
}

export interface FlatRecord {
	year: number;
	university: string;
	degree: string;
	school: string | null;
	slug: string;
	employment_rate_overall: number;
	employment_rate_ft_perm: number;
	basic_monthly_mean: number;
	basic_monthly_median: number;
	gross_monthly_mean: number;
	gross_monthly_median: number;
	gross_mthly_25_percentile: number;
	gross_mthly_75_percentile: number;
}

export interface WinnersRecord extends DataRecord {
	pctChange: number;
}

// data table

export interface DataTableProps<T> {
	data: T[];
	columns: { label: string; accessor?: (data: T) => string | number }[];
}
