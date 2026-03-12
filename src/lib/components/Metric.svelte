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

<div class="metric-card">
	<span class="metric-title">{title}</span>
	{#if metric.isAvailable}
		<span class="metric-value">
			{metric.ext === "$" ? "$" : ""}{metric.valueAtT?.toLocaleString()}{metric.ext === "%" ? "%" : ""}
		</span>
		<span
			class="metric-delta"
			class:positive={metric.pctChange >= 0}
			class:negative={metric.pctChange < 0}
		>
			{metric.sign}{(metric.valueAtT! - metric.valueAtTMinusOne!).toLocaleString()}{metric.ext === "%" ? "pp" : ""}
			<span class="metric-pct">({metric.sign}{metric.pctChange.toFixed(1)}%)</span>
		</span>
	{:else}
		<span class="metric-na">—</span>
	{/if}
</div>

<style>
	.metric-card {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
	}

	.metric-title {
		font-family: 'DM Sans', system-ui, sans-serif;
		font-size: 10px;
		font-weight: 500;
		color: #71717a;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.metric-value {
		font-family: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.2;
	}

	.metric-delta {
		font-family: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
		font-size: 10px;
		font-weight: 500;
	}

	.metric-delta.positive {
		color: #16a34a;
	}

	.metric-delta.negative {
		color: #dc2626;
	}

	.metric-pct {
		opacity: 0.7;
	}

	.metric-na {
		font-family: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
		font-size: 14px;
		color: #a1a19a;
	}
</style>
