<script lang="ts">
	import { browser } from "$app/environment";
	import { onNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { local, search } from "$lib/data";
	import { Search } from "lucide-svelte";
	import type { GESData } from "$lib/types";
	import SearchResults from "./SearchResults.svelte";

	let visible = $state(false);
	let query = $state("");
	let results = $state([] as GESData[]);

	$effect(() => {
		query = page.url.searchParams.get("q") ?? "";
	});

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
	onkeydown={(e) => {
		if (e.key === "Escape") hide();
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			visible = true;
			e.preventDefault();
		}
	}}
/>

<form action="/search" method="GET" class="relative">
	<div class="search-trigger">
		<Search class="h-3.5 w-3.5 text-muted" />
		<input
			name="q"
			type="search"
			onclick={show}
			oninput={show}
			value={query}
			placeholder="Search degrees..."
			class="search-input"
		/>
		{#if browser && !query && !visible}
			<span class="shortcut-hint">
				{#if navigator.userAgent.includes("Macintosh")}
					<kbd>⌘</kbd><kbd>K</kbd>
				{:else}
					<kbd>Ctrl</kbd><kbd>K</kbd>
				{/if}
			</span>
		{/if}
	</div>
</form>

{#if visible}
	<div class="modal-bg" role="presentation" onclick={hide}>
		<div class="search-modal">
			<form action="/search" method="get">
				<input
					placeholder="Search degrees…"
					type="search"
					name="q"
					value={query}
					oninput={async (e) => {
						query = e.currentTarget.value.toLowerCase();
						if (query === "") {
							results = [];
							return;
						}
						results = local
							? search(local, query)
							: await fetch(`/api/search?q=${query}`).then((r) => r.json());
					}}
					use:focus
					class="modal-input"
				/>
				<div class="p-3">
					<SearchResults degrees={results} />
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.search-trigger {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		border: 1px solid #e8e5df;
		border-radius: 6px;
		background: #ffffff;
		transition: border-color 0.15s;
	}

	.search-trigger:focus-within {
		border-color: #d4d0c8;
	}

	.search-input {
		font-family: inherit;
		font-size: 12px;
		border: none;
		outline: none;
		background: transparent;
		width: 120px;
		color: #1a1a1a;
	}

	.search-input::placeholder {
		color: #a1a19a;
	}

	.shortcut-hint {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-left: auto;
	}

	.modal-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(250, 250, 247, 0.92);
		backdrop-filter: blur(4px);
		z-index: 100;
		overflow: hidden;
	}

	.search-modal {
		background: #ffffff;
		width: 100%;
		max-width: 520px;
		max-height: 80vh;
		overflow: auto;
		margin: 60px auto;
		border: 1px solid #e8e5df;
		border-radius: 10px;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
	}

	.modal-input {
		width: 100%;
		padding: 14px 16px;
		font-family: inherit;
		font-size: 15px;
		border: none;
		border-bottom: 1px solid #e8e5df;
		outline: none;
		background: transparent;
		color: #1a1a1a;
	}

	.modal-input::placeholder {
		color: #a1a19a;
	}
</style>
