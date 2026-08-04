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

export interface ScheduleOverride {
	date: DateTime;
	schedule?: string;
	name?: string;
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
	toICalendar(overrides: ScheduleOverride[] = []): string {
		const generatedCalendar = ical();

		generatedCalendar.timezone({
			name: "America/New_York",
			generator: (tz) => tzlib_get_ical_block(tz)[0],
		});

		// Create override events for each override with a name
		for (const override of overrides) {
			if (!override.name) continue;

			generatedCalendar.createEvent({
				summary: override.name,
				timezone: "America/New_York",
				start: override.date.startOf("day"),
				allDay: true,
			});
		}

		for (const section of this._sections) {
			if (!section.allDay && (!section.end || !section.days)) {
				throw new Error(
					"Invalid section: missing end date or days for a non all-day event",
				);
			}

			const weekdays = section.days?.map(
				(day) =>
					[
						ICalWeekday.MO,
						ICalWeekday.TU,
						ICalWeekday.WE,
						ICalWeekday.TH,
						ICalWeekday.FR,
						ICalWeekday.SA,
						ICalWeekday.SU,
					][day - 1],
			);

			const overrideDates: DateTime[] = [];

			// Add exclusions
			for (const override of overrides) {
				// Overrides with no schedule are just for adding events
				if (override.schedule === undefined) continue;

				// Exclusion is not needed if the override is outside the section's date range
				if (
					override.date < section.start.startOf("day") ||
					override.date > section.lastDate.endOf("day")
				) {
					continue;
				}

				overrideDates.push(
					section.start.set({
						day: override.date.day,
						month: override.date.month,
						year: override.date.year,
					}),
				);

				if (override.schedule === undefined) continue;
				if (override.schedule === "None") continue;

				// Explanation for below:
				// If our override wants a Tuesday schedule on a date that is a Wednesday, and
				// the section *does* take place on a Tuesday normally, we should create a calendar
				// event for that section on that specific Wednesday by date.

				const weekdayMap: Record<string, Weekdays> = {
					M: Weekdays.Monday,
					T: Weekdays.Tuesday,
					W: Weekdays.Wednesday,
					H: Weekdays.Thursday,
					F: Weekdays.Friday,
					S: Weekdays.Saturday,
					U: Weekdays.Sunday,
				};

				const sourceWeekday = weekdayMap[override.schedule];

				if (!sourceWeekday) {
					console.warn(`Invalid override schedule: ${override.schedule}`);
					continue;
				}

				if (!section.days) {
					console.warn(
						`Section ${section.name} has no days defined, ignoring.`,
					);
					continue;
				}

				// If the override's requested weekday is not in the section's weekday, no event should be made.
				if (!section.days.includes(sourceWeekday)) continue;

				const alternateStart = section.start.set({
					day: override.date.day,
					month: override.date.month,
					year: override.date.year,
				});

				const alternateEnd = section.end?.set({
					day: override.date.day,
					month: override.date.month,
					year: override.date.year,
				});

				generatedCalendar.createEvent({
					summary: section.name,
					description: section.description,
					location: section.location,
					timezone: "America/New_York",
					allDay: section.allDay,
					start: alternateStart,
					end: alternateEnd,
				});
			}

			generatedCalendar.createEvent({
				summary: section.name,
				description: section.description,
				location: section.location,
				timezone: "America/New_York",
				allDay: section.allDay,
				start: section.start,
				end: section.end,
				repeating: {
					freq: ICalEventRepeatingFreq.DAILY,
					byDay: weekdays,
					until: section.lastDate,
					exclude: overrideDates,
				},
			});
		}

		return generatedCalendar.toString();
	}
}
