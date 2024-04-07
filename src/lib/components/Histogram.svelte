<script lang="ts">
	import type { FlatRecord } from "$lib/types";
	import { zip, type HistDatum } from "$lib/stats";
	import {
		VisXYContainer,
		VisLine,
		VisAxis,
		VisStackedBar,
	} from "@unovis/svelte";

	export let data: FlatRecord[];

	let bins: number[];
	let containerWidth: number;

	const NUM_BINS = 10;

	$: medians = [...data.map((d) => d.gross_monthly_median)];
	$: minValue = Math.min(...medians);
	$: maxValue = Math.max(...medians);
	$: binWidth = (maxValue - minValue) / NUM_BINS;

	$: {
		bins = Array(NUM_BINS).fill(0); // reactivity bug if seperate
		medians.forEach((value) => {
			const binIdx = Math.floor((value - minValue) / binWidth);
			bins[binIdx - 1]++;
		});
	}

	$: labels = bins.map(
		(_, i) =>
			`${(minValue + i * binWidth).toFixed(0)} ⇔ ${(minValue + (i + 1) * binWidth).toFixed(0)}`
	);

	$: histData = zip(labels, bins);
	$: x = (d: HistDatum, i: number) => i;
	$: y = (d: HistDatum) => d.freq;
	$: tickFormat = (tick: number) => histData[tick].bin;
</script>

<div bind:clientWidth={containerWidth}>
	<VisXYContainer data={histData} height={400}>
		<VisStackedBar {x} {y} barMinHeight1Px={true} barPadding={-0.1} />
		<VisLine {x} {y} color="orange" />
		<VisAxis
			type="x"
			label="Median Gross Income ($)"
			numTicks={containerWidth > 375 ? histData.length : histData.length / 2}
			gridLine={false}
			tickTextWidth={30}
			{tickFormat}
		/>
		<VisAxis type="y" label="Frequency" gridLine={false} />
	</VisXYContainer>
</div>
