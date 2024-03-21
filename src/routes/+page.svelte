<script lang="ts">
	import { long2short } from "$lib/constants";

	export let data;

	const columns = [
		"Rank",
		"University",
		"Degree",
		"Employment",
		"Gross Median",
		"25th",
		"75th",
	];
</script>

<div class="overflow-x-auto mt-4">
	<table class="text-[0.9rem] w-full border-collapse">
		<thead>
			<tr class="bg-gray-200 font-bold">
				{#each columns as col}
					<th class="p-[0.25rem] text-left border-b">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.top as record, index (record.slug)}
				<tr>
					<td>{index + 1}</td>
					<td>{long2short[record.university]}</td>
					<td
						><a href="/degree/{record.slug}">
							{record.degree}
						</a>
					</td>
					<td>{record.employment_rate_overall}%</td>
					<td>${record.gross_monthly_median.toLocaleString()}</td>
					<td>${record.gross_mthly_25_percentile.toLocaleString()}</td>
					<td>${record.gross_mthly_75_percentile.toLocaleString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	td {
		padding: 0.25rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}
</style>
