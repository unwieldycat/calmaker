import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { Schedule, Weekdays } from "./schedule";

describe("schedule", () => {
	it("excludes only real recurrence instances for overrides and adds alternate day event", () => {
		const schedule = new Schedule();

		schedule.addSection({
			name: "CS 1110 LEC",
			description: "Intro to Programming",
			location: "Room 101",
			days: [Weekdays.Monday, Weekdays.Wednesday, Weekdays.Friday],
			allDay: false,
			start: DateTime.fromISO("2026-08-31T08:00:00", {
				zone: "America/New_York",
			}),
			end: DateTime.fromISO("2026-08-31T08:50:00", {
				zone: "America/New_York",
			}),
			lastDate: DateTime.fromISO("2027-05-01T00:00:00", {
				zone: "America/New_York",
			}),
		});

		const ics = schedule.toICalendar([
			{
				// A Monday where this class normally meets; should be excluded.
				date: DateTime.fromFormat("01-18-2027", "MM-dd-yyyy", {
					zone: "America/New_York",
				}),
				// Use Monday schedule so a replacement event is added on this date.
				schedule: "M",
			},
		]);

		expect(ics).toContain("EXDATE;TZID=America/New_York:20270118T080000");
		expect(ics).toContain("DTSTART;TZID=America/New_York:20270118T080000");
	});
});
