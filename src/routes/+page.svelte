<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import {
		Axis,
		Scale,
		Scatter,
		type BulletLegendConfigInterface,
		type XYContainerConfigInterface,
	} from "@unovis/ts";
	import { long2short, palette, short2img, short2long, YEARS } from "$lib/constants";
	import { getMovement, topK } from "$lib/data";
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
	import { onMount } from "svelte";
	import type { FlatRecord } from "$lib/types";
	import type { PageData } from "./$types";
	import Export from "$lib/components/Export.svelte";

	let { data }: { data: PageData } = $props();
	const initialState = (() => ({
		year: data.year,
		lag: data.lag,
		hiddenUniversities: new Set(data.hiddenUniversities),
	}))();

	let selectedYr = $state(initialState.year);
	let selectedLag = $state(initialState.lag);
	const DEGREE_LABEL_THRESHOLD = 12;
	const DEGREE_LABEL_MAX_LENGTH = 24;
	const HOVER_DISTANCE_THRESHOLD_PX = 28;
	const HOVER_NEIGHBOR_COUNT = 3;
	const MIN_YEAR = Math.min(...YEARS);
	const maxLag = $derived(Math.max(1, selectedYr - MIN_YEAR));
	const canDecreaseLag = $derived(selectedLag > 1);
	const canIncreaseLag = $derived(selectedLag < maxLag);
	let hiddenUniversities: Set<string> = $state(initialState.hiddenUniversities);
	let scatterComponent: Scatter<FlatRecord> | undefined;
	let chartFrame: { left: number; top: number; width: number; height: number } | null = $state(null);
	let hoveredDatum: FlatRecord | null = $state(null);
	let hoveredPoint: { x: number; y: number } | null = $state(null);
	let hoveredNeighbors: FlatRecord[] = $state([]);
	const topRows = $derived(topK(selectedYr));
	const movement = $derived(getMovement(selectedYr, 5, 5, selectedLag));
	const institutions = $derived([...new Set(topRows.map((d) => d.university))].sort());
	const colorScale = $derived(Scale.scaleOrdinal(palette).domain(institutions));
	const salaryRows = $derived(
		topRows.filter(
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
	const defaultLabeledRows = $derived.by(() => getDefaultLabeledRows(filteredSalaryRows));

	function clampYear(year: number) {
		return Math.min(Math.max(year, YEARS[0]), YEARS[YEARS.length - 1]);
	}

	function clampLag(year: number, lag: number) {
		const maxAllowedLag = Math.max(1, year - MIN_YEAR);
		return Math.min(Math.max(lag, 1), maxAllowedLag);
	}

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

	function syncUrl(
		year: number,
		hidden: Set<string>,
		lag: number,
		mode: "push" | "replace" = "push"
	) {
		if (!browser) return;

		const url = buildUrl(year, hidden, lag);
		if (mode === "replace") {
			window.history.replaceState(window.history.state, "", url);
			return;
		}

		window.history.pushState(window.history.state, "", url);
	}

	function applyState(
		nextYear: number,
		nextLag: number = selectedLag,
		nextHidden: Set<string> = hiddenUniversities
	) {
		selectedYr = clampYear(nextYear);
		selectedLag = clampLag(selectedYr, nextLag);
		hiddenUniversities = new Set(nextHidden);
	}

	function readStateFromLocation() {
		if (!browser) {
			return {
				year: data.year,
				lag: data.lag,
				hidden: new Set(data.hiddenUniversities),
			};
		}

		const params = new URLSearchParams(window.location.search);
		const year = clampYear(Number(params.get("year")) || data.year);
		const hiddenParam = params.get("hide") ?? "";
		const hidden = hiddenParam
			? new Set(
				hiddenParam
					.split(",")
					.map((s) => short2long[s.trim()])
					.filter(Boolean)
				)
			: new Set<string>();

		return {
			year,
			lag: clampLag(year, Number(params.get("lag")) || 1),
			hidden,
		};
	}

	function setYear(nextYear: number) {
		applyState(nextYear, selectedLag);
		syncUrl(selectedYr, hiddenUniversities, selectedLag);
	}

	function setLag(nextLag: number) {
		applyState(selectedYr, nextLag);
		syncUrl(selectedYr, hiddenUniversities, selectedLag);
	}

	function toggleUniversity(university: string) {
		const next = new Set(hiddenUniversities);
		if (next.has(university)) {
			next.delete(university);
		} else {
			next.add(university);
		}

		applyState(selectedYr, selectedLag, next);
		syncUrl(selectedYr, next, selectedLag, "replace");
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
		onLegendItemClick: (_d, i) => {
			const uni = institutions[i];
			if (uni) toggleUniversity(uni);
		},
	}));

	const table = new TableHandler<FlatRecord>([], { rowsPerPage: 15 });

	const filteredTop = $derived(
		hiddenUniversities.size === 0
			? topRows
			: topRows.filter((d) => !hiddenUniversities.has(d.university))
	);
	const filteredBest = $derived(
		hiddenUniversities.size === 0
			? movement.best
			: movement.best.filter((d) => !hiddenUniversities.has(d.university))
	);
	const filteredWorst = $derived(
		hiddenUniversities.size === 0
			? movement.worst
			: movement.worst.filter((d) => !hiddenUniversities.has(d.university))
	);

	$effect(() => {
		table.setRows(filteredTop);
	});

	$effect(() => {
		filteredSalaryRows;
		clearScatterHover();
	});

	function handleLagChange(delta: number) {
		const next = Math.min(Math.max(selectedLag + delta, 1), maxLag);
		if (next !== selectedLag) {
			setLag(next);
		}
	}

	function truncateDegreeLabel(value: string, maxLength: number = DEGREE_LABEL_MAX_LENGTH) {
		if (value.length <= maxLength) return value;
		return `${value.slice(0, maxLength - 3).trimEnd()}...`;
	}

	function getUniversityShort(university: string) {
		return long2short[university] ?? university;
	}

	function getUniversityLogo(university: string) {
		return short2img[getUniversityShort(university)];
	}

	function dedupeRows(rows: FlatRecord[]) {
		const seen = new Set<string>();
		return rows.filter((row) => {
			if (seen.has(row.slug)) return false;
			seen.add(row.slug);
			return true;
		});
	}

	function getDefaultLabeledRows(rows: FlatRecord[]) {
		if (rows.length <= DEGREE_LABEL_THRESHOLD) return rows;

		const byIncome = [...rows].sort((a, b) => x(a) - x(b));
		const byEmployment = [...rows].sort((a, b) => y(a) - y(b));
		const incomeMin = x(byIncome[0]);
		const incomeMax = x(byIncome[byIncome.length - 1]);
		const employmentMin = y(byEmployment[0]);
		const employmentMax = y(byEmployment[byEmployment.length - 1]);
		const bestOverall = [...rows].sort((a, b) =>
			getEdgeScore(b, incomeMin, incomeMax, employmentMin, employmentMax) -
			getEdgeScore(a, incomeMin, incomeMax, employmentMin, employmentMax)
		)[0];

		return dedupeRows([
			byIncome[0],
			byIncome[byIncome.length - 1],
			byEmployment[0],
			byEmployment[byEmployment.length - 1],
			bestOverall,
		].filter(Boolean) as FlatRecord[]);
	}

	function getEdgeScore(
		row: FlatRecord,
		incomeMin: number,
		incomeMax: number,
		employmentMin: number,
		employmentMax: number
	) {
		const incomeRange = incomeMax - incomeMin;
		const employmentRange = employmentMax - employmentMin;
		const incomeScore = incomeRange === 0 ? 0 : (x(row) - incomeMin) / incomeRange;
		const employmentScore = employmentRange === 0 ? 0 : (y(row) - employmentMin) / employmentRange;
		return incomeScore + employmentScore;
	}

	function getPlotPoint(row: FlatRecord) {
		if (!scatterComponent) return null;
		return {
			x: scatterComponent.xScale(x(row)),
			y: scatterComponent.yScale(y(row)),
		};
	}

	function getScreenPoint(row: FlatRecord) {
		if (!chartFrame) return null;
		const point = getPlotPoint(row);
		if (!point) return null;
		return {
			x: chartFrame.left + point.x,
			y: chartFrame.top + point.y,
		};
	}

	function getNearestDatum(localX: number, localY: number) {
		let best:
			| { row: FlatRecord; point: { x: number; y: number }; distanceSq: number }
			| null = null;

		for (const row of filteredSalaryRows) {
			const point = getPlotPoint(row);
			if (!point) continue;
			const dx = localX - point.x;
			const dy = localY - point.y;
			const distanceSq = dx * dx + dy * dy;

			if (!best || distanceSq < best.distanceSq) {
				best = { row, point, distanceSq };
			}
		}

		if (!best || best.distanceSq > HOVER_DISTANCE_THRESHOLD_PX * HOVER_DISTANCE_THRESHOLD_PX) {
			return null;
		}

		return best;
	}

	function getNeighbors(row: FlatRecord) {
		const sourcePoint = getPlotPoint(row);
		if (!sourcePoint) return [];

		return filteredSalaryRows
			.filter((candidate) => candidate.slug !== row.slug)
			.map((candidate) => {
				const point = getPlotPoint(candidate);
				if (!point) return null;
				const dx = sourcePoint.x - point.x;
				const dy = sourcePoint.y - point.y;
				return { row: candidate, distanceSq: dx * dx + dy * dy };
			})
			.filter(
				(
					entry
				): entry is {
					row: FlatRecord;
					distanceSq: number;
				} => entry !== null
			)
			.sort((a, b) => a.distanceSq - b.distanceSq)
			.slice(0, HOVER_NEIGHBOR_COUNT)
			.map((entry) => entry.row);
	}

	function clearScatterHover() {
		hoveredDatum = null;
		hoveredPoint = null;
		hoveredNeighbors = [];
	}

	function handleScatterPointerMove(event: MouseEvent) {
		if (!chartFrame || !scatterComponent) return;

		const rect = event.currentTarget instanceof HTMLElement
			? event.currentTarget.getBoundingClientRect()
			: null;
		if (!rect) return;

		const localX = event.clientX - rect.left;
		const localY = event.clientY - rect.top;
		const nearest = getNearestDatum(localX, localY);

		if (!nearest) {
			clearScatterHover();
			return;
		}

		hoveredDatum = nearest.row;
		hoveredPoint = {
			x: chartFrame.left + nearest.point.x,
			y: chartFrame.top + nearest.point.y,
		};
		hoveredNeighbors = getNeighbors(nearest.row);
	}

	function handleScatterClick() {
		if (hoveredDatum) goto(`degree/${hoveredDatum.slug}`);
	}

	function handleScatterKeydown(event: KeyboardEvent) {
		if (!hoveredDatum) return;
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		handleScatterClick();
	}

	function getScatterLabelClass(row: FlatRecord) {
		if (!chartFrame) return "scatter-label-right";
		const point = getScreenPoint(row);
		return point && point.x > chartFrame.left + chartFrame.width * 0.62
			? "scatter-label-left"
			: "scatter-label-right";
	}

	function getHoverCardStyle() {
		if (!chartFrame || !hoveredPoint) return "";
		const placeLeft = hoveredPoint.x > chartFrame.left + chartFrame.width * 0.58;
		const left = placeLeft
			? chartFrame.left + 12
			: Math.max(chartFrame.left + chartFrame.width - 252, chartFrame.left + 12);
		return `left:${left}px; top:${chartFrame.top + 12}px;`;
	}

	function getScatterComponent() {
		if (!scatterComponent) {
			scatterComponent = new Scatter<FlatRecord>({
				cursor: "pointer",
				size: 8,
				x,
				y,
				color,
				id: (d) => d.slug,
			});
			scatterComponent.clippable = false;
		}

		return scatterComponent;
	}

	const getScatterChartConfig = $derived.by<
		() => XYContainerConfigInterface<FlatRecord>
	>(() => () => {
		const scatter = getScatterComponent();

		return {
			height: 380,
			components: [scatter],
			xAxis: new Axis<FlatRecord>({
				label: "Median Gross Income ($)",
				gridLine: true,
			}),
			yAxis: new Axis<FlatRecord>({
				label: "Overall Employment Rate (%)",
				gridLine: true,
			}),
			onRenderComplete: (_svg, margin, _bleed, _containerWidth, _containerHeight, width, height) => {
				const frameWidth = width ?? 0;
				const frameHeight = height ?? 0;
				chartFrame = {
					left: margin.left ?? 0,
					top: margin.top ?? 0,
					width: frameWidth,
					height: frameHeight,
				};
			},
		};
	});

	function handleYearChange() {
		setYear(selectedYr);
	}

	function formatCurrency(value: number | null) {
		return value == null ? "—" : `$${value.toLocaleString()}`;
	}

	onMount(() => {
		const state = readStateFromLocation();
		applyState(state.year, state.lag, state.hidden);

		function handlePopState() {
			const nextState = readStateFromLocation();
			applyState(nextState.year, nextState.lag, nextState.hidden);
		}

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	});
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
		<UnovisXYChart
			data={filteredSalaryRows}
			getConfig={getScatterChartConfig}
			overlay={betterOverlay}
			height={380}
			duration={550}
		/>
		{#if chartFrame}
			<div class="scatter-overlay">
				{#if !hoveredDatum}
					{#each defaultLabeledRows as row}
						{@const point = getScreenPoint(row)}
						{#if point}
							<div
								class={`scatter-degree-label ${getScatterLabelClass(row)}`}
								style={`left:${point.x}px; top:${point.y}px; border-color:${color(row)}22;`}
							>
								<span>{truncateDegreeLabel(row.degree)}</span>
							</div>
						{/if}
					{/each}
				{/if}

				{#if hoveredDatum && hoveredPoint}
					{@const hoveredShort = getUniversityShort(hoveredDatum.university)}
					{@const hoveredLogo = getUniversityLogo(hoveredDatum.university)}
					<div
						class="scatter-hover-line scatter-hover-line-x"
						style={`left:${hoveredPoint.x}px; top:${chartFrame.top}px; height:${chartFrame.height}px;`}
					></div>
					<div
						class="scatter-hover-line scatter-hover-line-y"
						style={`left:${chartFrame.left}px; top:${hoveredPoint.y}px; width:${chartFrame.width}px;`}
					></div>
					<div
						class="scatter-hover-ring"
						style={`left:${hoveredPoint.x}px; top:${hoveredPoint.y}px; border-color:${color(hoveredDatum)}; box-shadow: 0 0 0 4px ${color(hoveredDatum)}22;`}
					></div>
					<div class="scatter-hover-card" style={getHoverCardStyle()}>
						<div class="scatter-hover-title">{hoveredDatum.degree}</div>
						<div class="scatter-hover-meta">
							<span class="scatter-hover-brand">
								{#if hoveredLogo}
									<span class="scatter-hover-logo-shell">
										<img class="scatter-hover-logo" src={hoveredLogo} alt={`${hoveredShort} logo`} />
									</span>
								{/if}
								<span class="scatter-hover-brand-name">{hoveredShort}</span>
							</span>
							<span>{hoveredDatum.employment_rate_overall}% employed overall</span>
						</div>
						<div class="scatter-hover-band">
							<span class="scatter-hover-band-label">P25</span>
							<div class="scatter-hover-band-bar"></div>
							<span class="scatter-hover-band-label scatter-hover-band-label-right">P75</span>
							<span class="scatter-hover-band-value">{formatCurrency(hoveredDatum.gross_mthly_25_percentile)}</span>
							<span class="scatter-hover-band-value scatter-hover-band-value-median">{formatCurrency(hoveredDatum.gross_monthly_median)}</span>
							<span class="scatter-hover-band-value scatter-hover-band-value-right">{formatCurrency(hoveredDatum.gross_mthly_75_percentile)}</span>
						</div>
						{#if hoveredNeighbors.length > 0}
							<div class="scatter-hover-section">Nearby</div>
							<div class="scatter-hover-list">
								{#each hoveredNeighbors as neighbor}
									{@const neighborShort = getUniversityShort(neighbor.university)}
									{@const neighborLogo = getUniversityLogo(neighbor.university)}
									<div class="scatter-hover-row">
										<span class="scatter-hover-row-title">{truncateDegreeLabel(neighbor.degree, 42)}</span>
										<span class="scatter-hover-row-value">
											{#if neighborLogo}
												<img class="scatter-hover-row-logo" src={neighborLogo} alt={`${neighborShort} logo`} />
											{/if}
											<span>{formatCurrency(neighbor.gross_monthly_median)} · {neighbor.employment_rate_overall}%</span>
										</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<button
					type="button"
					class="scatter-hit-area"
					style={`left:${chartFrame.left}px; top:${chartFrame.top}px; width:${chartFrame.width}px; height:${chartFrame.height}px; cursor:${hoveredDatum ? "pointer" : "crosshair"};`}
					aria-label="Inspect nearby degrees in the scatter plot"
					onmousemove={handleScatterPointerMove}
					onmouseleave={clearScatterHover}
					onclick={handleScatterClick}
					onkeydown={handleScatterKeydown}
				></button>
			</div>
		{/if}
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
		<div
			class="carousel-shell"
			aria-label={`Winners over ${selectedLag} years`}
		>
			<div class="carousel-track" data-carousel-track>
				<div class="carousel-set" data-carousel-set="primary">
					{#each filteredBest as record (record.slug)}
						<Sparkline {record} refYear={selectedYr} />
					{/each}
				</div>
				<div class="carousel-set carousel-clone" aria-hidden="true">
					{#each filteredBest as record (record.slug)}
						<Sparkline {record} refYear={selectedYr} />
					{/each}
				</div>
			</div>
		</div>
	{/if}
	{#if filteredWorst.length > 2}
		<div class="flex items-center gap-2">
			<TrendingDown class="h-4 w-4 text-loss" />
			<h2 class="text-sm font-semibold text-ink tracking-tight">Losers {selectedLag}Y</h2>
		</div>
			<div
				class="carousel-shell carousel-shell-slower carousel-shell-reverse"
				aria-label={`Losers over ${selectedLag} years`}
			>
			<div class="carousel-track" data-carousel-track>
				<div class="carousel-set" data-carousel-set="primary">
					{#each filteredWorst as record (record.slug)}
						<Sparkline {record} refYear={selectedYr} />
					{/each}
				</div>
				<div class="carousel-set carousel-clone" aria-hidden="true">
					{#each filteredWorst as record (record.slug)}
						<Sparkline {record} refYear={selectedYr} />
					{/each}
				</div>
			</div>
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
		<Export rows={topRows} fileName={String(selectedYr)} />
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
	.scatter-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.scatter-hit-area {
		position: absolute;
		pointer-events: auto;
		background: transparent;
		border: 0;
		padding: 0;
		margin: 0;
		outline: none;
	}

	.scatter-degree-label {
		position: absolute;
		max-width: 190px;
		padding: 2px 8px;
		border: 1px solid #e8e5df;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 6px 16px rgba(26, 26, 26, 0.08);
		font-size: 11px;
		line-height: 1.2;
		color: #3f3f46;
		white-space: nowrap;
	}

	.scatter-degree-label span {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.scatter-label-right {
		transform: translate(10px, -50%);
	}

	.scatter-label-left {
		transform: translate(calc(-100% - 10px), -50%);
	}

	.scatter-hover-line {
		position: absolute;
		background: rgba(26, 26, 26, 0.18);
	}

	.scatter-hover-line-x {
		width: 1px;
		transform: translateX(-0.5px);
	}

	.scatter-hover-line-y {
		height: 1px;
		transform: translateY(-0.5px);
	}

	.scatter-hover-ring {
		position: absolute;
		width: 14px;
		height: 14px;
		border: 2px solid #1a1a1a;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.92);
		transform: translate(-50%, -50%);
	}

	.scatter-hover-card {
		position: absolute;
		width: 280px;
		max-width: min(280px, calc(100vw - 32px));
		padding: 10px 12px;
		border: 1px solid #e8e5df;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 18px 40px rgba(26, 26, 26, 0.14);
		backdrop-filter: blur(8px);
		color: #1f2937;
		pointer-events: none;
	}

	.scatter-hover-eyebrow,
	.scatter-hover-section,
	.scatter-hover-hint {
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #71717a;
	}

	.scatter-hover-title {
		margin-top: 4px;
		font-size: 13px;
		font-weight: 600;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.scatter-hover-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 6px;
		font-size: 11px;
		color: #52525b;
		overflow-wrap: anywhere;
	}

	.scatter-hover-brand {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: #27272a;
		font-weight: 600;
	}

	.scatter-hover-logo-shell {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		padding: 4px;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
	}

	.scatter-hover-logo {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.scatter-hover-brand-name {
		letter-spacing: 0.01em;
	}

	.scatter-hover-band {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 4px 8px;
		align-items: center;
		margin-top: 10px;
	}

	.scatter-hover-band-label {
		font-size: 10px;
		color: #71717a;
	}

	.scatter-hover-band-label-right {
		text-align: right;
	}

	.scatter-hover-band-bar {
		height: 3px;
		border-radius: 999px;
		background: linear-gradient(90deg, #dc2626 0%, #e5e5e0 50%, #16a34a 100%);
	}

	.scatter-hover-band-value {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10px;
		color: #71717a;
	}

	.scatter-hover-band-value-median {
		font-size: 11px;
		font-weight: 600;
		color: #1f2937;
		text-align: center;
	}

	.scatter-hover-band-value-right {
		text-align: right;
	}

	.scatter-hover-section {
		margin-top: 10px;
	}

	.scatter-hover-list {
		display: grid;
		gap: 6px;
		margin-top: 6px;
	}

	.scatter-hover-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
		font-size: 11px;
	}

	.scatter-hover-row-title {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
		color: #1f2937;
	}

	.scatter-hover-row-value {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10px;
		white-space: nowrap;
		color: #71717a;
	}

	.scatter-hover-row-logo {
		width: 14px;
		height: 14px;
		object-fit: contain;
		flex: 0 0 auto;
	}

	.scatter-hover-hint {
		margin-top: 10px;
	}

	.carousel-shell {
		overflow: hidden;
		padding: 0 4px 4px;
		margin: 0 -4px;
		-webkit-mask-image: linear-gradient(
			90deg,
			transparent 0,
			#000 20px,
			#000 calc(100% - 20px),
			transparent 100%
		);
		mask-image: linear-gradient(
			90deg,
			transparent 0,
			#000 20px,
			#000 calc(100% - 20px),
			transparent 100%
		);
	}

	.carousel-shell::-webkit-scrollbar {
		display: none;
	}

	.carousel-track {
		display: flex;
		width: max-content;
		animation: carousel-marquee 32s linear infinite;
		will-change: transform;
	}

	.carousel-shell-slower .carousel-track {
		animation-duration: 36s;
	}

	.carousel-shell-reverse .carousel-track {
		animation-direction: reverse;
	}

	.carousel-set {
		display: flex;
		flex: none;
		gap: 8px;
		padding-right: 8px;
	}

	.carousel-clone {
		display: flex;
	}

	.carousel-shell:hover .carousel-track,
	.carousel-shell:focus-within .carousel-track {
		animation-play-state: paused;
	}

	@keyframes carousel-marquee {
		from {
			transform: translate3d(0, 0, 0);
		}

		to {
			transform: translate3d(-50%, 0, 0);
		}
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
