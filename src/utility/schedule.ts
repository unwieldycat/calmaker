import { DateTime, WeekdayNumbers, Duration } from "luxon";
import { CalendarOptions, ICalendar } from "datebook";

export interface Section {
	/** Name of the section */
	name: string;

	/** Location of the section */
	location: string;

	/** Description of the section */
	description: string;

	/** Days to repeat on */
	days: WeekdayNumbers[];

	/** First start date/time */
	start: DateTime;

	/** Duration of each section */
	duration: Duration;

	/** Last date/time */
	end: DateTime;
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
			const weekdays = section.days
				.map((day) => day - 1)
				.map((id) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][id]);

			const event: CalendarOptions = {
				title: section.name,
				location: section.location,
				description: section.description,
				start: section.start.toJSDate(),
				end: section.start.plus(section.duration).toJSDate(),
				recurrence: {
					weekdays: weekdays,
					end: section.end.toJSDate(),
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
