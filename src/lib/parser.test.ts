import { describe, expect, it } from "vitest";
import {
	findColumns,
	findHeaderRows,
	parseSheet,
	ParseError,
	parseTimeString,
} from "./parser";
import { DateTime } from "luxon";
import { Schedule } from "./schedule";

describe("parser", () => {
	describe("findColumns", async () => {
		const sheetData = [
			["A", "B", "C"],
			["1", "2", "3"],
		];

		it("should find columns A, B and C", () => {
			const columns = findColumns(["A", "B", "C"], 0, sheetData);
			expect(columns).toEqual({ A: 0, B: 1, C: 2 });
		});

		it("should not find nonexistant column D", () => {
			expect(() => findColumns(["D"], 0, sheetData)).toThrow(ParseError);
		});

		it("should error if header row is invalid", () => {
			expect(() => findColumns(["A"], 2, sheetData)).toThrow(
				"Invalid header row index",
			);
		});
	});

	describe("findHeaderRows", async () => {
		it("should find one header row", () => {
			const sheetData = [
				["irrelevant"],
				["My Enrolled Courses"],
				["meta row"],
				["Course Listing"],
			];

			expect(findHeaderRows(sheetData)).toEqual([3]);
		});

		it("should find multiple header rows", () => {
			const sheetData = [
				["My Enrolled Courses"],
				["meta row"],
				["Course Listing"],
				["other data"],
				["My Enrolled Courses"],
				["meta row"],
				["Course Listing"],
			];

			expect(findHeaderRows(sheetData)).toEqual([2, 6]);
		});

		it("should error if no header rows are found", () => {
			expect(() => findHeaderRows([["A"], ["B"]])).toThrow(ParseError);
		});
	});

	describe("parseTimeString", async () => {
		it("should parse 12:00 AM", () => {
			expect(parseTimeString("12:00 AM")).toEqual([0, 0]);
		});

		it("should parse 12:00 PM", () => {
			expect(parseTimeString("12:00 PM")).toEqual([12, 0]);
		});

		it("should parse 1:30 PM", () => {
			expect(parseTimeString("1:30 PM")).toEqual([13, 30]);
		});

		it("should parse 1:30 AM", () => {
			expect(parseTimeString("1:30 AM")).toEqual([1, 30]);
		});

		it("should parse 11:59 PM", () => {
			expect(parseTimeString("11:59 PM")).toEqual([23, 59]);
		});

		it("should error on invalid time", () => {
			expect(() => parseTimeString("13:00 PM")).toThrow("Invalid time string");
		});
	});

	describe("parseSheet", async () => {
		it("should parse a section row and stop at end-of-row marker", async () => {
			const sheetData = [
				["My Enrolled Courses"],
				["meta row"],
				[
					"Course Listing",
					"Instructional Format",
					"Meeting Patterns",
					"Start Date",
					"End Date",
					"Instructor",
				],
				[
					"CS 1110 - Intro to Programming",
					"LEC",
					"M-W-F | 1:00 PM - 1:50 PM | Rice Hall",
					DateTime.fromISO("2026-01-12"),
					DateTime.fromISO("2026-04-30"),
					"Grace Hopper",
				],
				["My Completed Courses"],
				[
					"CS 2100 - Should Not Parse",
					"LEC",
					"T-R | 2:00 PM - 3:15 PM | Olsson Hall",
					DateTime.fromISO("2026-01-13"),
					DateTime.fromISO("2026-04-30"),
					"Alan Turing",
				],
			];

			const parsed = await parseSheet(sheetData);

			expect(parsed[1]).toEqual([]);

			const sections = parsed[0].getSections();

			expect(sections).toHaveLength(1);

			const section = sections[0];

			expect(section.name).toBe("CS 1110 LEC");
			expect(section.description).toBe(
				"Intro to Programming with Grace Hopper",
			);

			expect(section.location).toBe("Rice Hall");
			expect(section.days).toEqual([1, 3, 5]);

			expect(section.start.weekday).toBe(1);
			expect(section.start.hour).toBe(13);
			expect(section.start.minute).toBe(0);

			expect(section.end?.hour).toBe(13);
			expect(section.end?.minute).toBe(50);
		});

		it("should skip malformed rows and continue parsing", async () => {
			const sheetData = [
				["My Enrolled Courses"],
				["meta row"],
				[
					"Course Listing",
					"Instructional Format",
					"Meeting Patterns",
					"Start Date",
					"End Date",
					"Instructor",
				],
				[
					1234,
					"LEC",
					"M-W | 9:00 AM - 10:15 AM | New Cabell",
					DateTime.fromISO("2026-01-13"),
					DateTime.fromISO("2026-04-30"),
					"Invalid Row",
				],
				[
					"STAT 2120 - Intro to Regression",
					"LEC",
					"T-R | 2:00 PM - 3:15 PM | New Cabell",
					DateTime.fromISO("2026-01-13"),
					DateTime.fromISO("2026-04-30"),
					"Valid Instructor",
				],
			];

			const result = await parseSheet(sheetData);

			expect(result).toEqual([
				expect.any(Schedule),
				expect.arrayContaining([
					new ParseError("courseName: Expected string, got number"),
				]),
			]);

			expect(result[0].getSections()).toHaveLength(1);
		});

		it("should handle sections with no meeting patterns", async () => {
			const sheetData = [
				["My Enrolled Courses"],
				["meta row"],
				[
					"Course Listing",
					"Instructional Format",
					"Meeting Patterns",
					"Start Date",
					"End Date",
					"Instructor",
				],
				[
					"PC 1000 - Project Center",
					"LEC",
					null,
					DateTime.fromISO("2026-01-12"),
					DateTime.fromISO("2026-05-06"),
					"John Doe",
				],
			];

			const result = await parseSheet(sheetData);

			expect(result[1]).toEqual([]);

			const sections = result[0].getSections();

			expect(sections).toHaveLength(0);
		});
	});
});
