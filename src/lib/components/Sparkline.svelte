<script lang="ts">
	import { long2short } from "$lib/constants";
	import type { WinnersRecord } from "$lib/types";
	import { VisXYContainer, VisArea, VisLine } from "@unovis/svelte";
	import { CurveType } from "@unovis/ts";

	export let record: WinnersRecord;

	$: svgDefsGreen = `
		<linearGradient id="gradient" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="#00bf72" stop-opacity="1" />
			<stop offset="25%" stop-color="#00bf72" stop-opacity="0.8" />
			<stop offset="50%" stop-color="#00bf72" stop-opacity="0.6" />
			<stop offset="75%" stop-color="#00bf72" stop-opacity="0.4" />
			<stop offset="100%" stop-color="#00bf72" stop-opacity="0" />
		</linearGradient>
	`;

	$: svgDefsRed = `
		<linearGradient id="gradient" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="#ff0000" stop-opacity="1" />
			<stop offset="25%" stop-color="#ff0000" stop-opacity="0.8" />
			<stop offset="50%" stop-color="#ff0000" stop-opacity="0.6" />
			<stop offset="75%" stop-color="#ff0000" stop-opacity="0.4" />
			<stop offset="100%" stop-color="#ff0000" stop-opacity="0" />
		</linearGradient>
	`;

	$: svgDefs = record.pctChange > 0 ? svgDefsGreen : svgDefsRed;

	// prev year
	$: prevYearValue = record.data[record.data.length - 2].gross_monthly_median;
	$: minYear = record.data[0].year;
	$: maxYear = record.data[record.data.length - 1].year;

	type T = (typeof record.data)[0];

	$: x = (d: T) => d.year;
	$: y = (d: T) => d.gross_monthly_median;
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
	<div class="w-[144px]">
		<VisXYContainer {svgDefs} class="h-[44px] area-container">
			<VisArea
				data={record.data}
				{x}
				{y}
				color={record.pctChange > 0 ? "url(#gradient)" : "red"}
				opacity="0.5"
				curveType={CurveType.Natural}
			/>
			<VisLine
				data={[
					{ year: minYear, value: prevYearValue },
					{ year: maxYear, value: prevYearValue },
				]}
				lineDashArray={[5]}
				color="gray"
				x={(d) => d.year}
				y={(d) => d.value}
			/>
		</VisXYContainer>
	</div>
</a>
