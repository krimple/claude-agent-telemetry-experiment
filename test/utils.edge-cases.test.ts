import { describe, it, expect } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";

describe("calculateAverage - Edge Cases", () => {
  it("should throw error for array with NaN values", () => {
    // NaN values are invalid input
    expect(() => calculateAverage([1, NaN, 3])).toThrow(
      "Cannot calculate average of array containing NaN"
    );
  });

  it("should throw error for array with Infinity", () => {
    // Infinity values are invalid input
    expect(() => calculateAverage([1, Infinity, 3])).toThrow(
      "Cannot calculate average of array containing Infinity"
    );
  });

  it("should throw error for array with -Infinity", () => {
    // -Infinity values are invalid input
    expect(() => calculateAverage([1, -Infinity, 3])).toThrow(
      "Cannot calculate average of array containing Infinity"
    );
  });

  it("should throw error for very large numbers that cause overflow", () => {
    // When summing very large numbers causes overflow to Infinity
    expect(() => calculateAverage([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(
      "Overflow occurred during calculation - numbers are too large"
    );
  });
});

describe("getUserName - Edge Cases", () => {
  it("should throw error for names with only whitespace", () => {
    // Whitespace-only names should be rejected
    expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
  });

  it("should handle names with newlines", () => {
    expect(getUserName({ name: "John\nDoe" })).toBe("JOHN\nDOE");
  });

  it("should handle names with tabs", () => {
    expect(getUserName({ name: "John\tDoe" })).toBe("JOHN\tDOE");
  });

  it("should handle very long names", () => {
    const longName = "a".repeat(10000);
    expect(getUserName({ name: longName })).toBe(longName.toUpperCase());
  });
});
