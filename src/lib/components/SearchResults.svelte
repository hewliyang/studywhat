<script lang="ts">
	import { short2img, long2short } from "$lib/constants";
	import type { DataRecord } from "$lib/types";

	export let degrees: DataRecord[];
</script>

{#if degrees.length > 0}
	<ul>
		{#each degrees as degree}
			{@const img = short2img[long2short[degree.university]]}
			<li class="hover:scale-[101%] cursor-pointer my-[1rem]">
				<a
					class="flex gap-4 mt-2 border rounded-lg py-3 shadow-sm text-sm"
					href="/degree/{degree.slug}"
				>
					<img class="h-16 ml-3" src={img} alt="University Logo" />
					<div>
						<div class="font-medium text-black">
							{degree.university}
						</div>
						<p class="text-gray-500">
							{degree.degree}, {degree.school}
						</p>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<span>No results</span>
{/if}
