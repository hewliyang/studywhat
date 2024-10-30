<script lang="ts">
	import "../app.css";
	import Analytics from "$lib/components/Umami.svelte";
	import Search from "$lib/components/Search.svelte";
	import { Database, Github, Home } from "lucide-svelte";
	import { page } from "$app/stores";

	$: isHome = $page.route.id === "/";
</script>

<Analytics />
<svelte:head>
	<title>StudyWhat</title>
	<meta
		name="description"
		content="Singapore Graduate Employment Survey (GES) data. Analyse employment trends and decide what to study."
	/>
</svelte:head>

<section class="font-mono">
	<header
		class="mx-auto p-[0.5rem] flex flex-row items-center gap-[0.5rem] justify-between border-b"
	>
		<a href="https://github.com/hewliyang/studywhat" class="mr-auto ml-3">
			<Github class="h-4 w-4" />
		</a>
		<div class="flex items-center gap-4">
			{#if !isHome}
				<a href="/" class="mr-auto ml-3">
					<Home class="h-4 w-4" />
				</a>
			{/if}
			<Search />
		</div>
		<div class="flex gap-4 ml-auto justify-end mr-4">
			<a href="/disclaimers">
				<Database class="h-4 w-4" />
			</a>
		</div>
	</header>

	<main class="my-0 mx-auto p-[0.5rem] min-h-screen flex flex-col space-y-4">
		<slot />
	</main>
</section>
