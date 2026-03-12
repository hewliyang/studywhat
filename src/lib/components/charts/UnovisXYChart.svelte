<script lang="ts">
	import { XYContainer, type XYContainerConfigInterface } from "@unovis/ts";
	import { onMount } from "svelte";
	import type { Snippet } from "svelte";

	let {
		data = [],
		getConfig,
		overlay,
		class: className = "",
		chartClass = "",
		height,
		duration = 0,
	}: {
		data?: unknown[];
		getConfig: () => XYContainerConfigInterface<any>;
		overlay?: Snippet;
		class?: string;
		chartClass?: string;
		height?: number;
		duration?: number;
	} = $props();

	let container: HTMLDivElement | undefined;
	let chart: XYContainer<any> | undefined;
	let frame = 0;
	let lastGetConfig: (() => XYContainerConfigInterface<any>) | undefined;

	function mountChart() {
		if (!container) return;
		chart?.destroy();
		container.replaceChildren();
		chart = new XYContainer(container, { ...getConfig(), duration: 0 }, data);
		lastGetConfig = getConfig;
	}

	function updateChart() {
		if (!chart) {
			mountChart();
			return;
		}

		if (getConfig !== lastGetConfig) {
			chart.updateContainer({ ...getConfig(), duration }, true);
			lastGetConfig = getConfig;
		}
		chart.setData(data, true);
		chart.render(duration);
	}

	function scheduleUpdate() {
		if (!container || typeof requestAnimationFrame === "undefined") return;
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			updateChart();
			frame = 0;
		});
	}

	onMount(() => {
		return () => {
			if (frame) cancelAnimationFrame(frame);
			chart?.destroy();
		};
	});

	$effect(() => {
		data;
		getConfig;
		duration;
		scheduleUpdate();
	});
</script>

<div class={`unovis-chart ${className}`}>
	<div bind:this={container} class={`unovis-chart-surface ${chartClass}`} style:min-height={height ? `${height}px` : undefined}></div>
	{#if overlay}
		<div class="unovis-chart-overlay">
			{@render overlay()}
		</div>
	{/if}
</div>

<style>
	.unovis-chart {
		position: relative;
		width: 100%;
	}

	.unovis-chart-surface {
		width: 100%;
	}

	.unovis-chart-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.unovis-chart-overlay :global(*) {
		pointer-events: none;
	}
</style>
