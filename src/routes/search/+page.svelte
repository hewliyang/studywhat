<script lang="ts">
	import { page } from "$app/state";
	import SearchResults from "$lib/components/SearchResults.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const query = $derived(page.url.searchParams.get("q")?.trim() ?? "");
</script>

<Seo
	title={query ? `Search: ${query} | StudyWhat` : "Search | StudyWhat"}
	description={query
		? `Search results for ${query} across Singapore Graduate Employment Survey degree pages.`
		: "Search Singapore degree programmes and graduate outcomes."}
	pathname="/search"
	noindex={true}
/>

<SearchResults degrees={data.degrees} />
