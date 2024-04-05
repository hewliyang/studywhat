<script lang="ts">
	import { CurveType } from "@unovis/ts";
	import { long2short } from "$lib/constants";
	import { VisXYContainer, VisArea, VisLine } from "@unovis/svelte";

	import type { WinnersRecord, YearlyRecord } from "$lib/types";

	export let record: WinnersRecord;
	export let refYear: number = 2023;

	function getSVGDefs(pctChange: number) {
		const color = pctChange > 0 ? "#00bf72" : "#ff0000";
		const id = pctChange > 0 ? "red-gradient" : "green-gradient";
		const gradient = `
		<linearGradient id="${id}" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="${color}" stop-opacity="1" />
			<stop offset="25%" stop-color="${color}" stop-opacity="0.8" />
			<stop offset="50%" stop-color="${color}" stop-opacity="0.6" />
			<stop offset="75%" stop-color="${color}" stop-opacity="0.4" />
			<stop offset="100%" stop-color="${color}" stop-opacity="0" />
		</linearGradient>
		`;
		return { id, gradient };
	}

	const { id, gradient } = getSVGDefs(record.pctChange);

	// reference line
	// (refYear - 1, 0) -> (refYear - 1, max(gross_monthly_median))
	$: maxIncome = Math.max(
		...record.data.map((obj) => obj.gross_monthly_median)
	);

	$: x = (d: YearlyRecord) => d.year;
	$: y = (d: YearlyRecord) => d.gross_monthly_median;
</script>

<a
	class="flex space-x-2 items-center border rounded-lg p-1 shadow-sm hover:scale-[102%] transition-all"
	href="/degree/{record.slug}"
>
	<div class="flex flex-col text-xs p-1">
		<div class="font-bold">{long2short[record.university]}</div>
		<div class="overflow-x-auto">{record.degree}</div>
		<div class={record.pctChange > 0 ? "text-green-500" : "text-red-500"}>
			{record.pctChange > 0 ? "+" : ""}{record.pctChange.toFixed(2)}%
		</div>
	</div>
	<VisXYContainer
		svgDefs={gradient}
		class="area-container"
		width={144}
		height={44}
	>
		<VisArea
			data={record.data}
			{x}
			{y}
			color="url(#{id})"
			opacity="0.5"
			curveType={CurveType.Linear}
		/>
		<VisLine
			data={[
				{ year: refYear - 1, value: 0 },
				{ year: refYear - 1, value: maxIncome },
			]}
			lineDashArray={[5]}
			color="gray"
			x={(d) => d.year}
			y={(d) => d.value}
		/>
	</VisXYContainer>
</a>
