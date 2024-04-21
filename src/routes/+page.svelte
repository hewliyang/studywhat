<script lang="ts">
	import { goto } from "$app/navigation";
	import { Scale, Scatter } from "@unovis/ts";
	import { long2short, palette, YEARS } from "$lib/constants";
	import { DataHandler, Datatable, Th, ThFilter } from "@vincjo/datatables";
	import {
		VisXYContainer,
		VisScatter,
		VisAxis,
		VisTooltip,
		VisBulletLegend,
	} from "@unovis/svelte";
	import Sparkline from "$lib/components/Sparkline.svelte";
	import Histogram from "$lib/components/Histogram.svelte";
	import {
		Activity,
		ArrowUpRight,
		AlignVerticalDistributeCenter,
		CircleDollarSign,
		ArrowDownWideNarrow,
		ArrowUpWideNarrow,
		Table,
	} from "lucide-svelte";
	import type { FlatRecord } from "$lib/types";
	import Export from "$lib/components/Export.svelte";

	export let data;

	$: initialYr = data.year;
	$: selectedYr = initialYr;
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
	const handler = new DataHandler(data.top, { rowsPerPage: 10 });
	$: handler.setRows(data.top);
	$: rows = handler.getRows();

	function handleYearChange() {
		goto(`/?year=${selectedYr}`);
	}
</script>

<section>
	{#if data.gainAndLoss.best.length > 2}
		<div class="flex items-center">
			<ArrowUpWideNarrow class="h-6 w-6 mr-2" />
			<h1 class="font-semibold text-lg">Winners 1Y (%)</h1>
			<a
				class="flex items-center ml-auto px-2 py-1 border-2 rounded-lg hover:scale-[101%] hover:ring-1 hover:ring-purple-700"
				href={`/movement/?year=${selectedYr}`}
			>
				<p class="text-sm">Movement</p>
				<Activity class="ml-2 h-4 w-4" />
			</a>
		</div>
		<div class="flex overflow-x-auto whitespace-nowrap gap-3 mt-3">
			{#each data.gainAndLoss.best as record}
				<Sparkline {record} refYear={selectedYr} />
			{/each}
		</div>
	{/if}
	{#if data.gainAndLoss.worst.length > 2}
		<div class="flex items-center mt-3">
			<ArrowDownWideNarrow class="h-6 w-6 mr-2" />
			<h1 class="font-semibold text-lg">Losers 1Y (%)</h1>
		</div>
		<div class="flex overflow-x-auto whitespace-nowrap gap-3 mt-3">
			{#each data.gainAndLoss.worst as record}
				<Sparkline {record} refYear={selectedYr} />
			{/each}
		</div>
	{/if}
</section>

<div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
	<div class="lg:col-span-5 lg:flex-grow">
		<VisXYContainer data={data.top} height={350}>
			<div class="flex flex-col mb-6">
				<div class="flex items-center">
					<CircleDollarSign class="h-6 w-6 mr-2" />
					<h3 class="font-semibold text-lg">
						Graduate Median Incomes by Degree
					</h3>
					<form class="md: ml-auto">
						<select
							name="year"
							bind:value={selectedYr}
							on:change={handleYearChange}
							class="text-sm px-2 py-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
			<VisAxis type="x" label="Median Gross Income ($)" gridLine={true} />
			<VisAxis type="y" label="Full Time Employment Rate (%)" gridLine={true} />
			<VisTooltip {triggers} />
			<div class="absolute bottom-12 right-5">
				<div class="flex space-x-1 items-center text-gray-400 text-sm">
					<ArrowUpRight class="h-4 w-4" />
					<span>is better</span>
				</div>
			</div>
		</VisXYContainer>
	</div>
	<div class="lg:col-span-2 lg:row-span-1 lg:flex-shrink-0 lg:w-3/10">
		<div class="mb-2">
			<div class="flex items-center">
				<AlignVerticalDistributeCenter class="h-6 w-6 mr-2" />
				<h3 class="font-semibold text-lg">Distribution of Median Incomes</h3>
			</div>
			<p class="text-xs text-gray-500">
				Note: Frequency in terms of degrees, <b class="font-bold">not</b> graduates
			</p>
		</div>
		<Histogram data={data.top} />
	</div>
</div>

<section class="overflow-x-auto mt-4">
	<div class="flex items-center">
		<Table class="h-6 w-6 mr-2" />
		<h3 class="font-semibold text-lg">Data Table</h3>
		<div class="ml-auto">
			<Export rows={data.top} fileName={String(selectedYr)} />
		</div>
	</div>
	<Datatable {handler} search={false} rowsPerPage={false}>
		<table>
			<thead>
				<tr>
					<Th {handler} orderBy={(row) => long2short[row.university]}
						>University</Th
					>
					<Th {handler} orderBy="degree">Degree</Th>
					<Th {handler} orderBy="gross_monthly_median">Gross Median</Th>
					<Th {handler} orderBy="gross_mthly_25_percentile">25th</Th>
					<Th {handler} orderBy="gross_mthly_75_percentile">75th</Th>
					<Th {handler} orderBy="employment_rate_overall">Employment Rate</Th>
				</tr>
				<tr>
					<ThFilter {handler} filterBy={(row) => long2short[row.university]} />
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
		border-collapse: separate;
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
