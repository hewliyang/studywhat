<script lang="ts">
	import SearchResults from "$lib/components/SearchResults.svelte";
	export let data;
</script>

<SearchResults degrees={data.degrees} />
