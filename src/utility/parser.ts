import XLSX from "xlsx";
import { Schedule } from "./schedule";

class ParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ParseError";
		this.message = message;
	}
}

function parseSheet(sheet: XLSX.Sheet): Schedule {
	if (!sheet["!data"]) throw new ParseError("Sheet is empty");

	// Find the row of the column headers for each piece of data,
	// since variations of the spreadsheet exist where this can be in
	// different places
	let headerRow;
	for (let r = 0; r < sheet["!data"].length; r++) {
		const row = sheet["!data"][r];
		if (row[0].v === "My Enrolled Courses") {
			headerRow = r + 2;
			break;
		}
	}

	if (!headerRow) throw new ParseError("Unable to find the header row");

	// TODO: Find appropriate columns for each piece of information
	// TODO: For each row of information, create a new section
	// TODO: Format event name as "{Course ID} {Instructional Format}"
	// TODO: Extract meeting pattern, start time, end time, and location from "Meeting Patterns" column

	return new Schedule();
}
