<script lang="ts">
	import { goto } from "$app/navigation";
	import { YEARS, long2short } from "$lib/constants";
	import {
		Activity,
		ArrowDownWideNarrow,
		ArrowUpWideNarrow,
	} from "lucide-svelte";
	import {
		Axis,
		Direction,
		Orientation,
		StackedBar,
		Tooltip,
		type XYContainerConfigInterface,
	} from "@unovis/ts";
	import type { PageData } from "./$types";
	import UnovisXYChart from "$lib/components/charts/UnovisXYChart.svelte";

	let { data }: { data: PageData } = $props();
	let selectedMetric = $state<PageData["metric"]>("gross_monthly_median");
	let selectedYear = $state(0);
	let selectedLag = $state(1);

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

	const barData = $derived([
		{ x: "Loss", y: data.worst.length },
		{ x: "Gain", y: data.best.length },
	]);
	const x = (_: BarDatum, i: number) => i;
	const y = (d: BarDatum) => d.y;

	const tickFormat = (tick: number | Date) =>
		typeof tick === "number" ? barData[tick]?.x ?? "" : "";
	const color = (d: BarDatum, i: number) => (d.x === "Gain" ? "green" : "red");
	const triggers = {
		[StackedBar.selectors.bar]: (d: { datum?: BarDatum }) => {
			const bar = d?.datum;
			if (!bar) return undefined;
			return `<div>${bar.x}: ${bar.y}</div>`;
		},
	};

	const getSummaryChartConfig = $derived.by<
		() => XYContainerConfigInterface<BarDatum>
	>(() => () => ({
		height: 60,
		yDirection: Direction.South,
		components: [
			new StackedBar<BarDatum>({
				orientation: Orientation.Horizontal,
				barPadding: -0.4,
				x,
				y,
				color,
			}),
		],
		tooltip: new Tooltip({ triggers }),
		yAxis: new Axis<BarDatum>({
			gridLine: false,
			tickFormat,
		}),
	}));

	$effect(() => {
		selectedMetric = data.metric;
		selectedYear = data.year;
		selectedLag = data.lag;
	});

	function handleChange() {
		goto(`/movement/?year=${selectedYear}&lag=${selectedLag}&metric=${selectedMetric}`);
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
				bind:value={selectedMetric}
				onchange={handleChange}
				class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
			>
				{#each metricOpts as { name, value }}
					{@const selected = value === selectedMetric}
					<option {value} {selected}>{name}</option>
				{/each}
			</select>
		</div>

		<!-- year select -->
		<div class="flex flex-col">
			<label for="year" class="text-sm font-semibold">Reference Year</label>
			<select
				name="year"
				bind:value={selectedYear}
				onchange={handleChange}
				class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
			>
				{#each YEARS as _year}
					{@const selected = _year === selectedYear}
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
				bind:value={selectedLag}
				onchange={handleChange}
				min="1"
				class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
			/>
		</div>
		<div>
			<h1 class="font-semibold mb-1 text-sm">Winners and Losers</h1>
			<UnovisXYChart data={barData} getConfig={getSummaryChartConfig} />
		</div>
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
