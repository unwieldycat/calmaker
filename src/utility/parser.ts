import XLSX from "xlsx";
import { Schedule, Section, Weekdays } from "./schedule";

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
	INSTRUCTOR = "Instructor",
}

/**
 * Find the header row in the sheet data
 * @param sheetData 2D array of strings representing the sheet data
 * @returns Header row index
 */
export function findHeaderRow(sheetData: unknown[][]): number {
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
export function findColumns(
	headerNames: string[],
	headerRow: number,
	sheetData: unknown[][]
): Record<string, number> {
	const columns: Record<string, number> = {};
	if (sheetData.length <= headerRow)
		throw new Error("Invalid header row index");

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
 * Parse sheet time string into hours and minutes
 * @param time Time string in the format "hh:mm AM/PM"
 * @returns
 */
export function parseTimeString(time: string): [number, number] {
	const matches = time.match(/(\d{1,2}):(\d{1,2}) (AM|PM)/);
	if (!matches) throw new ParseError("Failed to parse time string: " + time);

	let hours = parseInt(matches[1]);
	let minutes = parseInt(matches[2]);
	if (matches[3] === "PM") hours += 12;

	return [hours, minutes];
}

/**
 * Parse a sheet into a schedule
 * @param sheet XLSX Worksheet to parse
 * @returns A schedule object
 */
export async function parseSheet(sheet: XLSX.WorkSheet): Promise<Schedule> {
	const sheetData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
	const headerRow = findHeaderRow(sheetData);
	const dataColumns = findColumns(
		[
			Columns.COURSE_LISTING,
			Columns.INSTRUCTIONAL_FORMAT,
			Columns.MEETING_PATTERNS,
			Columns.START_DATE,
			Columns.END_DATE,
			Columns.INSTRUCTOR,
		],
		headerRow,
		sheetData
	);

	const schedule = new Schedule();

	for (let r = headerRow + 1; r < sheetData.length; r++) {
		const row = sheetData[r];
		if (row[0] === "My Dropped/Withdrawn Courses") break;

		const courseName = row[dataColumns[Columns.COURSE_LISTING]];
		if (typeof courseName != "string")
			throw new ParseError(
				"courseName: Expected string, got " + typeof courseName
			);

		const courseId = courseName.split("-")[0].trim();
		const format = row[dataColumns[Columns.INSTRUCTIONAL_FORMAT]];
		let description = courseName.split("-")[1].trim();

		const instructor = row[dataColumns[Columns.INSTRUCTOR]];
		if (instructor && typeof instructor == "string") {
			description += ` with ${instructor}`;
		}

		const meetingPatterns = row[dataColumns[Columns.MEETING_PATTERNS]];
		if (typeof meetingPatterns != "string")
			throw new ParseError(
				"meetingPatterns: Expected string, got " + typeof meetingPatterns
			);

		const splitted = meetingPatterns.split("|");
		const days = splitted[0]
			.trim()
			.split("-")
			.map((letter) => ["M", "T", "W", "R", "F"].indexOf(letter) + 2)
			.map((n) => n);

		const timeString = splitted[1].trim();

		const startTime = parseTimeString(timeString.split("-")[0].trim());
		const endTime = parseTimeString(timeString.split("-")[1].trim());

		const location = splitted[2].trim();

		const startDate = row[dataColumns[Columns.START_DATE]];
		const lastDate = row[dataColumns[Columns.END_DATE]];
		if (!(startDate instanceof Date))
			throw new ParseError("startDate is not a Date");
		if (!(lastDate instanceof Date))
			throw new ParseError("lastDate is not a Date");

		startDate.setHours(startTime[0]);
		startDate.setMinutes(startTime[1]);
		startDate.setSeconds(0);

		const endDate = new Date(startDate);
		endDate.setHours(endTime[0]);
		endDate.setMinutes(endTime[1]);
		endDate.setSeconds(0);

		schedule.addSection({
			name: `${courseId} ${format}`,
			description,
			location,
			days,
			start: startDate,
			end: endDate,
			lastDate: lastDate,
		});
	}

	return schedule;
}
