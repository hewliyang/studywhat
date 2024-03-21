<script lang="ts">
	import { short2img, long2short } from "$lib/constants";
	export let data;
	const short = long2short[data.degree.university];
	const img = short2img[short];

	const columns = [
		"Year",
		"EmploymentOverall",
		"EmploymentFT",
		"GrossMean",
		"GrossMedian",
		"25th",
		"75th",
	];
</script>

<div class="flex gap-4 mt-4">
	<img class="h-16" src={img} alt="University Logo" />
	<div>
		<div class="text-xl font-medium text-black">{data.degree.university}</div>
		<p class="text-gray-500">{data.degree.degree}, {data.degree.school}</p>
	</div>
</div>

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
			{#each data.degree.data as d}
				<tr>
					<td>{d.year}</td>
					<td>{d.employment_rate_overall}%</td>
					<td>{d.employment_rate_ft_perm}%</td>
					<td>${d.gross_monthly_mean.toLocaleString()}</td>
					<td>${d.gross_monthly_median.toLocaleString()}</td>
					<td>${d.gross_mthly_25_percentile.toLocaleString()}</td>
					<td>${d.gross_mthly_75_percentile.toLocaleString()}</td>
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
