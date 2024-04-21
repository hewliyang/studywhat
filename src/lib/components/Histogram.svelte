<script lang="ts">
	import type { FlatRecord } from "$lib/types";
	import { zip, mean, variance, median, type HistDatum } from "$lib/stats";
	import { VisXYContainer, VisLine, VisAxis, VisArea } from "@unovis/svelte";

	export let data: FlatRecord[];

	let bins: number[];
	let containerWidth: number;

	const NUM_BINS = 10;
	const SVG_DEFS = `
	<linearGradient id="gradient" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="#00AAFF" stop-opacity="1" />
			<stop offset="100%" stop-color="#00AAFF" stop-opacity="0" />
	</linearGradient>
	`;

	$: medians = [...data.map((d) => d.gross_monthly_median)];
	$: minValue = Math.min(...medians);
	$: maxValue = Math.max(...medians);
	$: binWidth = (maxValue - minValue) / NUM_BINS;

	$: statMean = mean(medians);
	$: statStd = Math.sqrt(variance(medians));
	$: statMedian = median(medians);

	$: {
		bins = Array(NUM_BINS).fill(0); // reactivity bug if seperate
		medians.forEach((value) => {
			const binIdx = Math.floor((value - minValue) / binWidth);
			bins[binIdx - 1]++;
		});
	}

	$: labels = bins.map(
		(_, i) =>
			`${(minValue + i * binWidth).toFixed(0)} to ${(minValue + (i + 1) * binWidth).toFixed(0)}`
	);

	$: histData = zip(labels, bins);
	$: x = (_: HistDatum, i: number) => i;
	$: y = (d: HistDatum) => d.freq;
	$: tickFormat = (tick: number) => histData[tick].bin;
</script>

<div bind:clientWidth={containerWidth}>
	<VisXYContainer data={histData} height={400} svgDefs={SVG_DEFS}>
		<!-- <VisStackedBar {x} {y} barMinHeight1Px={true} barPadding={0} /> -->
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
		<VisArea {x} {y} color="url(#gradient)" opacity="0.5" />
		<VisLine {x} {y} color="#00A0FF" />
		<VisAxis
			type="x"
			label="Median Gross Income ($)"
			numTicks={containerWidth > 375 ? histData.length : histData.length / 2}
			gridLine={true}
			tickTextWidth={30}
			{tickFormat}
		/>
		<VisAxis type="y" label="Frequency" gridLine={true} />
	</VisXYContainer>
</div>
