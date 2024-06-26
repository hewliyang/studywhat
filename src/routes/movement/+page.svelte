<script lang="ts">
	import { goto } from "$app/navigation";
	import { YEARS, long2short } from "$lib/constants";
	import {
		Activity,
		ArrowDownWideNarrow,
		ArrowUpWideNarrow,
	} from "lucide-svelte";
	import {
		VisXYContainer,
		VisStackedBar,
		VisAxis,
		VisTooltip,
	} from "@unovis/svelte";
	import { Direction, Orientation, StackedBar } from "@unovis/ts";

	export let data;

	const metricOpts = [
		{ name: "Employment Rate (Overall)", value: "employment_rate_overall" },
		{ name: "Employment Rate (Full Time)", value: "employment_rate_ft_perm" },
		{ name: "Basic Monthly Mean", value: "basic_monthly_mean" },
		{ name: "Basic Monthly Median", value: "basic_monthly_median" },
		{ name: "Gross Monthly Mean", value: "gross_monthly_mean" },
		{ name: "Gross Monthly Median", value: "gross_monthly_median" },
		{
			name: "Gross Monthly, 25th Percentile",
			value: "gross_mthly_25_percentile",
		},
		{
			name: "Gross Monthly, 75th Percentile",
			value: "gross_mthly_75_percentile",
		},
	];

	type BarDatum = {
		x: string;
		y: number;
	};

	$: barData = [
		{ x: "Loss", y: data.worst.length },
		{ x: "Gain", y: data.best.length },
	];
	$: x = (_: BarDatum, i: number) => i;
	$: y = (d: BarDatum) => d.y;

	const tickFormat = (tick: number) => barData[tick].x;
	const color = (d: BarDatum, i: number) => (d.x === "Gain" ? "green" : "red");
	const triggers = {
		[StackedBar.selectors.bar]: (d: BarDatum) => `<div>${d.y}</div>`,
	};

	function handleChange() {
		goto(`/movement/?year=${data.year}&lag=${data.lag}&metric=${data.metric}`);
	}
</script>

<svelte:head>
	<title>Movement</title>
	<meta
		name="description"
		content="Analyse changes in employment trends over time in a stock screener style"
	/>
</svelte:head>

<div class="space-y-3">
	<div class="flex items-center mt-1">
		<Activity class="h-6 w-6 mr-2" />
		<h1 class="font-semibold text-xl">Movement</h1>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6 items-center">
		<!-- metric input -->
		<div class="flex flex-col">
			<label for="metric" class="text-sm font-semibold">Metric</label>
			<select
				name="metric"
				bind:value={data.metric}
				on:change={handleChange}
				class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
			>
				{#each metricOpts as { name, value }}
					{@const selected = value === data.metric}
					<option {value} {selected}>{name}</option>
				{/each}
			</select>
		</div>

		<!-- year select -->
		<div class="flex flex-col">
			<label for="year" class="text-sm font-semibold">Reference Year</label>
			<select
				name="year"
				bind:value={data.year}
				on:change={handleChange}
				class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
			>
				{#each YEARS as _year}
					{@const selected = _year === data.year}
					<option value={_year} {selected}>{_year}</option>
				{/each}
			</select>
		</div>

		<!-- lag input -->
		<div class="flex flex-col">
			<label for="lag" class="text-sm font-semibold">Time Lag (years)</label>
			<input
				name="lag"
				type="number"
				bind:value={data.lag}
				on:change={handleChange}
				min="1"
				class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
			/>
		</div>
		<VisXYContainer height={60} yDirection={Direction.South}>
			<h1 class="font-semibold mb-1 text-sm">Winners and Losers</h1>
			<VisStackedBar
				data={barData}
				orientation={Orientation.Horizontal}
				barPadding={-0.4}
				{x}
				{y}
				{color}
			/>
			<VisTooltip {triggers} />
			<VisAxis type="y" gridLine={false} {tickFormat} />
		</VisXYContainer>
	</div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
	<div class="space-y-2">
		<div class="flex items-center">
			<ArrowUpWideNarrow class="h-6 w-6 mr-2" />
			<h2 class="font-semibold text-lg">Winners</h2>
		</div>
		{#if data.best.length > 0}
			<table class="text-xs rounded-md overflow-x-auto border border-collapse">
				<thead>
					<tr class="text-left">
						<th class="px-3 py-2">University</th>
						<th class="px-3 py-2">School</th>
						<th class="px-3 py-2">Degree</th>
						<th class="px-3 py-2">Gain (%)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.best as row}
						<tr class="hover:bg-gray-100 transition-all duration-200">
							<td class="px-3 py-1 border-b border-gray-300"
								>{long2short[row.university]}</td
							>
							<td class="px-3 py-1 border-b border-gray-300"
								>{row.school ?? "-"}</td
							>
							<td class="px-3 py-1 border-b border-gray-300">
								<a href="/degree/{row.slug}" class="text-blue-500 underline"
									>{row.degree}</a
								>
							</td>
							<td
								class="px-3 py-1 border-b border-gray-300 text-green-500 font-bold"
								>{row.pctChange.toFixed(2)}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div>😢 no winners 😢</div>
		{/if}
	</div>
	<div class="space-y-2">
		<div class="flex items-center">
			<ArrowDownWideNarrow class="h-6 w-6 mr-2" />
			<h2 class="font-semibold text-lg">Losers</h2>
		</div>
		{#if data.worst.length > 0}
			<table class="text-xs rounded-md overflow-x-auto border border-collapse">
				<thead>
					<tr class="text-left">
						<th class="px-3 py-2">University</th>
						<th class="px-3 py-2">School</th>
						<th class="px-3 py-2">Degree</th>
						<th class="px-3 py-2">Loss (%)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.worst as row}
						<tr class="hover:bg-gray-100 transition-all duration-200">
							<td class="px-3 py-1 border-b border-gray-300"
								>{long2short[row.university]}</td
							>
							<td class="px-3 py-1 border-b border-gray-300"
								>{row.school ?? "-"}</td
							>
							<td class="px-3 py-1 border-b border-gray-300">
								<a href="/degree/{row.slug}" class="text-blue-500 underline"
									>{row.degree}</a
								>
							</td>
							<td
								class="px-3 py-1 border-b border-gray-300 text-red-500 font-bold"
								>{row.pctChange.toFixed(2)}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div>🎉 no losers 🎉</div>
		{/if}
	</div>
</div>
