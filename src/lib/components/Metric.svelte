<!--
@component
Takes a time series, gets the latest 2 records and computes the delta.
-->

<script lang="ts">
	import type { GESData, YearlyRecord } from "$lib/types";

	export let title: string;
	export let degree: GESData;
	export let property: keyof YearlyRecord;

	let isEnoughData: boolean;
	let valueAtT: number;
	let valueAtTMinusOne: number;
	let pctChange: number;
	let ext: "%" | "$";
	let sign: "+" | "";

	$: isEnoughData = degree.data.length >= 2;

	$: if (isEnoughData) {
		valueAtT = degree.data[degree.data.length - 1][property];
		valueAtTMinusOne = degree.data[degree.data.length - 2][property];
		pctChange = ((valueAtT - valueAtTMinusOne) / valueAtTMinusOne) * 100;
		ext = valueAtT >= 0 && valueAtT <= 100 ? "%" : "$";
		sign = pctChange > 0 ? "+" : "";
	}
</script>

<div>
	<h3 class="text-[12.5px]">{title}</h3>
	{#if isEnoughData}
		<div class="font-bold inline md:block">{valueAtT}{ext}</div>
		<p
			class="text-xs font-semibold block md:inline {pctChange > 0 ||
			pctChange === 0
				? 'text-green-500'
				: 'text-red-500'}"
		>
			{sign}{(valueAtT - valueAtTMinusOne).toLocaleString()}{ext} ({sign}{pctChange.toFixed(
				2
			)}%)
		</p>
	{:else}
		<div class="text-xs text-slate-500">N/A</div>
	{/if}
</div>
