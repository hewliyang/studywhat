<!--
@component
Takes a time series, gets the latest 2 records and computes the delta.
-->

<script lang="ts">
	import type { GESData, YearlyRecord } from "$lib/types";

	let {
		title,
		degree,
		property,
	}: {
		title: string;
		degree: GESData;
		property: keyof YearlyRecord;
	} = $props();

	const metric = $derived.by(() => {
		const isEnoughData = degree.data.length >= 2;

		if (!isEnoughData) {
			return {
				isAvailable: false,
				valueAtT: null,
				valueAtTMinusOne: null,
				pctChange: 0,
				ext: "%" as "%" | "$",
				sign: "" as "+" | "",
			};
		}

		const valueAtT = degree.data[degree.data.length - 1][property];
		const valueAtTMinusOne = degree.data[degree.data.length - 2][property];

		if (valueAtT == null || valueAtTMinusOne == null || valueAtTMinusOne === 0) {
			return {
				isAvailable: false,
				valueAtT: null,
				valueAtTMinusOne: null,
				pctChange: 0,
				ext: "%" as "%" | "$",
				sign: "" as "+" | "",
			};
		}

		const pctChange = ((valueAtT - valueAtTMinusOne) / valueAtTMinusOne) * 100;

		return {
			isAvailable: true,
			valueAtT,
			valueAtTMinusOne,
			pctChange,
			ext: valueAtT >= 0 && valueAtT <= 100 ? ("%" as const) : ("$" as const),
			sign: pctChange > 0 ? ("+" as const) : ("" as const),
		};
	});
</script>

<div>
	<h3 class="text-[12.5px]">{title}</h3>
	{#if metric.isAvailable}
		<div class="font-bold inline md:block">{metric.valueAtT}{metric.ext}</div>
		<p
			class="text-xs font-semibold block md:inline {metric.pctChange > 0 ||
			metric.pctChange === 0
				? 'text-green-500'
				: 'text-red-500'}"
		>
			{metric.sign}{(metric.valueAtT! - metric.valueAtTMinusOne!).toLocaleString()}{metric.ext}
			({metric.sign}{metric.pctChange.toFixed(2)}%)
		</p>
	{:else}
		<div class="text-xs text-slate-500">N/A</div>
	{/if}
</div>
