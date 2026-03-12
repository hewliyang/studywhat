<script lang="ts">
	import {
		Area,
		Axis,
		Line,
		type XYContainerConfigInterface,
	} from "@unovis/ts";
	import type { FlatRecord } from "$lib/types";
	import { zip, mean, variance, median, type HistDatum } from "$lib/stats";
	import UnovisXYChart from "$lib/components/charts/UnovisXYChart.svelte";

	let { data }: { data: FlatRecord[] } = $props();
	let containerWidth = $state(0);

	const NUM_BINS = 10;
	const SVG_DEFS = `
	<linearGradient id="gradient" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="#2563eb" stop-opacity="0.4" />
			<stop offset="100%" stop-color="#2563eb" stop-opacity="0.02" />
	</linearGradient>
	`;

	const medians = $derived.by(() => {
		const values = data
			.map((d) => d.gross_monthly_median)
			.filter((value): value is number => value != null);
		return values.length > 0 ? values : [0];
	});
	const minValue = $derived(Math.min(...medians));
	const maxValue = $derived(Math.max(...medians));
	const binWidth = $derived(
		maxValue === minValue ? 1 : (maxValue - minValue) / NUM_BINS
	);

	const statMean = $derived(mean(medians));
	const statStd = $derived(Math.sqrt(variance(medians)));
	const statMedian = $derived(median(medians));

	const histData = $derived.by(() => {
		const bins = Array(NUM_BINS).fill(0);

		for (const value of medians) {
			const rawBin = Math.floor((value - minValue) / binWidth);
			const binIdx = Math.min(NUM_BINS - 1, Math.max(0, rawBin));
			bins[binIdx] += 1;
		}

		const labels = bins.map(
			(_, i) =>
				`$${((minValue + i * binWidth + minValue + (i + 1) * binWidth) / 2).toFixed(0)}`
		);

		return zip(labels, bins);
	});

	const x = (_: HistDatum, i: number) => i;
	const y = (d: HistDatum) => d.freq;
	const tickFormat = (tick: number | Date) =>
		typeof tick === "number" ? histData[tick]?.bin ?? "" : "";
	const tickCount = $derived(
		containerWidth > 500 ? histData.length : Math.max(1, Math.floor(histData.length / 2))
	);

	let areaComponent: Area<HistDatum> | undefined;
	let lineComponent: Line<HistDatum> | undefined;

	function getAreaComponent() {
		if (!areaComponent) {
			areaComponent = new Area<HistDatum>({ x, y, color: "url(#gradient)", opacity: 0.8 });
			areaComponent.clippable = false;
		}

		return areaComponent;
	}

	function getLineComponent() {
		if (!lineComponent) {
			lineComponent = new Line<HistDatum>({ x, y, color: "#2563eb" });
			lineComponent.clippable = false;
		}

		return lineComponent;
	}

	const getChartConfig = $derived.by<
		() => XYContainerConfigInterface<HistDatum>
	>(() => () => {
		return {
			height: 220,
			svgDefs: SVG_DEFS,
			components: [getAreaComponent(), getLineComponent()],
			xAxis: new Axis<HistDatum>({
				label: "Median Gross Income",
				numTicks: tickCount,
				gridLine: false,
				tickTextWidth: 40,
				tickFormat,
			}),
			yAxis: new Axis<HistDatum>({
				label: "Frequency",
				gridLine: true,
			}),
		};
	});
</script>

<div bind:clientWidth={containerWidth}>
	{#snippet statsOverlay()}
		<div class="absolute top-3 right-4">
			<div class="text-[10px] space-y-0.5 bg-surface/80 backdrop-blur-sm rounded px-2 py-1.5 border border-border">
				<div class="flex justify-between gap-4">
					<span class="text-muted">Median</span>
					<span class="font-mono font-medium">${statMedian.toLocaleString()}</span>
				</div>
				<div class="flex justify-between gap-4">
					<span class="text-muted">Mean</span>
					<span class="font-mono font-medium">${statMean.toLocaleString()}</span>
				</div>
				<div class="flex justify-between gap-4">
					<span class="text-muted">Std Dev</span>
					<span class="font-mono font-medium">${statStd.toFixed(0)}</span>
				</div>
			</div>
		</div>
	{/snippet}

	<UnovisXYChart
		data={histData}
		getConfig={getChartConfig}
		overlay={statsOverlay}
		height={220}
		duration={400}
	/>
</div>
