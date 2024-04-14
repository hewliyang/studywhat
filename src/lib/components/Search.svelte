<script lang="ts">
	import { browser } from "$app/environment";
	import { onNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import { local, search } from "$lib/data";
	import { Search } from "lucide-svelte";
	import type { GESData } from "$lib/types";
	import SearchResults from "./SearchResults.svelte";

	$: query = $page.url.searchParams.get("q") ?? "";
	$: visible = false;
	$: results = [] as GESData[];

	function show(e: Event & { currentTarget: HTMLInputElement }) {
		visible = true;
		query = e.currentTarget.value;
	}

	function hide() {
		visible = false;
	}

	function focus(node: HTMLInputElement) {
		setTimeout(() => node.focus());
	}

	onNavigate((navigation) => {
		visible = false;
		if (navigation.to?.url.pathname !== "/search") {
			query = "";
		}
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Escape") {
			hide();
		}

		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			visible = true;
			e.preventDefault();
		}
	}}
/>

<form action="/search" method="GET" class="relative">
	<div
		class="flex items-center border border-gray-300 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
	>
		<div class="px-2">
			<Search class="h-4 w-4" />
		</div>
		<input
			name="q"
			type="search"
			on:click={show}
			on:input={show}
			value={query}
		/>
		{#if browser && !query && !visible}
			{#if navigator.userAgent.includes("Macintosh")}
				<span
					class="absolute inset-y-0 left-0 right-0 flex items-center justify-center text-gray-500 pointer-events-none"
					><kbd>Cmd</kbd> + <kbd>K</kbd></span
				>
			{:else}
				<span
					class="absolute inset-y-0 left-0 right-0 flex items-center justify-center text-gray-500 pointer-events-none"
					><kbd>Ctrl</kbd> + <kbd>K</kbd></span
				>
			{/if}
		{/if}
	</div>
</form>

{#if visible}
	<div class="modal-background" role="presentation" on:click={hide}>
		<div class="search">
			<form action="/search" method="get">
				<input
					placeholder="search"
					type="search"
					name="q"
					value={query}
					on:input={async (e) => {
						query = e.currentTarget.value.toLowerCase();

						if (query === "") {
							results = [];
							return;
						}

						results = local
							? search(local, query)
							: await fetch(`/search?q=${query}`).then((r) => r.json());
					}}
					use:focus
				/>

				<div style="padding: 1rem">
					<SearchResults degrees={results} />
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	input {
		font: inherit;
		width: 100%;
	}

	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		padding: 0.5rem;
		background: hsla(0, 100%, 100%, 0.9);
		z-index: 100;
		overflow: hidden;
		box-sizing: border-box;
	}

	.search {
		background: white;
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow: auto;
		margin: 20px auto;
		border: solid 1px #ccc;
		border-radius: 10px;
		box-shadow: 0 0 10px #ccc;
	}

	.search input {
		padding: 0.5rem 1rem;
		font-size: 1.5em;
		position: sticky;
		top: 0;
		border: none;
		border-bottom: solid 1px #ccc;
		outline: none;
	}
</style>
