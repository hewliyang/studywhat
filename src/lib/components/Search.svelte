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
    class="flex items-center border border-gray-300 p-1 rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 placeholder-transparent"
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
      placeholder="Search..."
      class="w-full placeholder:text-sm focus:outline-none"
    />
    {#if browser && !query && !visible}
      <span
        class="hidden md:flex absolute right-3 items-center gap-1 text-gray-500 pointer-events-none"
      >
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
  <div
    class="fixed inset-0 bg-white bg-opacity-90 z-50 p-2 overflow-hidden box-border"
    role="presentation"
    on:click={hide}
  >
    <div
      class="bg-white w-full max-w-[600px] max-h-[90vh] overflow-auto mx-auto mt-5 border border-gray-300 rounded-lg shadow-lg"
    >
      <form action="/search" method="get">
        <input
          placeholder="Search..."
          type="search"
          name="q"
          value={query}
          class="w-full p-2 text-xl sticky top-0 border-b border-gray-300 focus:outline-none"
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

        <div class="p-4">
          <SearchResults degrees={results} />
        </div>
      </form>
    </div>
  </div>
{/if}
