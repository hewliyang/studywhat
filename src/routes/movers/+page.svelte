<script lang="ts">
	import { long2short } from "$lib/constants";
	export let data;
</script>

<h1 class="font-semibold text-xl">Movers</h1>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
	<div>
		<h2 class="font-semibold text-lg mb-3">Winners</h2>
		{#if data.best.length > 0}
			<table>
				<thead>
					<tr>
						<th>University</th>
						<th>School</th>
						<th>Degree</th>
						<th>Gain (%)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.best as row}
						<tr>
							<td>{long2short[row.university]}</td>
							<td>{row.school ?? "-"}</td>
							<td
								><a href="/degree/{row.slug}" class="text-blue-500 underline"
									>{row.degree}</a
								></td
							>
							<td class="text-green-500">{row.pctChange.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
	<div>
		<h2 class="font-semibold text-lg mb-3">Losers</h2>
		{#if data.worst.length > 0}
			<table>
				<thead>
					<tr>
						<th>University</th>
						<th>School</th>
						<th>Degree</th>
						<th>Loss (%)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.worst as row}
						<tr>
							<td>{long2short[row.university]}</td>
							<td>{row.school ?? "-"}</td>
							<td
								><a href="/degree/{row.slug}" class="text-blue-500 underline"
									>{row.degree}</a
								></td
							>
							<td class="text-red-500">{row.pctChange.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div>🎉 no losers 🎉</div>
		{/if}
	</div>
</div>

<style>
	table {
		font-size: small;
		border-collapse: separate;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 0rem 1rem;
	}

	thead {
		background: #fff;
	}

	tbody td th {
		border-bottom: 1px solid #f5f5f5;
		padding: 4px 20px;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr {
		transition: all, 0.2s;
	}

	tbody tr:hover {
		background: #f5f5f5;
	}
</style>
