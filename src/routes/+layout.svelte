<script lang="ts">
	import "../app.pcss";
	import "@fontsource-variable/inter";
	import Search from "$lib/components/Search.svelte";
	import { Github } from "lucide-svelte";
</script>

<svelte:head>
	<title>StudyWhat</title>
	<meta
		name="description"
		content="Singapore Graduate Employment Survey (GES) data. Analyse employment trends and decide what to study."
	/>
</svelte:head>
<header
	class="my-0 mx-auto p-[0.5rem] flex flex-row items-center gap-[0.5rem] justify-between border-b"
>
	<h1>
		<a href="/" class="text-2xl font-semibold tracking-tighter">StudyWhat</a>
	</h1>
	<Search />
</header>

<main class="my-0 mx-auto p-[0.5rem] min-h-screen flex flex-col space-y-4">
	<slot />
</main>

<footer class="my-0 mx-auto p-[0.5rem] border-t text-sm">
	<div class="flex justify-between items-center">
		<a href="https://github.com/hewliyang/studywhat" class="underline"
			><Github class="h-4 w-4" /></a
		>
		<a href="/disclaimers" class="underline">Disclaimers & Dataset</a>
	</div>
</footer>

<style>
	:root {
		font-family:
			Inter Variable,
			system-ui,
			sans-serif;
		font-size: 16px;
		letter-spacing: 0.01em;
		font-weight: 300;
		line-height: 1.5;
		margin: 0;
	}
</style>
