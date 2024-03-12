<script lang="ts">
	export let data;
</script>

<div class="data-record">
	<div class="record-row">
		<div class="record-label">Year:</div>
		<div class="record-value">{data.degree.year}</div>
	</div>
	<div class="record-row">
		<div class="record-label">University:</div>
		<div class="record-value">{data.degree.university}</div>
	</div>
	<div class="record-row">
		<div class="record-label">School:</div>
		<div class="record-value">{data.degree.school}</div>
	</div>
	<div class="record-row">
		<div class="record-label">Degree:</div>
		<div class="record-value">{data.degree.degree}</div>
	</div>
	<div class="record-row">
		<div class="record-label">Median Gross ($):</div>
		<div class="record-value">{data.degree.gross_monthly_median}</div>
	</div>
	<div class="record-row">
		<div class="record-label">Employment Rate (Overall):</div>
		<div class="record-value bar-container">
			<div class="bar-value">{data.degree.employment_rate_overall}%</div>
			<div
				class="bar-fill"
				style="width: {data.degree.employment_rate_overall}%;"
			></div>
		</div>
	</div>
</div>

<style>
	.data-record {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.record-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.record-label {
		font-weight: bold;
	}

	.record-value {
		text-wrap: balance;
		text-align: right;
	}

	.bar-container {
		width: 100%;
		height: 24px;
		background-color: #e0e0e0;
		border-radius: 4px;
		position: relative;
	}

	.bar-fill {
		height: 100%;
		background-color: #4caf50;
		border-radius: 4px;
	}

	.bar-value {
		position: absolute;
		top: 50%;
		left: 10px;
		transform: translateY(-50%);
		font-weight: bold;
	}

	@media (max-width: 480px) {
		.record-row {
			flex-direction: column;
		}

		.record-label {
			margin-bottom: 0.25rem;
		}
	}
</style>
