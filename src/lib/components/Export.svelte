<script lang="ts">
  import { downloadAsCSV, downloadAsJSON } from "$lib/download";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import FileJson from "lucide-svelte/icons/file-json";
  import Sheet from "lucide-svelte/icons/sheet";

  export let rows: any[];
  export let file_name: string;

  let loading: boolean = false;
  let default_timeout: number = 500; // tell the user something is happening

  function onclick(func: Function) {
    loading = true;
    func(rows, file_name);
    setTimeout(() => {
      loading = false;
    }, default_timeout);
  }
</script>

<div class="flex gap-2 items-center">
  <button
    class="flex px-2 py-1 rounded-lg border items-center text-sm"
    on:click={() => onclick(downloadAsJSON)}
    disabled={loading}
  >
    <FileJson class="h-4 w-4 mr-2" />
    JSON
  </button>
  <button
    class="flex px-2 py-1 rounded-lg border items-center text-sm"
    on:click={() => onclick(downloadAsCSV)}
    disabled={loading}
  >
    <Sheet class="h-4 w-4 mr-2" />
    CSV
  </button>
  {#if loading}
    <LoaderCircle class="h-4 w-4 ml-3 animate-spin" />
  {/if}
</div>
