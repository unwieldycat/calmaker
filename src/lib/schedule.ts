import ical, {
	ICalCalendarMethod,
	ICalEventRepeatingFreq,
	ICalWeekday,
} from "ical-generator";
import { DateTime } from "luxon";
import { tzlib_get_ical_block } from "timezones-ical-library";

export enum Weekdays {
	Sunday = 7,
	Monday = 1,
	Tuesday = 2,
	Wednesday = 3,
	Thursday = 4,
	Friday = 5,
	Saturday = 6,
}

export interface Section {
	/** Name of the section */
	name: string;

	/** Location of the section */
	location?: string;

	/** Description of the section */
	description: string;

	/** Days to repeat on */
	days?: Weekdays[];

	/** Start of first section */
	start: DateTime;

	/** End of first section */
	end?: DateTime;

	/** Whether the event is an all day event. If true ignore end date, days, etc. */
	allDay: boolean;

	/** Last date of the event */
	lastDate: DateTime;
}

export class Schedule {
	private _sections: Section[];

	/**
	 * Create a new schedule
	 */
	constructor() {
		this._sections = [];
	}

	/**
	 * Get the sections in the schedule
	 * @returns An array of sections
	 */
	getSections(): Section[] {
		return this._sections;
	}

	/**
	 * Add a new section to the schedule
	 * @param section Section to add to the schedule
	 */
	addSection(section: Section) {
		this._sections.push(section);
	}

	/**
	 * Convert the schedule to an ICalendar object
	 * @returns An ICS-formatted string
	 */
	toICalendar(): string {
		const generatedCalendar = ical();

		generatedCalendar.timezone({
			name: "America/New_York",
			generator: (tz) => tzlib_get_ical_block(tz)[0],
		});

		for (const section of this._sections) {
			if (!section.allDay) {
				if (!section.end || !section.days) {
					throw new Error(
						"Invalid section: missing end date or days for a non all-day event",
					);
				}

				const weekdays = section.days.map(
					(id) =>
						[
							ICalWeekday.MO,
							ICalWeekday.TU,
							ICalWeekday.WE,
							ICalWeekday.TH,
							ICalWeekday.FR,
							ICalWeekday.SA,
							ICalWeekday.SU,
						][id - 1],
				);

				generatedCalendar.createEvent({
					summary: section.name,
					description: section.description,
					location: section.location,
					timezone: "America/New_York",
					start: section.start,
					end: section.end,
					repeating: {
						freq: ICalEventRepeatingFreq.DAILY,
						byDay: weekdays,
						until: section.lastDate,
					},
				});
			} else {
				generatedCalendar.createEvent({
					summary: section.name,
					description: section.description,
					location: section.location,
					timezone: "America/New_York",
					start: section.start,
					allDay: true,
					repeating: {
						freq: ICalEventRepeatingFreq.DAILY,
						until: section.lastDate,
					},
				});
			}
		}

		return generatedCalendar.toString();
	}
}
