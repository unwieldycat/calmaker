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

	let courseListingColumn,
		meetingPatternsColumn,
		instructionalFormatColumn,
		startDateColumn,
		endDateColumn;

	for (let c = 0; c < sheet["!data"][headerRow].length; c++) {
		const cell = sheet["!data"][headerRow][c];
		switch (cell.v) {
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
