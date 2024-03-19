<script lang="ts">
	export let data;
</script>

<div
	class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4"
>
	<div class="flex-shrink-0">
		<img
			class="h-12 w-12"
			src="https://via.placeholder.com/50"
			alt="University Logo"
		/>
	</div>
	<div>
		<div class="text-xl font-medium text-black">{data.degree.university}</div>
		<p class="text-gray-500">{data.degree.degree}, {data.degree.school}</p>
	</div>
</div>

<div
	class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8"
>
	{#each data.degree.data as d}
		<div
			class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4"
		>
			<div>
				<div class="text-xl font-medium text-black">Year: {d.year}</div>
				<p class="text-gray-500">
					Employment Rate: {d.employment_rate_overall}%
				</p>
				<p class="text-gray-500">
					Median Gross Salary: ${d.gross_monthly_median}
				</p>
			</div>
		</div>
	{/each}
</div>
