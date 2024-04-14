import saveAs from "file-saver";
import { browser } from "$app/environment";

export function downloadAsJSON(rows: any[], fileName: string = "data") {
	if (!browser) return;

	const blob = new Blob([JSON.stringify(rows, null, 4)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	saveAs(url, `${fileName}.json`);
}

export function downloadAsCSV(rows: any[], fileName: string = "data") {
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
