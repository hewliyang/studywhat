<script lang="ts">
	import type { DataRecord } from "$lib/types";

	export let degrees: DataRecord[];
</script>

{#if degrees.length > 0}
	<ul>
		{#each degrees as degree}
			<li>
				<h3><a href="/degree/{degree.slug}">{degree.degree}</a></h3>
				<small>{degree.university} - {degree.school}</small>
			</li>
		{/each}
	</ul>
{:else}
	<span>No results</span>
{/if}

<style>
	ul {
		padding: 0;
	}

	li {
		list-style: none;
		margin: 0 0 1rem 0;
	}

	h3,
	small {
		margin: 0;
	}
</style>
