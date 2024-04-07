<script lang="ts">
	import { goto } from "$app/navigation";
	import { YEARS, long2short } from "$lib/constants";
	import Katex from "$lib/components/Katex.svelte";

	export let data;

	const metricOpts = [
		"employment_rate_overall",
		"employment_rate_ft_perm",
		"basic_monthly_mean",
		"basic_monthly_median",
		"gross_monthly_mean",
		"gross_monthly_median",
		"gross_mthly_25_percentile",
		"gross_mthly_75_percentile",
	];

	function handleChange() {
		goto(`/movement/?year=${data.year}&lag=${data.lag}&metric=${data.metric}`);
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
		integrity="sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww"
		crossorigin="anonymous"
	/>
	<script
		defer
		src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"
		integrity="sha384-hIoBPJpTUs74ddyc4bFZSM1TVlQDA60VBbJS0oA934VSz82sBx1X7kSx2ATBDIyd"
		crossorigin="anonymous"
	></script>
</svelte:head>

<h1 class="font-semibold text-xl">Movement</h1>

<p>
	<span class="text-sm">
		Percentages are computed according to the following scheme:
	</span>
	<Katex
		math={"\\Delta=\\frac{\\text{metric}_{\\text{year}} - \\text{metric}_{\\text{year}-\\text{lag}}}{\\text{metric}_{year-\\text{lag}}} \\times 100"}
	/>
	<span class="text-sm">
		. Also note that if <Katex math={"\\Delta = 0"} /> for a given degree, it will
		not be shown.
	</span>
</p>

<div class="flex flex-col gap-4 md:flex-row">
	<!-- metric input -->
	<div class="flex flex-col md:flex-row md:items-center">
		<label
			for="metric"
			class="block font-medium text-gray-900 mb-1 md:mb-0 md:mr-2">Metric</label
		>
		<select
			name="metric"
			bind:value={data.metric}
			on:change={handleChange}
			class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
		>
			{#each metricOpts as _metric}
				{@const selected = _metric === data.metric}
				<option value={_metric} {selected}>{_metric}</option>
			{/each}
		</select>
	</div>

	<!-- year select -->
	<div class="flex flex-col md:flex-row md:items-center">
		<label
			for="year"
			class="block font-medium text-gray-900 mb-1 md:mb-0 md:mr-2"
			>Reference Year</label
		>
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
	<div class="flex flex-col md:flex-row md:items-center">
		<label
			for="lag"
			class="block font-medium text-gray-900 mb-1 md:mb-0 md:mr-2"
			>Time Lag (years)</label
		>
		<input
			name="lag"
			type="number"
			bind:value={data.lag}
			on:change={handleChange}
			min="1"
			max="10"
			class="text-sm inline-block p-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
		/>
	</div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
	<div>
		<h2 class="font-semibold text-lg mb-3">Winners</h2>
		{#if data.best.length > 0}
			<table>
				<thead>
					<tr>
						<th>University</th>
						<th>School</th>
						<th>Degree</th>
						<th>Gain (%)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.best as row}
						<tr>
							<td>{long2short[row.university]}</td>
							<td>{row.school ?? "-"}</td>
							<td
								><a href="/degree/{row.slug}" class="text-blue-500 underline"
									>{row.degree}</a
								></td
							>
							<td class="text-green-500">{row.pctChange.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div>😢 no winners 😢</div>
		{/if}
	</div>
	<div>
		<h2 class="font-semibold text-lg mb-3">Losers</h2>
		{#if data.worst.length > 0}
			<table>
				<thead>
					<tr>
						<th>University</th>
						<th>School</th>
						<th>Degree</th>
						<th>Loss (%)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.worst as row}
						<tr>
							<td>{long2short[row.university]}</td>
							<td>{row.school ?? "-"}</td>
							<td
								><a href="/degree/{row.slug}" class="text-blue-500 underline"
									>{row.degree}</a
								></td
							>
							<td class="text-red-500">{row.pctChange.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div>🎉 no losers 🎉</div>
		{/if}
	</div>
</div>

<style>
	table {
		font-size: small;
		border-collapse: separate;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 0rem 1rem;
	}

	thead {
		background: #fff;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr {
		transition: all, 0.2s;
	}

	tbody tr:hover {
		background: #f5f5f5;
	}
</style>
