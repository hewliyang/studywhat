<script lang="ts">
	import { goto } from "$app/navigation";
	import { YEARS, long2short } from "$lib/constants";
	import {
		Minus,
		Plus,
		TrendingUp,
		TrendingDown,
	} from "lucide-svelte";
	import Seo from "$lib/components/Seo.svelte";
	import type { PageData } from "./$types";

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
		{ name: "Gross Monthly P25", value: "gross_mthly_25_percentile" },
		{ name: "Gross Monthly P75", value: "gross_mthly_75_percentile" },
	];

	const maxLag = $derived(Math.max(1, selectedYear - Math.min(...YEARS)));

	$effect(() => {
		selectedMetric = data.metric;
		selectedYear = data.year;
		selectedLag = data.lag;
	});

	function buildUrl(year: number = selectedYear, lag: number = selectedLag) {
		const params = new URLSearchParams();
		params.set("year", String(year));
		if (lag > 1) params.set("lag", String(lag));
		if (selectedMetric !== "gross_monthly_median") params.set("metric", selectedMetric);
		return `/movement?${params.toString()}`;
	}

	function handleChange() {
		goto(buildUrl());
	}

	function handleYearStep(delta: number) {
		const next = Math.min(Math.max(selectedYear + delta, YEARS[0]), YEARS[YEARS.length - 1]);
		if (next !== selectedYear) {
			selectedYear = next;
			// clamp lag to new max
			const newMaxLag = Math.max(1, next - Math.min(...YEARS));
			if (selectedLag > newMaxLag) selectedLag = newMaxLag;
			goto(buildUrl(next, selectedLag));
		}
	}

	function handleLagStep(delta: number) {
		const next = Math.min(Math.max(selectedLag + delta, 1), maxLag);
		if (next !== selectedLag) {
			selectedLag = next;
			goto(buildUrl(selectedYear, next));
		}
	}
</script>

<Seo
	title="Movement | StudyWhat"
	description="Compare year-over-year changes in graduate salaries and employment across Singapore degree programmes."
	pathname="/movement"
/>

<div class="space-y-6">
	<!-- Controls -->
	<div>
		<h1 class="text-sm font-semibold text-ink tracking-tight mb-4">Movement</h1>
		<div class="flex flex-wrap items-end gap-4">
			<div class="control-group">
				<label for="metric" class="control-label">Metric</label>
				<select
					name="metric"
					bind:value={selectedMetric}
					onchange={handleChange}
					class="control-input"
				>
					{#each metricOpts as { name, value }}
						<option {value} selected={value === selectedMetric}>{name}</option>
					{/each}
				</select>
			</div>

			<div class="control-group">
				<label for="year" class="control-label">Year</label>
				<div class="stepper-row">
					<button
						class="stepper-btn stepper-btn-left"
						disabled={selectedYear <= YEARS[0]}
						onclick={() => handleYearStep(-1)}
						aria-label="Previous year"
					>
						<Minus class="h-3 w-3" />
					</button>
					<select
						name="year"
						bind:value={selectedYear}
						onchange={handleChange}
						class="stepper-select"
					>
						{#each YEARS as _year}
							<option value={_year} selected={_year === selectedYear}>{_year}</option>
						{/each}
					</select>
					<button
						class="stepper-btn stepper-btn-right"
						disabled={selectedYear >= YEARS[YEARS.length - 1]}
						onclick={() => handleYearStep(1)}
						aria-label="Next year"
					>
						<Plus class="h-3 w-3" />
					</button>
				</div>
			</div>

			<div class="control-group">
				<label for="lag" class="control-label">Lag</label>
				<div class="stepper-row">
					<button
						class="stepper-btn stepper-btn-left"
						disabled={selectedLag <= 1}
						onclick={() => handleLagStep(-1)}
						aria-label="Decrease lag"
					>
						<Minus class="h-3 w-3" />
					</button>
					<span class="stepper-value">{selectedLag}</span>
					<button
						class="stepper-btn stepper-btn-right"
						disabled={selectedLag >= maxLag}
						onclick={() => handleLagStep(1)}
						aria-label="Increase lag"
					>
						<Plus class="h-3 w-3" />
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Summary -->
	<div class="flex gap-4 text-xs font-mono">
		<span class="flex items-center gap-1.5 text-gain">
			<TrendingUp class="h-3.5 w-3.5" />
			{data.best.length} winners
		</span>
		<span class="flex items-center gap-1.5 text-loss">
			<TrendingDown class="h-3.5 w-3.5" />
			{data.worst.length} losers
		</span>
	</div>

	<!-- Tables -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Winners -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<TrendingUp class="h-4 w-4 text-gain" />
				<h2 class="text-xs font-heading font-semibold text-ink uppercase tracking-wide">Winners</h2>
			</div>
			{#if data.best.length > 0}
				<div class="movement-table-wrap">
					<table>
						<thead>
							<tr>
								<th>Uni</th>
								<th>Degree</th>
								<th class="text-right">Gain</th>
							</tr>
						</thead>
						<tbody>
							{#each data.best as row}
								<tr>
									<td class="uni-cell">{long2short[row.university]}</td>
									<td class="degree-cell">
										<a href="/degree/{row.slug}">{row.degree}</a>
										{#if row.school}
											<span class="school-tag">{row.school}</span>
										{/if}
									</td>
									<td class="change-cell gain">+{row.pctChange.toFixed(1)}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-xs text-muted py-4">No winners for this period.</p>
			{/if}
		</div>

		<!-- Losers -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<TrendingDown class="h-4 w-4 text-loss" />
				<h2 class="text-xs font-heading font-semibold text-ink uppercase tracking-wide">Losers</h2>
			</div>
			{#if data.worst.length > 0}
				<div class="movement-table-wrap">
					<table>
						<thead>
							<tr>
								<th>Uni</th>
								<th>Degree</th>
								<th class="text-right">Loss</th>
							</tr>
						</thead>
						<tbody>
							{#each data.worst as row}
								<tr>
									<td class="uni-cell">{long2short[row.university]}</td>
									<td class="degree-cell">
										<a href="/degree/{row.slug}">{row.degree}</a>
										{#if row.school}
											<span class="school-tag">{row.school}</span>
										{/if}
									</td>
									<td class="change-cell loss">{row.pctChange.toFixed(1)}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-xs text-muted py-4">No losers for this period.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.control-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.control-label {
		font-family: 'DM Sans', system-ui, sans-serif;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #71717a;
	}

	.control-input {
		font-size: 12px;
		font-family: inherit;
		padding: 6px 8px;
		border: 1px solid #e8e5df;
		border-radius: 6px;
		background: #ffffff;
		color: #1a1a1a;
	}

	.control-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb;
	}

	.movement-table-wrap {
		overflow-x: auto;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
	}

	table {
		width: 100%;
		font-size: 11px;
		border-collapse: collapse;
	}

	thead tr {
		border-bottom: 2px solid #e8e5df;
	}

	th {
		padding: 6px 10px;
		font-family: 'DM Sans', system-ui, sans-serif;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #71717a;
		text-align: left;
		white-space: nowrap;
		background: #FAFAF7;
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
		padding: 5px 10px;
	}

	.uni-cell {
		font-weight: 500;
		font-size: 10px;
		white-space: nowrap;
		color: #71717a;
	}

	.degree-cell {
		max-width: 200px;
	}

	.degree-cell a {
		color: #1a1a1a;
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.15s;
	}

	.degree-cell a:hover {
		border-bottom-color: #2563eb;
		color: #2563eb;
	}

	.school-tag {
		display: block;
		font-size: 9px;
		color: #a1a19a;
		margin-top: 1px;
	}

	.change-cell {
		font-family: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 600;
		text-align: right;
		white-space: nowrap;
	}

	.change-cell.gain {
		color: #16a34a;
	}

	.change-cell.loss {
		color: #dc2626;
	}

	.stepper-row {
		display: flex;
		align-items: center;
	}

	.stepper-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 30px;
		border: 1px solid #e8e5df;
		background: #ffffff;
		color: #71717a;
		cursor: pointer;
		transition: all 0.15s;
	}

	.stepper-btn-left {
		border-radius: 6px 0 0 6px;
	}

	.stepper-btn-right {
		border-radius: 0 6px 6px 0;
		border-left: none;
	}

	.stepper-btn:hover:not(:disabled) {
		border-color: #d4d3cd;
		color: #1a1a1a;
		background: #f5f4f0;
	}

	.stepper-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.stepper-select {
		font-size: 12px;
		font-family: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace;
		padding: 3px 6px;
		height: 30px;
		border-top: 1px solid #e8e5df;
		border-bottom: 1px solid #e8e5df;
		border-left: none;
		border-right: none;
		background: #ffffff;
		color: #1a1a1a;
		appearance: none;
		text-align: center;
		min-width: 56px;
	}

	.stepper-select:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb;
	}

	.stepper-value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-family: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace;
		height: 30px;
		min-width: 36px;
		border-top: 1px solid #e8e5df;
		border-bottom: 1px solid #e8e5df;
		background: #ffffff;
		color: #1a1a1a;
		text-align: center;
	}
</style>
