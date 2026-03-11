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
	}: {
		data?: unknown[];
		getConfig: () => XYContainerConfigInterface<any>;
		overlay?: Snippet;
		class?: string;
		chartClass?: string;
		height?: number;
	} = $props();

	let container: HTMLDivElement | undefined;
	let chart: XYContainer<any> | undefined;
	let frame = 0;
	let resizeObserver: ResizeObserver | undefined;
	let removeResizeListener: (() => void) | undefined;
	let lastWidth = 0;

	function mountChart() {
		if (!container || container.clientWidth === 0) return;
		chart?.destroy();
		container.replaceChildren();
		chart = new XYContainer(container, { ...getConfig(), duration: 0 }, data);
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
		scheduleMount();

		if (typeof ResizeObserver !== "undefined" && container) {
			resizeObserver = new ResizeObserver(([entry]) => {
				const nextWidth = Math.round(entry?.contentRect.width ?? container?.clientWidth ?? 0);
				if (nextWidth === 0) return;
				if (nextWidth === lastWidth && chart) return;
				lastWidth = nextWidth;
				scheduleMount();
			});
			lastWidth = container.clientWidth;
			resizeObserver.observe(container);
		} else if (typeof window !== "undefined") {
			const handleResize = () => scheduleMount();
			window.addEventListener("resize", handleResize, { passive: true });
			removeResizeListener = () => window.removeEventListener("resize", handleResize);
		}

		return () => {
			if (frame) cancelAnimationFrame(frame);
			resizeObserver?.disconnect();
			removeResizeListener?.();
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
