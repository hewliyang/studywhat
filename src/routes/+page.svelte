<script lang="ts">
	import { Scale, Scatter } from "@unovis/ts";
	import { long2short } from "$lib/constants";
	import {
		VisXYContainer,
		VisScatter,
		VisAxis,
		VisTooltip,
		VisBulletLegend,
	} from "@unovis/svelte";
	import { DataHandler, Datatable, Th, ThFilter } from "@vincjo/datatables";
	import type { NumericAccessor, StringAccessor } from "@unovis/ts";
	import type { FlatRecord } from "$lib/types";

	export let data;

	const palette = [
		"#04c0c7",
		"#e7871a",
		"#da348f",
		"#9089fa",
		"#47e26f",
		"#2780eb",
		"#6f38b1",
		"#268d6c",
		"#d11d55",
		"#ffcc00",
		"#a0d6e5",
		"#f45a6d",
	];

	// chart
	const institutions = [...new Set(data.top.map((d) => d.university))].sort();
	const colorScale = Scale.scaleOrdinal(palette).domain(institutions);
	const formatNumber = Intl.NumberFormat("en", { notation: "compact" }).format;

	const y: NumericAccessor<FlatRecord> = (d) => d.employment_rate_overall;
	const x: NumericAccessor<FlatRecord> = (d) => d.gross_monthly_median;
	const color: StringAccessor<FlatRecord> = (d) => colorScale(d.university);
	// const label: StringAccessor<FlatRecord> = (d) => d.degree;
	const legendItems = institutions.map((v) => ({
		name: v,
		color: colorScale(v),
	}));
	const triggers = {
		[Scatter.selectors.point]: (d: FlatRecord) => `
			${long2short[d.university]} - ${d.degree} - ${d.gross_monthly_median}
		`,
	};

	// data table
	const handler = new DataHandler(data.top, { rowsPerPage: 10 });
	const rows = handler.getRows();
</script>

<VisXYContainer data={data.top} height={350}>
	<div class="flex flex-col mb-6">
		<h3 class="font-semibold text-lg">Singapore Fresh Graduate Incomes (↗)</h3>
		<VisBulletLegend items={legendItems} />
	</div>
	<VisScatter cursor="pointer" size={10} {x} {y} {color} />
	<VisAxis type="x" label="Median Gross Income ($)" gridLine={false} />
	<VisAxis type="y" label="Full Time Employment Rate (%)" gridLine={false} />
	<VisTooltip {triggers} />
</VisXYContainer>

<div class="overflow-x-auto mt-4">
	<Datatable {handler} search={false}>
		<table>
			<thead>
				<tr>
					<Th {handler} orderBy="university">University</Th>
					<Th {handler} orderBy="degree">Degree</Th>
					<Th {handler} orderBy="employment_rate_overall">Employment Rate</Th>
					<Th {handler} orderBy="gross_monthly_median">Gross Median</Th>
					<Th {handler} orderBy="gross_mthly_25_percentile">25th</Th>
					<Th {handler} orderBy="gross_mthly_75_percentile">75th</Th>
				</tr>
				<tr>
					<ThFilter {handler} filterBy="university" />
					<ThFilter {handler} filterBy="degree" />
				</tr>
			</thead>
			<tbody>
				{#each $rows as row}
					<tr>
						<td>{long2short[row.university]}</td>
						<td
							><a href="/degree/{row.slug}" class="underline text-blue-600">
								{row.degree}
							</a>
						</td>
						<td>{row.employment_rate_overall}%</td>
						<td>${row.gross_monthly_median.toLocaleString()}</td>
						<td>${row.gross_mthly_25_percentile.toLocaleString()}</td>
						<td>${row.gross_mthly_75_percentile.toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Datatable>
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
