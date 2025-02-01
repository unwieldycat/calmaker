import { Sheet } from "xlsx";
import { Schedule } from "./schedule";

function parseSheet(sheet: Sheet): Schedule {
	return new Schedule();
}
