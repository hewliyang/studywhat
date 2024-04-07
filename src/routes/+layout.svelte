<script lang="ts">
	import "../app.pcss";
	import "@fontsource-variable/inter";
	import Search from "$lib/components/Search.svelte";
</script>

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
	<div class="flex flex-col md:flex-row justify-between items-center">
		<div class="mb-4 md:mb-0">
			<a href="https://github.com/hewliyang/studywhat" class="underline"
				>GitHub (Web)</a
			>
			<span class="mx-2">&bull;</span>
			<a href="https://github.com/hewliyang/ges-report-to-csv" class="underline"
				>GitHub (Report Parser)</a
			>
		</div>
		<p class="text-center">Singapore Open Data License 1.0</p>
	</div>
</footer>

<style>
	:root {
		font-family: Inter, system-ui, sans-serif;
		font-size: 16px;
		letter-spacing: 0.01em;
		font-weight: 300;
		line-height: 1.5;
		margin: 0;
	}
</style>
