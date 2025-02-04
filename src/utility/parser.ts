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

enum Columns {
	COURSE_LISTING = "Course Listing",
	INSTRUCTIONAL_FORMAT = "Instructional Format",
	MEETING_PATTERNS = "Meeting Patterns",
	START_DATE = "Start Date",
	END_DATE = "End Date",
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
 * Find the provided columns
 * @param headerRow Header row index
 * @param headerNames Array of header names
 * @param sheetData 2D array of strings representing the sheet data
 * @returns Data column indexes
 */
function findColumns(
	headerNames: string[],
	headerRow: number,
	sheetData: string[][]
): Record<string, number> {
	const columns: Record<string, number> = {};

	for (const name of headerNames) {
		const index = sheetData[headerRow].indexOf(name);
		if (index === -1) {
			throw new ParseError(`Unable to find the ${name} column`);
		} else {
			columns[name] = index;
		}
	}

	return columns;
}

/**
 * Parse a sheet into a schedule
 * @param sheet XLSX Worksheet to parse
 * @returns A schedule object
 */
export function parseSheet(sheet: XLSX.WorkSheet): Schedule {
	const sheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
	const headerRow = findHeaderRow(sheetData);
	const dataColumns = findColumns(
		[
			Columns.COURSE_LISTING,
			Columns.INSTRUCTIONAL_FORMAT,
			Columns.MEETING_PATTERNS,
			Columns.START_DATE,
			Columns.END_DATE,
		],
		headerRow,
		sheetData
	);

	const schedule = new Schedule();

	for (let r = headerRow + 1; r < sheetData.length; r++) {
		const row = sheetData[r];
		if (row[0] === "My Dropped/Withdrawn Courses") break;

		const courseName = row[dataColumns[Columns.COURSE_LISTING]];
		const courseId = courseName.split("-")[0].trim();
		console.log(courseId);

		const format = row[dataColumns[Columns.INSTRUCTIONAL_FORMAT]];
		console.log(format);

		const meetingPatterns = row[dataColumns[Columns.MEETING_PATTERNS]];
		const splitted = meetingPatterns.split("|");
		const days = splitted[0]
			.trim()
			.split("-")
			.map((letter) => {
				return ["M", "T", "W", "R", "F"].indexOf(letter) + 2;
			});

		console.log(days);

		const startDate = row[dataColumns[Columns.START_DATE]];
		console.log(startDate);

		const endDate = row[dataColumns[Columns.END_DATE]];
		console.log(endDate);
	}

	// TODO: For each row of information, create a new section
	// TODO: Format event name as "{Course ID} {Instructional Format}"
	// TODO: Extract meeting pattern, start time, end time, and location from "Meeting Patterns" column

	return new Schedule();
}
