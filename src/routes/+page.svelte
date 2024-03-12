<script lang="ts">
	export let data;

	const short2long = {
		SUSS: "Singapore University of Social Sciences",
		SUTD: "Singapore University of Technology and Design",
		SIT: "Singapore Institute of Technology",
		SMU: "Singapore Management University",
		NUS: "National University of Singapore",
		NTU: "Nanyang Technological University",
	};
	const long2short = Object.entries(short2long).reduce(
		(acc: Record<string, string>, [k, v]) => {
			acc[v] = k;
			return acc;
		},
		{}
	);

	const yr = new Date().getFullYear();
</script>

<h1>
	Top Paying Degrees <small>GES {yr - 1}</small>
</h1>

<div class="table-responsive">
	<table>
		<thead>
			<tr>
				<th>Rank</th>
				<th>University</th>
				<th>Degree</th>
				<th>Gross Mean</th>
				<th>Gross Median</th>
				<th>25th %ile</th>
				<th>75th %ile</th>
			</tr>
		</thead>
		<tbody>
			{#each data.top as record, index (record.id)}
				<tr>
					<td>{index + 1}</td>
					<td>{long2short[record.university]}</td>
					<td
						><a href="/degree/{record.id}">
							{record.degree}
						</a>
					</td>
					<td>${record.gross_monthly_mean.toLocaleString()}</td>
					<td>${record.gross_monthly_median.toLocaleString()}</td>
					<td>${record.gross_mthly_25_percentile.toLocaleString()}</td>
					<td>${record.gross_mthly_75_percentile.toLocaleString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-responsive {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	th,
	td {
		padding: 0.25rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
		/* white-space: nowrap; */
	}

	th {
		background-color: #f2f2f2;
		font-weight: bold;
	}
</style>
