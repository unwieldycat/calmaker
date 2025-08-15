import { DateTime } from "luxon";
import { WorkSheet } from "xlsx";

export type CellValue = string | number | boolean | DateTime | null;

/**
 * Turn an XLSX Worksheet into a 2D array.
 *
 * This exists because sheet_to_json with header = 1 inexplicably doesn't work sometimes.
 *
 * @param sheet XLSX Worksheet
 * @returns 2D array of sheet data
 */
export function sheetToArray(sheet: WorkSheet): CellValue[][] {
	if (!sheet["!data"]) throw new Error("No sheet data");

	const data: CellValue[][] = [];

	for (const sheetRow of sheet["!data"]) {
		const row: CellValue[] = [];

		for (const i in sheetRow) {
			if (sheetRow[i]?.v instanceof Date) {
				const jsDate = sheetRow[i].v;

				// SheetJS sets the Date as if the value were UTC, but it
				// should in fact be in America/New_York. This causes some off
				// by one date issues sometimes.
				const asDateTime = DateTime.fromObject(
					{
						year: jsDate.getUTCFullYear(),
						month: jsDate.getUTCMonth() + 1,
						day: jsDate.getUTCDate(),
					},
					{ zone: "America/New_York" }
				);

				row[i] = asDateTime;
			} else if (sheetRow[i]?.v) {
				row[i] = sheetRow[i].v;
			} else {
				row[i] = null;
			}
		}

		data.push(row);
	}

	return data;
}
