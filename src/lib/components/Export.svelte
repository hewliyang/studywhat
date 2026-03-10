<script lang="ts">
	import { downloadAsCSV, downloadAsJSON } from "$lib/download";
	import { FileJson, Sheet } from "lucide-svelte";

	let {
		rows,
		fileName,
	}: { rows: readonly unknown[]; fileName: string } = $props();
</script>

<div class="flex gap-2 items-center">
	<button
		class="flex px-2 py-1 rounded-lg border items-center text-sm"
		onclick={() => downloadAsJSON(Array.from(rows), fileName)}
	>
		<FileJson class="h-4 w-4 mr-2" />
		JSON
	</button>
	<button
		class="flex px-2 py-1 rounded-lg border items-center text-sm"
		onclick={() => downloadAsCSV(Array.from(rows), fileName)}
	>
		<Sheet class="h-4 w-4 mr-2" />
		CSV
	</button>
</div>
