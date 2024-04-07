export type HistDatum = {
	idx: number;
	bin: string;
	freq: number;
};

/**
 *
 * @param a1 array containing the x axis values
 * @param a2 array containing the y axis values
 * @returns array of objects for histogram {idx: number, bin: string, freq: number}
 */
export function zip(a1: any[], a2: any[]) {
	if (a1.length !== a2.length) return [];

	const res: HistDatum[] = [];
	let curIdx = 1;

	a1.forEach((ele, idx) => {
		const obj = {
			idx: curIdx,
			bin: ele,
			freq: a2[idx],
		};
		curIdx++;
		res.push(obj);
	});

	return res;
}

/**
 * Takes a SORTED array `a` and computes the median
 */
export function median(a: number[]) {
	const len = a.length;
	const mid = Math.floor(len / 2);

	if (len % 2 !== 0) return a[mid];
	return (a[mid - 1] + a[mid]) / 2;
}

/**
 * Takes an array of int/float and computes the quantiles
 */
export function quantiles(a: number[]) {
	const sorted = [...a].sort((x, y) => x - y);
	const len = sorted.length;
	const mid = Math.floor(len / 2);

	return {
		q1: median(sorted.slice(0, mid)),
		q2: median(sorted),
		q3: median(sorted.slice(mid + 1)),
	};
}

export function mean(a: number[]) {
	const sum = a.reduce((a, b) => a + b, 0);
	return sum / a.length;
}

export function variance(a: number[]) {
	const mu = mean(a);
	const N = a.length;

	let sum = 0;
	for (const x_i of a) {
		sum += (x_i - mu) ** 2;
	}

	return sum / N;
}
