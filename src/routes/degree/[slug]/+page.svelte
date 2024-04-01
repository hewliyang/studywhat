<script lang="ts">
	import { short2img, long2short } from "$lib/constants";
	import type { YearlyRecord } from "$lib/types";
	import {
		VisXYContainer,
		VisAxis,
		VisLine,
		VisBulletLegend,
		VisTooltip,
		VisCrosshair,
	} from "@unovis/svelte";
	import { CurveType } from "@unovis/ts";
	import { DataHandler, Datatable, Th } from "@vincjo/datatables";

	export let data;

	let pctChange: number;
	let isPositive: boolean;

	$: isEnoughData = data.degree.data.length > 2;
	$: short = long2short[data.degree.university];
	$: img = short2img[short];

	// YoY change stats
	$: if (isEnoughData) {
		const ts = data.degree.data;
		const latestYrVal = ts[ts.length - 1].gross_monthly_median;
		const prevYrVal = ts[ts.length - 2].gross_monthly_median;
		pctChange = ((latestYrVal - prevYrVal) / prevYrVal) * 100;
		isPositive = pctChange > 0;
	}

	// chart stuff

	// median income
	const x = (d: YearlyRecord) => d.year;
	const y = [
		(d: YearlyRecord) => d.gross_monthly_median,
		(d: YearlyRecord) => d.gross_mthly_25_percentile,
		(d: YearlyRecord) => d.gross_mthly_75_percentile,
	];

	// employment stats
	const yEmp = [
		(d: YearlyRecord) => d.employment_rate_ft_perm,
		(d: YearlyRecord) => d.employment_rate_overall,
	];

	function tooltipTemplate(d: YearlyRecord): string {
		const title = `<div style="color: #666; text-align: center;">${d.year} - Gross</div>`;
		const q1 = `25th: <b>${d.gross_mthly_25_percentile}$</b><br />`;
		const median = `50th: <b>${d.gross_monthly_median}$</b><br />`;
		const q3 = `75th: <b>${d.gross_mthly_75_percentile}$</b>`;
		return `<div style="font-size: 12px;">${title}${q1}${median}${q3}</div>`;
	}

	function employmentTooltipTemplate(d: YearlyRecord): string {
		const title = `<div style="color: #666; text-align: center;">${d.year} - Employment</div>`;
		const ft = `Full Time: <b>${d.employment_rate_ft_perm}%</b><br />`;
		const all = `Overall: <b>${d.employment_rate_overall}%</b><br />`;
		return `<div style="font-size: 12px;">${title}${ft}${all}</div>`;
	}

	// datatable stuff
	$: handler = new DataHandler(data.degree.data, {
		rowsPerPage: 100,
	});
	$: rows = handler.getRows();
</script>

<div class="flex flex-col space-y-4">
	<div class="flex gap-4 mt-2 border rounded-lg py-3 shadow-sm">
		<img class="h-16 ml-3" src={img} alt="University Logo" />
		<div>
			<div class="text-lg font-medium text-black">{data.degree.university}</div>
			<p class="text-gray-500 text-sm">
				{data.degree.degree}, {data.degree.school}
			</p>
			{#if isEnoughData}
				<p
					class="text-sm {isPositive || pctChange === 0
						? 'text-green-500'
						: 'text-red-500'}"
				>
					{isPositive ? "+" : ""}{pctChange.toFixed(2)}%
				</p>
			{/if}
		</div>
	</div>

	{#if isEnoughData}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<VisXYContainer height={250} data={data.degree.data}>
				<div class="flex items-center justify-between mb-3">
					<h4 class="font-semibold">Gross Income</h4>
					<VisBulletLegend
						items={[{ name: "Median" }, { name: "25th" }, { name: "75th" }]}
					/>
				</div>
				<VisLine {x} {y} curveType={CurveType.Linear} />
				<VisAxis type="x" numTicks={(data.degree.data.length / 2) >> 0} />
				<VisAxis type="y" />
				<VisTooltip />
				<VisCrosshair
					{x}
					{y}
					template={tooltipTemplate}
					hideWhenFarFromPointer={true}
				/>
			</VisXYContainer>

			<VisXYContainer height={250} data={data.degree.data}>
				<div class="flex items-center justify-between mb-3">
					<h4 class="font-semibold">Employment Rate</h4>
					<VisBulletLegend
						items={[{ name: "Full Time" }, { name: "Overall" }]}
					/>
				</div>
				<VisLine {x} y={yEmp} curveType={CurveType.Linear} />
				<VisAxis type="x" numTicks={(data.degree.data.length / 2) >> 0} />
				<VisAxis type="y" />
				<VisTooltip />
				<VisCrosshair
					{x}
					y={yEmp}
					template={employmentTooltipTemplate}
					hideWhenFarFromPointer={true}
				/>
			</VisXYContainer>
		</div>
	{/if}
	<div class="overflow-x-auto">
		<Datatable
			{handler}
			search={false}
			rowsPerPage={false}
			pagination={false}
			rowCount={false}
		>
			<table>
				<thead>
					<tr>
						<Th {handler} orderBy="year">Year</Th>
						<Th {handler} orderBy="gross_monthly_median">Median</Th>
						<Th {handler} orderBy="gross_mthly_25_percentile">25th</Th>
						<Th {handler} orderBy="gross_mthly_75_percentile">75th</Th>
						<Th {handler} orderBy="gross_monthly_mean">Mean</Th>
						<Th {handler} orderBy="employment_rate_overall">EmploymentAll</Th>
						<Th {handler} orderBy="employment_rate_ft_perm">EmploymentFT</Th>
					</tr>
				</thead>
				<tbody>
					{#each $rows as row}
						<tr>
							<td>{row.year}</td>
							<td>{row.gross_monthly_median.toLocaleString()}</td>
							<td>{row.gross_mthly_25_percentile.toLocaleString()}</td>
							<td>{row.gross_mthly_75_percentile.toLocaleString()}</td>
							<td>{row.gross_monthly_mean.toLocaleString()}</td>
							<td>{row.employment_rate_overall}%</td>
							<td>{row.employment_rate_ft_perm}%</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Datatable>
	</div>
</div>

<style>
	table {
		font-size: small;
	}

	thead {
		background: #fff;
	}
	tbody td {
		border: 1px solid #f5f5f5;
		padding: 4px 20px;
	}
	tbody tr {
		transition: all, 0.2s;
	}
	tbody tr:hover {
		background: #f5f5f5;
	}
</style>
