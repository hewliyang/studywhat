<script lang="ts">
	import { Scale, Scatter } from "@unovis/ts";
	import { long2short, YEARS } from "$lib/constants";
	import {
		VisXYContainer,
		VisScatter,
		VisAxis,
		VisTooltip,
		VisBulletLegend,
	} from "@unovis/svelte";
	import { DataHandler, Datatable, Th, ThFilter } from "@vincjo/datatables";
	import type { FlatRecord } from "$lib/types";
	import { goto } from "$app/navigation";
	import Sparkline from "$lib/components/Sparkline.svelte";

	export let data;

	const initialYr = data.year;
	$: selectedYr = initialYr;

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
	$: institutions = [...new Set(data.top.map((d) => d.university))].sort();
	$: colorScale = Scale.scaleOrdinal(palette).domain(institutions);

	$: y = (d: FlatRecord) => d.employment_rate_overall;
	$: x = (d: FlatRecord) => d.gross_monthly_median;
	$: color = (d: FlatRecord) => colorScale(d.university);
	$: legendItems = institutions.map((v) => ({
		name: v,
		color: colorScale(v),
	}));
	$: triggers = {
		[Scatter.selectors.point]: (d: FlatRecord) => `
			<div class="flex flex-col items-center">
				<div class="flex items-center mb-2">
					<span class="font-bold mr-2">${long2short[d.university]}</span>
					<span class="px-2 py-1 bg-gray-200 rounded-full text-xs">${d.degree}</span>
				</div>
				<div class="flex items-center justify-between w-full mb-2">
					<div class="flex flex-col items-start">
						<span class="text-gray-400 text-xs font-mono">${d.gross_mthly_25_percentile}</span>
					</div>
					<div class="relative h-1 w-full rounded-full overflow-hidden">
						<div class="absolute inset-y-0 left-0 h-full w-1/2 bg-red-500 rounded-l-full"></div>
						<div class="absolute inset-y-0 right-0 h-full w-1/2 bg-green-500 rounded-r-full"></div>
					</div>
					<div class="flex flex-col items-end">
						<span class="text-gray-400 text-xs font-mono">${d.gross_mthly_75_percentile}</span>
					</div>
				</div>
				<div class="flex justify-center w-full">
					<span class="text-xs font-mono">${d.gross_monthly_median}</span>
				</div>
				<div class="text-gray-400 text-xs italic">Gross Monthly Income</div>
			</div>
		`,
	};
	$: events = {
		[Scatter.selectors.point]: {
			click: (d: FlatRecord) => {
				goto(`degree/${d.slug}`);
			},
		},
	};

	// data table
	$: handler = new DataHandler(data.top, { rowsPerPage: 10 });
	$: rows = handler.getRows();

	function handleYearChange() {
		goto(`/?year=${selectedYr}`);
	}
</script>

<section>
	<h1 class="font-semibold text-lg mb-3">Largest Year on Year Gains (%)</h1>
	<div class="flex overflow-x-auto whitespace-nowrap gap-3">
		{#each data.gainAndLoss.best as record}
			<Sparkline {record} />
		{/each}
	</div>
	<h1 class="font-semibold text-lg mb-3">Largest Year on Year Losses (%)</h1>
	<div class="flex overflow-x-auto whitespace-nowrap gap-3">
		{#each data.gainAndLoss.worst as record}
			<Sparkline {record} />
		{/each}
	</div>
</section>

<VisXYContainer data={data.top} height={350}>
	<div class="flex flex-col mb-6">
		<div class="flex justify-between items-center">
			<h3 class="font-semibold text-lg">
				Singapore Fresh Graduate Incomes ({selectedYr})
				<span class="text-sm opacity-75">↗ is better</span>
			</h3>
			<form>
				<select
					name="year"
					bind:value={selectedYr}
					on:change={handleYearChange}
					class="text-sm inline-block px-2 py-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				>
					{#each YEARS as year}
						{@const selected = year === selectedYr}
						<option value={year} {selected}>{year}</option>
					{/each}
				</select>
			</form>
		</div>
		<VisBulletLegend items={legendItems} />
	</div>
	<VisScatter cursor="pointer" size={10} {x} {y} {color} {events} />
	<VisAxis type="x" label="Median Gross Income ($)" gridLine={false} />
	<VisAxis type="y" label="Full Time Employment Rate (%)" gridLine={false} />
	<VisTooltip {triggers} />
</VisXYContainer>

<section class="overflow-x-auto mt-4">
	<Datatable {handler} search={false} rowsPerPage={false}>
		<table>
			<thead>
				<tr>
					<Th {handler} orderBy="university">University</Th>
					<Th {handler} orderBy="degree">Degree</Th>
					<Th {handler} orderBy="gross_monthly_median">Gross Median</Th>
					<Th {handler} orderBy="gross_mthly_25_percentile">25th</Th>
					<Th {handler} orderBy="gross_mthly_75_percentile">75th</Th>
					<Th {handler} orderBy="employment_rate_overall">Employment Rate</Th>
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
						<td>${row.gross_monthly_median.toLocaleString()}</td>
						<td>${row.gross_mthly_25_percentile.toLocaleString()}</td>
						<td>${row.gross_mthly_75_percentile.toLocaleString()}</td>
						<td>{row.employment_rate_overall}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Datatable>
</section>

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
