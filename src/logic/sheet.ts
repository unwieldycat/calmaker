import XLSX from "xlsx";

export type CellValue = string | number | boolean | Date | null;

/**
 * Turn an XLSX Worksheet into a 2D array.
 *
 * This exists because sheet_to_json with header = 1 inexplicably doesn't work sometimes.
 *
 * @param sheet XLSX Worksheet
 * @returns 2D array of sheet data
 */
export function sheetToArray(sheet: XLSX.WorkSheet): CellValue[][] {
	if (!sheet["!data"]) throw new Error("No sheet data");

	const data: CellValue[][] = [];

	for (const sheetRow of sheet["!data"]) {
		const row: CellValue[] = [];

		for (const i in sheetRow) {
			if (sheetRow[i]?.v) row[i] = sheetRow[i].v;
			else row[i] = null;
		}

		data.push(row);
	}

	return data;
}
