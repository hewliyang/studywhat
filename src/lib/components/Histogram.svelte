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
			<stop offset="0%" stop-color="#00AAFF" stop-opacity="1" />
			<stop offset="100%" stop-color="#00AAFF" stop-opacity="0" />
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
				`${(minValue + i * binWidth).toFixed(0)} to ${(minValue + (i + 1) * binWidth).toFixed(0)}`
		);

		return zip(labels, bins);
	});

	const x = (_: HistDatum, i: number) => i;
	const y = (d: HistDatum) => d.freq;
	const tickFormat = (tick: number | Date) =>
		typeof tick === "number" ? histData[tick]?.bin ?? "" : "";

	const getChartConfig = $derived.by<
		() => XYContainerConfigInterface<HistDatum>
	>(() => () => ({
		height: 400,
		svgDefs: SVG_DEFS,
		components: [
			new Area<HistDatum>({ x, y, color: "url(#gradient)", opacity: 0.5 }),
			new Line<HistDatum>({ x, y, color: "#00A0FF" }),
		],
		xAxis: new Axis<HistDatum>({
			label: "Median Gross Income ($)",
			numTicks: containerWidth > 375 ? histData.length : histData.length / 2,
			gridLine: true,
			tickTextWidth: 30,
			tickFormat,
		}),
		yAxis: new Axis<HistDatum>({
			label: "Frequency",
			gridLine: true,
		}),
	}));

</script>

<div bind:clientWidth={containerWidth}>
	{#snippet statsOverlay()}
		<div class="absolute top-4 right-6 p-2 overflow-hidden">
			<table class="text-sm">
				<tbody>
					<tr>
						<td class="font-xs font-semibold pr-3">Median</td>
						<td class="font-mono">{statMedian.toFixed(2)}</td>
					</tr>
					<tr>
						<td class="font-xs font-semibold pr-3">Mean</td>
						<td class="font-mono">{statMean.toFixed(2)}</td>
					</tr>
					<tr>
						<td class="font-xs font-semibold pr-3">Std Dev</td>
						<td class="font-mono">{statStd.toFixed(2)}</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/snippet}

	<UnovisXYChart data={histData} getConfig={getChartConfig} overlay={statsOverlay} />
</div>
