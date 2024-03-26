<script lang="ts">
	import { browser } from "$app/environment";
	import { onNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import { local, search } from "$lib/data";
	import type { DataRecord } from "$lib/types";
	import SearchResults from "./SearchResults.svelte";

	$: query = $page.url.searchParams.get("q") ?? "";
	$: visible = false;
	$: results = [] as DataRecord[];

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
		class="flex items-center border border-gray-300 w-full p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
	>
		<div class="px-2">
			<svg
				aria-hidden="true"
				height="16"
				viewBox="0 0 16 16"
				version="1.1"
				width="16"
				data-view-component="true"
				class="octicon octicon-search"
			>
				<path
					d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"
				></path>
			</svg>
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
