<script lang="ts">
	import { long2short } from "$lib/constants";
	import type { WinnersRecord } from "$lib/types";

	let {
		record,
		refYear = 2023,
	}: {
		record: WinnersRecord;
		refYear?: number;
	} = $props();

	const WIDTH = 144;
	const HEIGHT = 44;
	const PADDING = 2;

	const firstIncome = $derived(record.data[0].gross_monthly_median);
	const points = $derived(
		record.data.map((entry) => ({
			year: entry.year,
			value: entry.gross_monthly_median - firstIncome,
		}))
	);
	const minIncome = $derived(Math.min(...points.map((point) => point.value)));
	const maxIncome = $derived(Math.max(...points.map((point) => point.value)));
	const minYear = $derived(Math.min(...points.map((point) => point.year)));
	const maxYear = $derived(Math.max(...points.map((point) => point.year)));
	const gradientId = $derived(`${record.slug}-sparkline-gradient`);
	const lineColor = $derived(record.pctChange > 0 ? "#00bf72" : "#ff0000");

	function scaleX(year: number, min: number, max: number): number {
		if (min === max) return WIDTH / 2;
		return PADDING + ((year - min) / (max - min)) * (WIDTH - PADDING * 2);
	}

	function scaleY(value: number, min: number, max: number): number {
		if (min === max) return HEIGHT / 2;
		return HEIGHT - PADDING - ((value - min) / (max - min)) * (HEIGHT - PADDING * 2);
	}

	const plottedPoints = $derived(
		points.map((point) => ({
			x: scaleX(point.year, minYear, maxYear),
			y: scaleY(point.value, minIncome, maxIncome),
		}))
	);

	const baselineY = $derived(scaleY(0, minIncome, maxIncome));
	const refX = $derived(scaleX(refYear, minYear, maxYear));

	const linePath = $derived(
		plottedPoints
			.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
			.join(" ")
	);

	const areaPath = $derived.by(() => {
		if (plottedPoints.length === 0) return "";
		const first = plottedPoints[0];
		const last = plottedPoints[plottedPoints.length - 1];

		return `M ${first.x} ${baselineY} ${plottedPoints
			.map((point) => `L ${point.x} ${point.y}`)
			.join(" ")} L ${last.x} ${baselineY} Z`;
	});
</script>

<a
	class="flex space-x-2 items-center border rounded-lg p-1 shadow-sm hover:scale-[102%] transition-all"
	href="/degree/{record.slug}"
>
	<div class="flex flex-col text-xs p-1">
		<div class="font-bold">{long2short[record.university]}</div>
		<div>{record.degree}</div>
		<div
			class="font-semibold {record.pctChange > 0
				? 'text-green-500'
				: 'text-red-500'}"
		>
			{record.pctChange > 0 ? "+" : ""}{record.pctChange.toFixed(2)}%
		</div>
	</div>
	<svg
		class="area-container"
		width={WIDTH}
		height={HEIGHT}
		viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
		role="img"
		aria-label={`Sparkline for ${record.degree}`}
	>
		<defs>
			<linearGradient id={gradientId} gradientTransform="rotate(90)">
				<stop offset="0%" stop-color={lineColor} stop-opacity="1" />
				<stop offset="25%" stop-color={lineColor} stop-opacity="0.8" />
				<stop offset="50%" stop-color={lineColor} stop-opacity="0.6" />
				<stop offset="75%" stop-color={lineColor} stop-opacity="0.4" />
				<stop offset="100%" stop-color={lineColor} stop-opacity="0" />
			</linearGradient>
		</defs>

		<path d={areaPath} fill={`url(#${gradientId})`} opacity="0.5"></path>
		<path
			d={`M ${refX} ${scaleY(minIncome, minIncome, maxIncome)} L ${refX} ${scaleY(maxIncome, minIncome, maxIncome)}`}
			stroke="gray"
			stroke-width="1.1"
			stroke-dasharray="5"
			fill="none"
		></path>
		<path
			d={`M ${scaleX(minYear, minYear, maxYear)} ${baselineY} L ${scaleX(maxYear, minYear, maxYear)} ${baselineY}`}
			stroke="gray"
			stroke-width="1.1"
			stroke-dasharray="5"
			fill="none"
		></path>
		<path
			d={linePath}
			stroke={lineColor}
			stroke-width="1.1"
			fill="none"
			stroke-linejoin="round"
			stroke-linecap="round"
		></path>
	</svg>
</a>
