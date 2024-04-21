<script>
	import { downloadAsCSV, downloadFromURL } from "$lib/download";
	import { ArrowRight } from "lucide-svelte";
	import { getFlattened } from "$lib/data";
</script>

<svelte:head>
	<title>Disclaimers & Dataset Download</title>
	<meta
		name="description"
		content="Complete Graduate Employment Survey 2009 to 2023 download as CSV or JSON"
	/>
</svelte:head>

<section class="flex flex-col space-y-6 p-1 md:p-8 text-sm">
	<div>
		<h1 class="text-xl font-semibold">Attribution</h1>
		This site contains information from
		<a
			href="https://beta.data.gov.sg/collections/415/datasets/d_3c55210de27fcccda2ed0c63fdd2b352/view"
			class="underline text-blue-500 font-bold"
		>
			Graduate Employment Survey - NTU, NUS, SIT, SMU, SUSS & SUTD</a
		>
		which is made available under the terms of
		<a
			href="https://beta.data.gov.sg/open-data-license"
			class="underline text-blue-500 font-bold"
		>
			Singapore Open Data License version 1.0
		</a>
		accessed at {new Date().toLocaleDateString("en-SG")}. The dataset was
		further extended by the author and is made available under the same license.
	</div>

	<div>
		<h1 class="text-xl font-semibold">Disclaimer</h1>
		<p>
			The data published in this document is provided on an “as is” basis
			without any warranties of any kind. To the fullest extent permitted by
			law, the author does not warrant and hereby disclaims any warranty as to
			the accuracy, correctness, completeness, reliability or fitness for any
			particular purpose of such data. The reader of this document assumes all
			responsibility and risk for the use of such data. the author shall not be
			liable for any damage or loss of any kind caused as a result (directly or
			indirectly) of the use of such data, including but not limited to any
			damage or loss suffered as a result of reliance on the data published in
			this document
		</p>
	</div>

	<div>
		<h1 class="text-xl font-semibold mb-2">Data Schema</h1>
		<table>
			<thead
				><tr
					><th>Title</th><th>Column name</th><th>Data type</th><th
						>Unit of measure</th
					><th>Description</th></tr
				></thead
			><tbody
				><tr
					><td>Year</td><td>year</td><td>Datetime (Year) "YYYY"</td><td>-</td
					><td>-</td></tr
				><tr
					><td>University</td><td>university</td><td>Text (General)</td><td
						>-</td
					><td>-</td></tr
				><tr
					><td>School</td><td>school</td><td>Text (General)</td><td>-</td><td
						>-</td
					></tr
				><tr
					><td>Degree</td><td>degree</td><td>Text (General)</td><td>-</td><td
						>-</td
					></tr
				><tr
					><td>Overall Employment Rate (%)</td><td>employment_rate_overall</td
					><td>Text (General)</td><td>-</td><td
						>Overall employment rate refers to the number of graduates working
						in full-time permanent, part-time, temporary or freelance basis, as
						a proportion of graduates in the labour force (i.e. those who were
						working, or not working but actively looking and available for work)
						approximately 6 months after completing their final examinations.</td
					></tr
				><tr
					><td>Full-Time Permanent Employment Rate (%)</td><td
						>employment_rate_ft_perm</td
					><td>Text (General)</td><td>-</td><td
						>Full-time permanent employment rate refers to the number of
						graduates in employment of at least 35 hours a week and where the
						employment is not temporary (including contracts of one year or
						more), as a proportion of graduates in the labour force (i.e. those
						who were working, or not working but actively looking and available
						for work) approximately 6 months after completing their final
						examinations.</td
					></tr
				><tr
					><td>Basic Monthly Salary - Mean (S$)</td><td>basic_monthly_mean</td
					><td>Text (General)</td><td>-</td><td
						>Basic monthly salary pertains only to full-time permanently
						employed graduates. It comprises basic pay before deduction of the
						employee’s CPF contributions and personal income tax. Employer’s CPF
						contributions, bonuses, stock options, overtime payments,
						commissions, fixed allowances, other regular cash payments, lump sum
						payments, and payments-in-kind are excluded.</td
					></tr
				><tr
					><td>Basic Monthly Salary - Median (S$)</td><td
						>basic_monthly_median</td
					><td>Text (General)</td><td>-</td><td
						>Basic monthly salary pertains only to full-time permanently
						employed graduates. It comprises basic pay before deduction of the
						employee’s CPF contributions and personal income tax. Employer’s CPF
						contributions, bonuses, stock options, overtime payments,
						commissions, fixed allowances, other regular cash payments, lump sum
						payments, and payments-in-kind are excluded.</td
					></tr
				><tr
					><td>Gross Monthly Salary - Mean (S$)</td><td>gross_monthly_mean</td
					><td>Text (General)</td><td>-</td><td
						>Gross monthly salary pertains only to full-time permanently
						employed graduates. It comprises basic salary, overtime payments,
						commissions, fixed allowances, and other regular cash payments,
						before deductions of the employee’s CPF contributions and personal
						income tax. Employer’s CPF contributions, bonuses, stock options,
						lump sum payments, and payments-in-kind are excluded.</td
					></tr
				><tr
					><td>Gross Monthly Salary - Median (S$)</td><td
						>gross_monthly_median</td
					><td>Text (General)</td><td>-</td><td
						>Gross monthly salary pertains only to full-time permanently
						employed graduates. It comprises basic salary, overtime payments,
						commissions, fixed allowances, and other regular cash payments,
						before deductions of the employee’s CPF contributions and personal
						income tax. Employer’s CPF contributions, bonuses, stock options,
						lump sum payments, and payments-in-kind are excluded.</td
					></tr
				><tr
					><td>Gross Monthly Salary - 25th Percentile (S$)</td><td
						>gross_mthly_25_percentile</td
					><td>Text (General)</td><td>-</td><td
						>Gross monthly salary pertains only to full-time permanently
						employed graduates. It comprises basic salary, overtime payments,
						commissions, fixed allowances, and other regular cash payments,
						before deductions of the employee’s CPF contributions and personal
						income tax. Employer’s CPF contributions, bonuses, stock options,
						lump sum payments, and payments-in-kind are excluded.</td
					></tr
				><tr
					><td>Gross Monthly Salary - 75th Percentile (S$)</td><td
						>gross_mthly_75_percentile</td
					><td>Text (General)</td><td>-</td><td
						>Gross monthly salary pertains only to full-time permanently
						employed graduates. It comprises basic salary, overtime payments,
						commissions, fixed allowances, and other regular cash payments,
						before deductions of the employee’s CPF contributions and personal
						income tax. Employer’s CPF contributions, bonuses, stock options,
						lump sum payments, and payments-in-kind are excluded.</td
					></tr
				></tbody
			>
		</table>
		<p>
			**For caveats related to individual datasets, refer to the source material
			from MOE as they vary over time. In general, data on law, medicine,
			pharmacy and architecture graduates are obtained from a follow-up survey
			after graduates have completed their one-year practical law
			course/pupillage/housemanship/first-year residency/practical training.
		</p>
	</div>

	<div class="space-y-2">
		<h1 class="text-xl font-semibold">Downloads</h1>
		<p>Last updated at: {new Date().toLocaleDateString()}</p>
		<button
			class="flex px-2 py-3 border rounded-md border-blue-500 items-center w-full"
			on:click={() =>
				downloadFromURL(
					"https://raw.githubusercontent.com/hewliyang/studywhat/main/src/lib/data.json"
				)}
		>
			<span>JSON</span>
			<a
				href="https://raw.githubusercontent.com/hewliyang/studywhat/main/src/lib/data.json"
				class="text-blue-600 underline ml-3 text-xs font-semibold"
				>source: GitHub</a
			>
			<ArrowRight class="h-4 w-4 ml-auto" />
		</button>
		<button
			class="flex px-2 py-3 border rounded-md border-blue-500 items-center w-full"
			on:click={() => downloadAsCSV(getFlattened(), "studywhat")}
		>
			<span>CSV</span>
			<ArrowRight class="h-4 w-4 ml-auto" />
		</button>
	</div>

	<div class="space-y-2">
		<h1 class="text-xl font-semibold">Open Source</h1>
		<p>This project is open source & is accepting contributions.</p>
		<p>
			<a
				href="https://github.com/hewliyang/studywhat"
				class="text-blue-600 font-semibold">Repository (Web)</a
			>: Contains the source code of the web app (SvelteKit)
		</p>
		<p>
			<a
				href="https://github.com/hewliyang/ges-report-to-csv"
				class="text-blue-600 font-semibold">Repository (PDF Scraper)</a
			>: Contains miscallaneous scripts used for scraping tables for PDFs
			sourced from the Ministry of Education
		</p>
	</div>
</section>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		border-radius: 10px;
		overflow-x: scroll;
	}

	@media (max-width: 767px) {
		table {
			max-width: 100%;
			margin: 0;
			display: block;
			overflow-x: auto;
			white-space: nowrap;
		}
	}

	th,
	td {
		padding: 8px;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f2f2f2;
		font-weight: bold;
	}

	tr:nth-child(even) {
		background-color: #f2f2f2;
	}

	tr:hover {
		background-color: #e6e6e6;
	}

	th:first-child {
		border-top-left-radius: 10px;
	}

	th:last-child {
		border-top-right-radius: 10px;
	}

	tr:last-child td:first-child {
		border-bottom-left-radius: 10px;
	}

	tr:last-child td:last-child {
		border-bottom-right-radius: 10px;
	}
</style>
