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
	}: {
		data?: unknown[];
		getConfig: () => XYContainerConfigInterface<any>;
		overlay?: Snippet;
		class?: string;
		chartClass?: string;
	} = $props();

	let container: HTMLDivElement | undefined;
	let chart: XYContainer<any> | undefined;
	let frame = 0;

	function mountChart() {
		if (!container) return;
		chart?.destroy();
		container.replaceChildren();
		chart = new XYContainer(container, getConfig(), data);
	}

	function scheduleMount() {
		if (!container || typeof requestAnimationFrame === "undefined") return;
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			mountChart();
			frame = 0;
		});
	}

	onMount(() => {
		mountChart();

		return () => {
			if (frame) cancelAnimationFrame(frame);
			chart?.destroy();
		};
	});

	$effect(() => {
		data;
		getConfig;
		scheduleMount();
	});
</script>

<div class={`unovis-chart ${className}`}>
	<div bind:this={container} class={`unovis-chart-surface ${chartClass}`}></div>
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
