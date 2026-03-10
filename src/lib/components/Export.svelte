<script lang="ts">
	import { downloadAsCSV, downloadAsJSON } from "$lib/download";

	let {
		rows,
		fileName,
	}: { rows: readonly unknown[]; fileName: string } = $props();
</script>

<div class="flex gap-1.5 items-center">
	<button
		class="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted border border-border rounded hover:border-border-dark hover:text-ink transition-all"
		onclick={() => downloadAsJSON(Array.from(rows), fileName)}
	>
		JSON
	</button>
	<button
		class="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted border border-border rounded hover:border-border-dark hover:text-ink transition-all"
		onclick={() => downloadAsCSV(Array.from(rows), fileName)}
	>
		CSV
	</button>
</div>
