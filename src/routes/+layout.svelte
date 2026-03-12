<script lang="ts">
	import "../app.pcss";
	import type { Snippet } from "svelte";
	import Analytics from "$lib/components/Umami.svelte";
	import Search from "$lib/components/Search.svelte";
	import { Github } from "lucide-svelte";

	let { children }: { children: Snippet } = $props();
</script>

<Analytics />

<div class="max-w-3xl mx-auto px-4 sm:px-6">
	<header class="pt-3 pb-2 flex items-center gap-3 justify-between" data-nosnippet>
		<a href="/" class="group flex items-center gap-1.5">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-ink" aria-hidden="true">
				<path d="M12 3L2 9l10 6 8-4.8V17h2V9L12 3z" fill="currentColor" opacity="0.85"/>
				<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="currentColor" opacity="0.55"/>
			</svg>
			<span class="text-sm font-semibold tracking-tight text-ink">StudyWhat</span>
			<span class="text-[9px] font-mono text-muted uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">SG</span>
		</a>
		<Search />
	</header>

	<main class="py-6 flex flex-col gap-8">
		{@render children()}
	</main>

	<footer class="py-4 border-t border-border" data-nosnippet>
		<div class="flex justify-between items-center text-xs text-muted">
			<a href="https://github.com/hewliyang/studywhat" class="hover:text-ink transition-colors">
				<Github class="h-3.5 w-3.5" />
			</a>
			<a href="/disclaimers" class="hover:text-ink transition-colors">Disclaimers & Dataset</a>
		</div>
	</footer>
</div>
