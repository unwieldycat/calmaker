import { describe, expect, it, test } from "vitest";
import { findColumns, ParseError, parseTimeString } from "./parser";

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
			"Invalid header row index"
		);
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
