<script lang="ts">
	import "../app.pcss";
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

<main class="my-0 mx-auto p-[0.5rem] min-h-screen">
	<slot />
</main>

<footer class="my-0 mx-auto p-[0.5rem]">
	<div>
		<a href="https://github.com/hewliyang/studywhat" class="underline">GitHub</a
		>
		•
		<a href="https://github.com/hewliyang/ges-report-to-csv" class="underline"
			>GES Report Parser</a
		>
		<p>
			Data sourced from Ministry of Education under Singapore Open Data License
			1.0
		</p>
	</div>
</footer>

<style>
	:root {
		font-family: system-ui, sans-serif;
		font-size: 16px;
		letter-spacing: 0.01em;
		font-weight: 300;
		line-height: 1.5;
		margin: 0;
	}
</style>
