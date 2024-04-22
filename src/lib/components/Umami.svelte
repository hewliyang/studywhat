<script lang="ts">
	import { dev } from "$app/environment";
</script>

<svelte:head>
	{#if !dev}
		<script
			defer
			src="https://us.umami.is/script.js"
			data-website-id="435f994d-11c1-44ae-8844-70327d9f09af"
		></script>
	{/if}
</svelte:head>
