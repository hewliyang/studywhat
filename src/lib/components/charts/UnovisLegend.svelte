<script lang="ts">
	import { BulletLegend, type BulletLegendConfigInterface } from "@unovis/ts";
	import { onMount } from "svelte";

	let {
		config,
		class: className = "",
	}: {
		config: BulletLegendConfigInterface;
		class?: string;
	} = $props();

	let container: HTMLDivElement | undefined;
	let legend: BulletLegend | undefined;
	let frame = 0;

	function mountLegend() {
		if (!container) return;
		legend?.destroy();
		container.replaceChildren();
		legend = new BulletLegend(container, {
			...config,
			renderIntoProvidedDomNode: true,
		});
	}

	function scheduleMount() {
		if (!container || typeof requestAnimationFrame === "undefined") return;
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			mountLegend();
			frame = 0;
		});
	}

	onMount(() => {
		mountLegend();

		return () => {
			if (frame) cancelAnimationFrame(frame);
			legend?.destroy();
		};
	});

	$effect(() => {
		config;
		scheduleMount();
	});
</script>

<div bind:this={container} class={className}></div>
