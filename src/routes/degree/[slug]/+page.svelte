<script lang="ts">
	import Metric from "$lib/components/Metric.svelte";
	import Download from "$lib/components/Export.svelte";
	import { short2img, long2short } from "$lib/constants";
	import type { YearlyRecord } from "$lib/types";
	import {
		Axis,
		Crosshair,
		CurveType,
		Line,
		Tooltip,
		type BulletLegendConfigInterface,
		type XYContainerConfigInterface,
	} from "@unovis/ts";
	import { Datatable, TableHandler, ThSort } from "@vincjo/datatables";
	import type { PageData } from "./$types";
	import UnovisLegend from "$lib/components/charts/UnovisLegend.svelte";
	import UnovisXYChart from "$lib/components/charts/UnovisXYChart.svelte";

	let { data }: { data: PageData } = $props();

	const short = $derived(long2short[data.degree.university]);
	const img = $derived(short2img[short]);
	const grossData = $derived(
		data.degree.data.filter(
			(d) =>
				d.gross_monthly_median != null &&
				d.gross_mthly_25_percentile != null &&
				d.gross_mthly_75_percentile != null
		)
	);

	// median income
	const x = (d: YearlyRecord) => d.year;
	const yBandTop = (d: YearlyRecord) => d.gross_mthly_75_percentile ?? 0;
	const yBandBottom = (d: YearlyRecord) => d.gross_mthly_25_percentile ?? 0;
	const yMedian = (d: YearlyRecord) => d.gross_monthly_median ?? 0;

	// employment stats
	const yEmp = [
		(d: YearlyRecord) => d.employment_rate_ft_perm,
		(d: YearlyRecord) => d.employment_rate_overall,
	];

	function tooltipTemplate(d: YearlyRecord): string {
		return `<div style="font-family: 'Outfit', sans-serif; font-size: 11px; padding: 2px;">
			<div style="color: #71717a; margin-bottom: 4px;">${d.year}</div>
			<div style="display: grid; grid-template-columns: auto auto; gap: 2px 12px;">
				<span style="color: #71717a;">P25</span><span style="font-family: 'JetBrains Mono', monospace; font-weight: 500;">${formatValue(d.gross_mthly_25_percentile, "$")}</span>
				<span style="color: #71717a;">Median</span><span style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${formatValue(d.gross_monthly_median, "$")}</span>
				<span style="color: #71717a;">P75</span><span style="font-family: 'JetBrains Mono', monospace; font-weight: 500;">${formatValue(d.gross_mthly_75_percentile, "$")}</span>
			</div>
		</div>`;
	}

	function employmentTooltipTemplate(d: YearlyRecord): string {
		return `<div style="font-family: 'Outfit', sans-serif; font-size: 11px; padding: 2px;">
			<div style="color: #71717a; margin-bottom: 4px;">${d.year}</div>
			<div style="display: grid; grid-template-columns: auto auto; gap: 2px 12px;">
				<span style="color: #71717a;">Full Time</span><span style="font-family: 'JetBrains Mono', monospace; font-weight: 500;">${d.employment_rate_ft_perm}%</span>
				<span style="color: #71717a;">Overall</span><span style="font-family: 'JetBrains Mono', monospace; font-weight: 500;">${d.employment_rate_overall}%</span>
			</div>
		</div>`;
	}

	const grossLegendConfig = $derived.by<BulletLegendConfigInterface>(() => ({
		items: [
			{ name: "Median", color: "#2563eb" },
			{ name: "P25", color: "#93b4f4" },
			{ name: "P75", color: "#93b4f4" },
		],
	}));

	const employmentLegendConfig = $derived.by<BulletLegendConfigInterface>(() => ({
		items: [{ name: "Full Time" }, { name: "Overall" }],
	}));
	const yGross = [yMedian, yBandBottom, yBandTop];

	const getGrossChartConfig = $derived.by<
		() => XYContainerConfigInterface<YearlyRecord>
	>(() => () => ({
		height: 220,
		components: [
			new Line<YearlyRecord>({
				x,
				y: yMedian,
				color: "#2563eb",
				lineWidth: 2,
				curveType: CurveType.Linear,
			}),
			new Line<YearlyRecord>({
				x,
				y: yBandBottom,
				color: "#93b4f4",
				lineWidth: 1,
				lineDashArray: [4, 3],
				curveType: CurveType.Linear,
			}),
			new Line<YearlyRecord>({
				x,
				y: yBandTop,
				color: "#93b4f4",
				lineWidth: 1,
				lineDashArray: [4, 3],
				curveType: CurveType.Linear,
			}),
		],
		xAxis: new Axis<YearlyRecord>({ numTicks: (grossData.length / 2) >> 0 }),
		yAxis: new Axis<YearlyRecord>({}),
		tooltip: new Tooltip(),
		crosshair: new Crosshair<YearlyRecord>({
			x,
			y: yGross,
			template: tooltipTemplate,
			hideWhenFarFromPointer: true,
		}),
	}));

	const getEmploymentChartConfig = $derived.by<
		() => XYContainerConfigInterface<YearlyRecord>
	>(() => () => ({
		height: 220,
		components: [new Line<YearlyRecord>({ x, y: yEmp, curveType: CurveType.Linear })],
		xAxis: new Axis<YearlyRecord>({ numTicks: (data.degree.data.length / 2) >> 0 }),
		yAxis: new Axis<YearlyRecord>({}),
		tooltip: new Tooltip(),
		crosshair: new Crosshair<YearlyRecord>({
			x,
			y: yEmp,
			template: employmentTooltipTemplate,
			hideWhenFarFromPointer: true,
		}),
	}));

	// datatable
	const table = new TableHandler<YearlyRecord>([], { rowsPerPage: 100 });

	$effect(() => {
		table.setRows(data.degree.data);
	});

	function formatValue(value: number | null, prefix = "") {
		return value == null ? "—" : `${prefix}${value.toLocaleString()}`;
	}
</script>

<svelte:head>
	<title>{data.degree.degree} | {data.degree.university}</title>
	<meta
		name="description"
		content={`Yearly salary and employment data for ${data.degree.degree}, ${data.degree.university}`}
	/>
</svelte:head>

<div class="space-y-6">
	<!-- Degree Header -->
	<div class="degree-header">
		<img class="h-12 w-auto opacity-80" src={img} alt="{short} logo" />
		<div class="flex-1 min-w-0">
			<div class="text-xs font-medium text-muted">{data.degree.university}</div>
			{#if data.degree.school}
				<div class="text-[11px] text-muted">{data.degree.school}</div>
			{/if}
			<div class="text-sm font-semibold text-ink mt-0.5">{data.degree.degree}</div>
		</div>
	</div>

	<!-- Key Metrics -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
		<Metric title="Gross Median" degree={data.degree} property="gross_monthly_median" />
		<Metric title="Gross P75" degree={data.degree} property="gross_mthly_75_percentile" />
		<Metric title="Employment (All)" degree={data.degree} property="employment_rate_overall" />
		<Metric title="Employment (FT)" degree={data.degree} property="employment_rate_ft_perm" />
	</div>

	<!-- Charts -->
	{#if data.degree.data.length >= 2}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#if grossData.length >= 2}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<h3 class="text-xs font-heading font-semibold text-ink uppercase tracking-wide">Gross Income</h3>
						<UnovisLegend config={grossLegendConfig} />
					</div>
					<UnovisXYChart data={grossData} getConfig={getGrossChartConfig} height={220} />
				</div>
			{/if}

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-heading font-semibold text-ink uppercase tracking-wide">Employment Rate</h3>
					<UnovisLegend config={employmentLegendConfig} />
				</div>
				<UnovisXYChart data={data.degree.data} getConfig={getEmploymentChartConfig} height={220} />
			</div>
		</div>
	{/if}

	<!-- Data Table -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-heading font-semibold text-ink uppercase tracking-wide">Historical Data</h3>
			<Download rows={table.rows} fileName={data.degree.slug} />
		</div>
		<div class="data-table-wrap">
			<Datatable {table}>
				<table>
					<thead>
						<tr>
							<ThSort {table} field="year">Year</ThSort>
							<ThSort {table} field="gross_monthly_median">Median</ThSort>
							<ThSort {table} field="gross_mthly_25_percentile">P25</ThSort>
							<ThSort {table} field="gross_mthly_75_percentile">P75</ThSort>
							<ThSort {table} field="gross_monthly_mean">Mean</ThSort>
							<ThSort {table} field="employment_rate_overall">Empl. All</ThSort>
							<ThSort {table} field="employment_rate_ft_perm">Empl. FT</ThSort>
						</tr>
					</thead>
					<tbody>
						{#each table.rows as row}
							<tr>
								<td class="year-cell">{row.year}</td>
								<td class="num-cell highlight">{formatValue(row.gross_monthly_median, "$")}</td>
								<td class="num-cell">{formatValue(row.gross_mthly_25_percentile, "$")}</td>
								<td class="num-cell">{formatValue(row.gross_mthly_75_percentile, "$")}</td>
								<td class="num-cell">{formatValue(row.gross_monthly_mean, "$")}</td>
								<td class="num-cell">{row.employment_rate_overall}%</td>
								<td class="num-cell">{row.employment_rate_ft_perm}%</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</Datatable>
		</div>
	</div>
</div>

<style>
	.degree-header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
	}

	.data-table-wrap {
		overflow-x: auto;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
	}

	table {
		width: 100%;
		font-size: 12px;
		border-collapse: collapse;
	}

	thead tr {
		border-bottom: 2px solid #e8e5df;
	}

	thead :global(th) {
		padding: 8px 12px;
		font-family: 'DM Sans', system-ui, sans-serif;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #71717a;
		text-align: right;
		white-space: nowrap;
		background: #FAFAF7;
	}

	thead :global(th:first-child) {
		text-align: left;
	}

	tbody tr {
		border-bottom: 1px solid #f0efe9;
		transition: background 0.1s;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	tbody tr:hover {
		background: #f5f4f0;
	}

	td {
		padding: 6px 12px;
	}

	.year-cell {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 500;
		color: #71717a;
	}

	.num-cell {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		text-align: right;
		color: #71717a;
	}

	.num-cell.highlight {
		color: #1a1a1a;
		font-weight: 600;
	}
</style>
