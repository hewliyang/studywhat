<script>
	import { downloadAsCSV, downloadFromURL } from "$lib/download";
	import { ArrowRight } from "lucide-svelte";
	import { getFlattened } from "$lib/data";
</script>

<svelte:head>
	<title>Disclaimers & Dataset | StudyWhat</title>
	<meta
		name="description"
		content="Complete Graduate Employment Survey 2009 to 2023 download as CSV or JSON"
	/>
</svelte:head>

<div class="space-y-8 text-sm leading-relaxed">
	<section>
		<h2 class="section-title">Attribution</h2>
		<p class="text-muted">
			This site contains information from
			<a href="https://beta.data.gov.sg/collections/415/datasets/d_3c55210de27fcccda2ed0c63fdd2b352/view" class="link">
				Graduate Employment Survey - NTU, NUS, SIT, SMU, SUSS & SUTD</a>
			which is made available under the terms of
			<a href="https://beta.data.gov.sg/open-data-license" class="link">
				Singapore Open Data License version 1.0</a>,
			accessed {new Date().toLocaleDateString("en-SG")}.
		</p>
	</section>

	<section>
		<h2 class="section-title">Disclaimer</h2>
		<p class="text-muted">
			The data is provided "as is" without warranties of any kind. The author disclaims any warranty as to accuracy, correctness, completeness, reliability or fitness for any particular purpose. The reader assumes all responsibility and risk for the use of such data.
		</p>
	</section>

	<section>
		<h2 class="section-title">Data Schema</h2>
		<div class="schema-table-wrap">
			<table>
				<thead>
					<tr>
						<th>Field</th>
						<th>Column</th>
						<th>Type</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Year</td><td class="font-mono">year</td><td>YYYY</td></tr>
					<tr><td>University</td><td class="font-mono">university</td><td>Text</td></tr>
					<tr><td>School</td><td class="font-mono">school</td><td>Text</td></tr>
					<tr><td>Degree</td><td class="font-mono">degree</td><td>Text</td></tr>
					<tr><td>Employment Rate (Overall)</td><td class="font-mono">employment_rate_overall</td><td>%</td></tr>
					<tr><td>Employment Rate (FT Perm)</td><td class="font-mono">employment_rate_ft_perm</td><td>%</td></tr>
					<tr><td>Basic Monthly Mean</td><td class="font-mono">basic_monthly_mean</td><td>S$</td></tr>
					<tr><td>Basic Monthly Median</td><td class="font-mono">basic_monthly_median</td><td>S$</td></tr>
					<tr><td>Gross Monthly Mean</td><td class="font-mono">gross_monthly_mean</td><td>S$</td></tr>
					<tr><td>Gross Monthly Median</td><td class="font-mono">gross_monthly_median</td><td>S$</td></tr>
					<tr><td>Gross Monthly P25</td><td class="font-mono">gross_mthly_25_percentile</td><td>S$</td></tr>
					<tr><td>Gross Monthly P75</td><td class="font-mono">gross_mthly_75_percentile</td><td>S$</td></tr>
				</tbody>
			</table>
		</div>
		<p class="text-[11px] text-muted mt-3">
			* Law, medicine, pharmacy and architecture data is from a follow-up survey after practical training/housemanship/pupillage.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="section-title">Downloads</h2>
		<div class="flex gap-2">
			<button
				class="download-btn"
				onclick={() => downloadFromURL("https://raw.githubusercontent.com/hewliyang/studywhat/main/src/lib/data.json")}
			>
				<span class="font-mono font-medium">JSON</span>
				<ArrowRight class="h-3.5 w-3.5 ml-auto" />
			</button>
			<button
				class="download-btn"
				onclick={() => downloadAsCSV(getFlattened(), "studywhat")}
			>
				<span class="font-mono font-medium">CSV</span>
				<ArrowRight class="h-3.5 w-3.5 ml-auto" />
			</button>
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="section-title">Open Source</h2>
		<p class="text-muted">
			<a href="https://github.com/hewliyang/studywhat" class="link">Web App</a> (SvelteKit) ·
			<a href="https://github.com/hewliyang/ges-report-to-csv" class="link">PDF Scraper</a> (Python)
		</p>
	</section>
</div>

<style>
	.section-title {
		font-family: 'DM Sans', system-ui, sans-serif;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #1a1a1a;
		margin-bottom: 8px;
	}

	.link {
		color: #2563eb;
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.15s;
	}

	.link:hover {
		border-bottom-color: #2563eb;
	}

	.schema-table-wrap {
		overflow-x: auto;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
	}

	table {
		width: 100%;
		font-size: 11px;
		border-collapse: collapse;
	}

	thead tr {
		border-bottom: 2px solid #e8e5df;
	}

	th {
		padding: 6px 12px;
		font-family: 'DM Sans', system-ui, sans-serif;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #71717a;
		text-align: left;
		background: #FAFAF7;
	}

	tbody tr {
		border-bottom: 1px solid #f0efe9;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	td {
		padding: 5px 12px;
		color: #1a1a1a;
	}

	.download-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		font-size: 12px;
		border: 1px solid #e8e5df;
		border-radius: 6px;
		background: #ffffff;
		color: #1a1a1a;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		flex: 1;
	}

	.download-btn:hover {
		border-color: #d4d0c8;
		background: #f5f4f0;
	}
</style>
