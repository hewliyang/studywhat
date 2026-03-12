<script lang="ts">
	import { short2img, long2short } from "$lib/constants";
	import type { GESData } from "$lib/types";

	let { degrees }: { degrees: GESData[] } = $props();
</script>

{#if degrees.length > 0}
	<ul class="space-y-1.5">
		{#each degrees as degree}
			{@const img = short2img[long2short[degree.university]]}
			<li>
				<a
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors text-sm"
					href="/degree/{degree.slug}"
				>
					<img class="h-8 w-auto opacity-70" src={img} alt="" aria-hidden="true" />
					<div class="min-w-0 flex-1">
						<div class="text-xs font-medium text-muted">{long2short[degree.university]}</div>
						<div class="text-sm text-ink truncate">{degree.degree}</div>
						{#if degree.school}
							<div class="text-[10px] text-muted truncate">{degree.school}</div>
						{/if}
					</div>
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<span class="text-xs text-muted">No results</span>
{/if}
