import { describe, expect, it, test } from "vitest";
import { findColumns, ParseError } from "./parser";

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
