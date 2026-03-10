<script lang="ts">
	import SearchResults from "$lib/components/SearchResults.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<SearchResults degrees={data.degrees} />
