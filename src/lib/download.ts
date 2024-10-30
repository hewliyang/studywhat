import { browser } from "$app/environment";

function saveAs(url: string, fileName: string) {
	if (!browser) return;
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

const DEFAULT_FILE_NAME = "data";

export function downloadAsJSON(
	rows: any[],
	fileName: string = DEFAULT_FILE_NAME
) {
	if (!browser) return;

	const blob = new Blob([JSON.stringify(rows, null, 4)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	saveAs(url, `${fileName}.json`);
}

export function downloadAsCSV(
	rows: any[],
	fileName: string = DEFAULT_FILE_NAME
) {
	if (!browser) return;
	if (rows.length === 0) return;
	const headers = Object.keys(rows[0]).join(",");
	const csvRows = rows
		.map((row) => {
			const rowValues = Object.values(row).map((value: any) => {
				// handle values where there is already a comma inside
				const escaped = value ? value.toString().replace("/,/g", "\\,") : "";
				return `"${escaped}"`;
			});
			return rowValues.join(",");
		})
		.join("\n");
	const csvData = `${headers}\n${csvRows}`;
	const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	saveAs(url, `${fileName}.csv`);
}

export async function downloadFromURL(
	url: string,
	fileName: string = "studywhat"
) {
	if (!browser) return;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch data from ${url}`);
	}

	const data = await response.json();
	const blob = new Blob([JSON.stringify(data, null, 4)], {
		type: "application/json",
	});
	const blobUrl = URL.createObjectURL(blob);
	saveAs(blobUrl, `${fileName}.json`);
}
