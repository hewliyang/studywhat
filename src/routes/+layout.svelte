<script lang="ts">
	import "../app.pcss";
	import Search from "$lib/components/Search.svelte";
</script>

<header>
	<h1><a href="/">StudyWhat</a></h1>
	<Search />
</header>

<main>
	<slot />
</main>

<footer>
	<div>
		<a href="https://github.com/hewliyang/studywhat">GitHub</a>
		•
		<a href="https://github.com/hewliyang/ges-report-to-csv"
			>GES Report Parser</a
		>
		<p>Data sourced from Ministry of Education</p>
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

	header,
	main,
	footer {
		max-width: 40rem;
		margin: 0 auto;
		padding: 0.5rem;
	}

	header {
		@media (min-width: 24rem) {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 0.5rem;
		}
	}

	main {
		max-width: 40rem;
		margin: 0 auto;
		min-height: calc(100vh - 15rem);
	}
</style>
