<script lang="ts">
	import { goto } from "$app/navigation";
	import {
		Axis,
		Scale,
		Scatter,
		Tooltip,
		type BulletLegendConfigInterface,
		type XYContainerConfigInterface,
	} from "@unovis/ts";
	import { long2short, palette, YEARS } from "$lib/constants";
	import {
		TableHandler,
		Datatable,
		Pagination,
		RowCount,
		ThFilter,
		ThSort,
	} from "@vincjo/datatables";
	import Sparkline from "$lib/components/Sparkline.svelte";
	import Histogram from "$lib/components/Histogram.svelte";
	import UnovisLegend from "$lib/components/charts/UnovisLegend.svelte";
	import UnovisXYChart from "$lib/components/charts/UnovisXYChart.svelte";
	import {
		Activity,
		ArrowUpRight,
		Minus,
		Plus,
		TrendingUp,
		TrendingDown,
	} from "lucide-svelte";
	import type { FlatRecord } from "$lib/types";
	import type { PageData } from "./$types";
	import Export from "$lib/components/Export.svelte";

	let { data }: { data: PageData } = $props();

	let selectedYr = $state(0);
	let selectedLag = $state(1);
	const maxLag = $derived(Math.max(1, selectedYr - Math.min(...YEARS)));
	const canDecreaseLag = $derived(selectedLag > 1);
	const canIncreaseLag = $derived(selectedLag < maxLag);
	let hiddenUniversities: Set<string> = $state(new Set());
	const institutions = $derived([...new Set(data.top.map((d) => d.university))].sort());
	const colorScale = $derived(Scale.scaleOrdinal(palette).domain(institutions));
	const salaryRows = $derived(
		data.top.filter(
			(d) =>
				d.gross_monthly_median != null &&
				d.gross_mthly_25_percentile != null &&
				d.gross_mthly_75_percentile != null
		)
	);
	const filteredSalaryRows = $derived(
		hiddenUniversities.size === 0
			? salaryRows
			: salaryRows.filter((d) => !hiddenUniversities.has(d.university))
	);

	function buildUrl(year: number, hidden: Set<string>, lag: number = selectedLag) {
		const params = new URLSearchParams();
		params.set("year", String(year));
		if (lag > 1) params.set("lag", String(lag));
		if (hidden.size > 0) {
			const shortNames = [...hidden].map((u) => long2short[u]).filter(Boolean).sort();
			params.set("hide", shortNames.join(","));
		}
		return `/?${params.toString()}`;
	}

	function toggleUniversity(university: string) {
		const next = new Set(hiddenUniversities);
		if (next.has(university)) {
			next.delete(university);
		} else {
			next.add(university);
		}
		hiddenUniversities = next;
		goto(buildUrl(selectedYr, next), { replaceState: true, noScroll: true });
	}

	const y = (d: FlatRecord) => d.employment_rate_overall;
	const x = (d: FlatRecord) => d.gross_monthly_median ?? 0;
	const color = (d: FlatRecord) => colorScale(d.university);
	const legendItems = $derived(institutions.map((v) => ({
		name: long2short[v] || v,
		color: colorScale(v),
		inactive: hiddenUniversities.has(v),
		pointer: true,
	})));
	const legendConfig = $derived.by<BulletLegendConfigInterface>(() => ({
		items: legendItems,
		onLegendItemClick: (d, i) => {
			const uni = institutions[i];
			if (uni) toggleUniversity(uni);
		},
	}));
	const triggers = {
		[Scatter.selectors.point]: (d: FlatRecord) => `
			<div style="font-family: 'Outfit', sans-serif; padding: 4px 2px;">
				<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
					<span style="font-weight: 600; font-size: 13px;">${long2short[d.university]}</span>
					<span style="padding: 1px 6px; background: #f0efe9; border-radius: 3px; font-size: 10px; color: #71717a;">${d.degree}</span>
				</div>
				<div style="display: grid; grid-template-columns: auto 1fr auto; gap: 4px 8px; align-items: center; font-size: 11px;">
					<span style="color: #71717a;">P25</span>
					<div style="height: 3px; border-radius: 2px; background: linear-gradient(90deg, #dc2626 0%, #e5e5e0 50%, #16a34a 100%);"></div>
					<span style="color: #71717a;">P75</span>
					<span style="font-family: 'JetBrains Mono', monospace; font-size: 10px;">${formatCurrency(d.gross_mthly_25_percentile)}</span>
					<span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; text-align: center;">${formatCurrency(d.gross_monthly_median)}</span>
					<span style="font-family: 'JetBrains Mono', monospace; font-size: 10px;">${formatCurrency(d.gross_mthly_75_percentile)}</span>
				</div>
			</div>
		`,
	};
	const events = {
		[Scatter.selectors.point]: {
			click: (d: FlatRecord) => {
				goto(`degree/${d.slug}`);
			},
		},
	};

	// data table
	const table = new TableHandler<FlatRecord>([], { rowsPerPage: 15 });

	const filteredTop = $derived(
		hiddenUniversities.size === 0
			? data.top
			: data.top.filter((d) => !hiddenUniversities.has(d.university))
	);
	const filteredBest = $derived(
		hiddenUniversities.size === 0
			? data.gainAndLoss.best
			: data.gainAndLoss.best.filter((d) => !hiddenUniversities.has(d.university))
	);
	const filteredWorst = $derived(
		hiddenUniversities.size === 0
			? data.gainAndLoss.worst
			: data.gainAndLoss.worst.filter((d) => !hiddenUniversities.has(d.university))
	);

	$effect(() => {
		selectedYr = data.year;
		selectedLag = data.lag;
		hiddenUniversities = new Set(data.hiddenUniversities);
	});

	$effect(() => {
		table.setRows(filteredTop);
	});

	function handleLagChange(delta: number) {
		const next = Math.min(Math.max(selectedLag + delta, 1), maxLag);
		if (next !== selectedLag) {
			goto(buildUrl(selectedYr, hiddenUniversities, next), { keepFocus: true });
		}
	}

	const getScatterChartConfig = $derived.by<
		() => XYContainerConfigInterface<FlatRecord>
	>(() => () => ({
		height: 380,
		components: [new Scatter<FlatRecord>({ cursor: "pointer", size: 8, x, y, color, events })],
		xAxis: new Axis<FlatRecord>({
			label: "Median Gross Income ($)",
			gridLine: true,
		}),
		yAxis: new Axis<FlatRecord>({
			label: "Employment Rate (%)",
			gridLine: true,
		}),
		tooltip: new Tooltip({ triggers }),
	}));

	function handleYearChange() {
		goto(buildUrl(selectedYr, hiddenUniversities));
	}

	function formatCurrency(value: number | null) {
		return value == null ? "—" : `$${value.toLocaleString()}`;
	}
</script>

<!-- Global Controls -->
<section class="space-y-3">
	<div class="flex items-center justify-between flex-wrap gap-2">
		<h2 class="text-sm font-semibold text-ink tracking-tight">Income × Employment</h2>
		<div class="flex items-center gap-3">
			<UnovisLegend config={legendConfig} />
			<div class="flex items-center">
				<button
					class="stepper-btn stepper-btn-left"
					disabled={selectedYr <= YEARS[0]}
					onclick={() => { selectedYr = Math.max(selectedYr - 1, YEARS[0]); handleYearChange(); }}
					aria-label="Previous year"
				>
					<Minus class="h-3 w-3" />
				</button>
				<select
					name="year"
					bind:value={selectedYr}
					onchange={handleYearChange}
					class="year-select"
				>
					{#each YEARS as year}
						<option value={year} selected={year === selectedYr}>{year}</option>
					{/each}
				</select>
				<button
					class="stepper-btn stepper-btn-right"
					disabled={selectedYr >= YEARS[YEARS.length - 1]}
					onclick={() => { selectedYr = Math.min(selectedYr + 1, YEARS[YEARS.length - 1]); handleYearChange(); }}
					aria-label="Next year"
				>
					<Plus class="h-3 w-3" />
				</button>
			</div>
		</div>
	</div>

	<!-- Scatter Plot -->
	<div class="relative">
		{#snippet betterOverlay()}
			<div class="absolute bottom-10 right-4">
				<div class="flex items-center gap-1 text-muted text-[10px] font-mono">
					<ArrowUpRight class="h-3 w-3" />
					<span>better</span>
				</div>
			</div>
		{/snippet}
		<UnovisXYChart data={filteredSalaryRows} getConfig={getScatterChartConfig} overlay={betterOverlay} height={380} />
	</div>
</section>

<!-- Winners / Losers -->
{#if filteredBest.length > 0 || filteredWorst.length > 0}
<section class="space-y-4">
	{#if filteredBest.length > 2}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<TrendingUp class="h-4 w-4 text-gain" />
				<h2 class="text-sm font-semibold text-ink tracking-tight">Winners {selectedLag}Y</h2>
				<div class="flex items-center">
					<button
						class="stepper-btn stepper-btn-left"
						disabled={!canDecreaseLag}
						onclick={() => handleLagChange(-1)}
						aria-label="Decrease lag"
					>
						<Minus class="h-3 w-3" />
					</button>
					<button
						class="stepper-btn stepper-btn-right"
						disabled={!canIncreaseLag}
						onclick={() => handleLagChange(1)}
						aria-label="Increase lag"
					>
						<Plus class="h-3 w-3" />
					</button>
				</div>
			</div>
			<a
				class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted border border-border rounded-md hover:border-border-dark hover:text-ink transition-all"
				href={`/movement/?year=${selectedYr}&lag=${selectedLag}`}
			>
				Movement
				<Activity class="h-3 w-3" />
			</a>
		</div>
		<div class="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1">
			{#each filteredBest as record}
				<Sparkline {record} refYear={selectedYr} />
			{/each}
		</div>
	{/if}
	{#if filteredWorst.length > 2}
		<div class="flex items-center gap-2">
			<TrendingDown class="h-4 w-4 text-loss" />
			<h2 class="text-sm font-semibold text-ink tracking-tight">Losers {selectedLag}Y</h2>
		</div>
		<div class="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1">
			{#each filteredWorst as record}
				<Sparkline {record} refYear={selectedYr} />
			{/each}
		</div>
	{/if}
</section>
{/if}

<!-- Distribution -->
<section class="space-y-3">
	<div>
		<h2 class="text-sm font-semibold text-ink tracking-tight">Income Distribution</h2>
		<p class="text-[11px] text-muted mt-0.5">Frequency by degree programme, not individual graduates</p>
	</div>
	<Histogram data={filteredSalaryRows} />
</section>

<!-- Data Table -->
<section class="space-y-3">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-semibold text-ink tracking-tight">All Degrees</h2>
		<Export rows={data.top} fileName={String(selectedYr)} />
	</div>
	<div class="data-table-wrap">
		<Datatable {table}>
			<table>
				<thead>
					<tr>
						<ThSort {table} field={(row) => long2short[row.university]}>Uni</ThSort>
						<ThSort {table} field="degree">Degree</ThSort>
						<ThSort {table} field="gross_monthly_median">Median</ThSort>
						<ThSort {table} field="gross_mthly_25_percentile">P25</ThSort>
						<ThSort {table} field="gross_mthly_75_percentile">P75</ThSort>
						<ThSort {table} field="employment_rate_overall">Empl.</ThSort>
					</tr>
					<tr class="filter-row">
						<ThFilter {table} field={(row) => long2short[row.university]} />
						<ThFilter {table} field="degree" />
						<td></td><td></td><td></td><td></td>
					</tr>
				</thead>
				<tbody>
					{#each table.rows as row}
						<tr>
							<td class="uni-cell">{long2short[row.university]}</td>
							<td class="degree-cell">
								<a href="/degree/{row.slug}">{row.degree}</a>
							</td>
							<td class="num-cell">{formatCurrency(row.gross_monthly_median)}</td>
							<td class="num-cell dim">{formatCurrency(row.gross_mthly_25_percentile)}</td>
							<td class="num-cell dim">{formatCurrency(row.gross_mthly_75_percentile)}</td>
							<td class="num-cell">{row.employment_rate_overall}%</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Datatable>
		<nav class="table-footer">
			<RowCount {table} />
			<Pagination {table} />
		</nav>
	</div>
</section>

<style>
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

	thead tr:first-child {
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
		text-align: left;
		white-space: nowrap;
		background: #FAFAF7;
	}

	.filter-row {
		border-bottom: 1px solid #e8e5df;
	}

	.filter-row :global(th),
	.filter-row td {
		padding: 4px 12px 6px;
		background: #FAFAF7;
	}

	.filter-row :global(input) {
		width: 100%;
		font-size: 11px;
		padding: 3px 6px;
		border: 1px solid #e8e5df;
		border-radius: 4px;
		background: #ffffff;
		font-family: inherit;
	}

	.filter-row :global(input:focus) {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb;
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
		padding: 7px 12px;
	}

	.uni-cell {
		font-weight: 500;
		font-size: 11px;
		white-space: nowrap;
		color: #71717a;
	}

	.degree-cell {
		max-width: 260px;
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

	.num-cell {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		text-align: right;
		white-space: nowrap;
	}

	.num-cell.dim {
		color: #a1a19a;
	}

	.table-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		border-top: 1px solid #e8e5df;
		font-size: 10px;
		color: #71717a;
	}

	.table-footer :global(button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 7px;
		height: 22px;
		line-height: 1;
		border: 1px solid #e8e5df;
		border-radius: 4px;
		background: #ffffff;
		color: #71717a;
		font-size: 10px;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.15s;
	}

	.table-footer :global(button:hover:not(:disabled)) {
		border-color: #d4d3cd;
		color: #1a1a1a;
		background: #f5f4f0;
	}

	.table-footer :global(button:disabled) {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.table-footer :global(button.active) {
		background: #1a1a1a;
		color: #ffffff;
		border-color: #1a1a1a;
	}

	.stepper-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 26px;
		border: 1px solid #e8e5df;
		background: #ffffff;
		color: #71717a;
		cursor: pointer;
		transition: all 0.15s;
	}

	.stepper-btn-left {
		border-radius: 5px 0 0 5px;
	}

	.stepper-btn-right {
		border-radius: 0 5px 5px 0;
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

	.year-select {
		font-size: 12px;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		padding: 3px 6px;
		height: 26px;
		border-top: 1px solid #e8e5df;
		border-bottom: 1px solid #e8e5df;
		border-left: none;
		border-right: none;
		background: #ffffff;
		color: #1a1a1a;
		appearance: none;
		text-align: center;
		min-width: 52px;
	}

	.year-select:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb;
	}
</style>
