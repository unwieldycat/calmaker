import XLSX from "xlsx";
import { Schedule } from "./schedule";

/**
 * Error thrown when parsing fails
 */
export class ParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ParseError";
		this.message = message;
	}
}

/**
 * Find the header row in the sheet data
 * @param sheetData 2D array of strings representing the sheet data
 * @returns Header row index
 */
function findHeaderRow(sheetData: string[][]): number {
	let headerRow;
	for (let r = 0; r < sheetData.length; r++) {
		const row = sheetData[r];
		if (row[0] === "My Enrolled Courses") {
			headerRow = r + 2;
			break;
		}
	}
	if (!headerRow) throw new ParseError("Unable to find the header row");
	return headerRow;
}

/**
 * Parse a sheet into a schedule
 * @param sheet XLSX Worksheet to parse
 * @returns A schedule object
 */
export function parseSheet(sheet: XLSX.WorkSheet): Schedule {
	const sheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
	const headerRow = findHeaderRow(sheetData);

	// Find the columns for each piece of data
	let courseListingColumn,
		meetingPatternsColumn,
		instructionalFormatColumn,
		startDateColumn,
		endDateColumn;

	for (let c = 0; c < sheetData[headerRow].length; c++) {
		const cell = sheetData[headerRow][c];
		switch (cell) {
			case "Course Listing":
				courseListingColumn = c;
				break;

			case "Instructional Format":
				instructionalFormatColumn = c;
				break;

			case "Meeting Patterns":
				meetingPatternsColumn = c;
				break;

			case "Start Date":
				startDateColumn = c;
				break;

			case "End Date":
				endDateColumn = c;
				break;

			default:
				break;
		}
	}

	// TODO: For each row of information, create a new section
	// TODO: Format event name as "{Course ID} {Instructional Format}"
	// TODO: Extract meeting pattern, start time, end time, and location from "Meeting Patterns" column

	return new Schedule();
}
