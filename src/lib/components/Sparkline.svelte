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

	const WIDTH = 120;
	const HEIGHT = 36;
	const PADDING = 2;

	const salaryData = $derived(
		record.data.filter((entry) => entry.gross_monthly_median != null)
	);
	const firstIncome = $derived(salaryData[0]?.gross_monthly_median ?? 0);
	const points = $derived(
		salaryData.map((entry) => ({
			year: entry.year,
			value: (entry.gross_monthly_median ?? firstIncome) - firstIncome,
		}))
	);
	const minIncome = $derived(points.length > 0 ? Math.min(...points.map((point) => point.value)) : 0);
	const maxIncome = $derived(points.length > 0 ? Math.max(...points.map((point) => point.value)) : 0);
	const minYear = $derived(points.length > 0 ? Math.min(...points.map((point) => point.year)) : refYear);
	const maxYear = $derived(points.length > 0 ? Math.max(...points.map((point) => point.year)) : refYear);
	const gradientId = $derived(`${record.slug}-sparkline-gradient`);
	const isPositive = $derived(record.pctChange > 0);
	const lineColor = $derived(isPositive ? "#16a34a" : "#dc2626");

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
	class="sparkline-card"
	href="/degree/{record.slug}"
>
	<div class="sparkline-info">
		<span class="sparkline-uni">{long2short[record.university]}</span>
		<span class="sparkline-degree">{record.degree}</span>
		<span class="sparkline-change" class:positive={isPositive} class:negative={!isPositive}>
			{isPositive ? "+" : ""}{record.pctChange.toFixed(1)}%
		</span>
	</div>
	<svg
		width={WIDTH}
		height={HEIGHT}
		viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
		role="img"
		aria-label={`Sparkline for ${record.degree}`}
		class="sparkline-svg"
	>
		<defs>
			<linearGradient id={gradientId} gradientTransform="rotate(90)">
				<stop offset="0%" stop-color={lineColor} stop-opacity="0.3" />
				<stop offset="100%" stop-color={lineColor} stop-opacity="0" />
			</linearGradient>
		</defs>
		<path d={areaPath} fill={`url(#${gradientId})`}></path>
		<path
			d={linePath}
			stroke={lineColor}
			stroke-width="1.5"
			fill="none"
			stroke-linejoin="round"
			stroke-linecap="round"
		></path>
	</svg>
</a>

<style>
	.sparkline-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		border: 1px solid #e8e5df;
		border-radius: 8px;
		background: #ffffff;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s, box-shadow 0.15s;
		flex-shrink: 0;
		min-width: 260px;
		width: min(260px, calc(100vw - 64px));
	}

	.sparkline-card:hover {
		border-color: #d4d0c8;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.sparkline-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
		flex: 1;
	}

	.sparkline-uni {
		font-size: 10px;
		font-weight: 600;
		color: #71717a;
		letter-spacing: 0.02em;
	}

	.sparkline-degree {
		font-size: 11px;
		color: #1a1a1a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	.sparkline-change {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 600;
	}

	.sparkline-change.positive {
		color: #16a34a;
	}

	.sparkline-change.negative {
		color: #dc2626;
	}

	.sparkline-svg {
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.sparkline-card {
			gap: 8px;
			padding: 8px 10px;
			width: min(240px, calc(100vw - 56px));
		}

		.sparkline-degree {
			max-width: 118px;
		}
	}
</style>
