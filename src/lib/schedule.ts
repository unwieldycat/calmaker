import { CalendarOptions, ICalendar } from "datebook";

export enum Weekdays {
	Sunday = 1,
	Monday = 2,
	Tuesday = 3,
	Wednesday = 4,
	Thursday = 5,
	Friday = 6,
	Saturday = 7,
}

export interface Section {
	/** Name of the section */
	name: string;

	/** Location of the section */
	location: string;

	/** Description of the section */
	description: string;

	/** Days to repeat on */
	days: Weekdays[];

	/** Start of first section */
	start: Date;

	/** End of first section */
	end: Date;

	/** Last date of the event */
	lastDate: Date;
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
	 * Add a new section to the schedule
	 * @param section Section to add to the schedule
	 */
	addSection(section: Section) {
		this._sections.push(section);
	}

	/**
	 * Convert the schedule to an array of calendar options
	 * @returns Array of calendar options
	 */
	toCalendarOptions(): CalendarOptions[] {
		const events: CalendarOptions[] = [];

		for (const section of this._sections) {
			const weekdays = section.days.map(
				(id) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][id]
			);

			const event: CalendarOptions = {
				title: section.name,
				location: section.location,
				description: section.description,
				start: section.start,
				end: section.end,
				recurrence: {
					frequency: "DAILY",
					weekdays: weekdays,
					end: section.lastDate,
				},
			};

			events.push(event);
		}

		return events;
	}

	/**
	 * Convert the schedule to an ICalendar object
	 * @returns An ICalendar object
	 */
	toICalendar(): ICalendar {
		const options = this.toCalendarOptions();
		const calendar = new ICalendar(options[0]);

		for (const option of options.slice(1)) {
			calendar.addEvent(new ICalendar(option));
		}

		return calendar;
	}
}
