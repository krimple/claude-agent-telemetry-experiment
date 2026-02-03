import { describe, it, expect } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";

/**
 * TDD Test Suite for utils.ts
 *
 * This test file follows a test-driven development approach.
 * Tests are written first to identify missing functionality,
 * then the implementation is fixed to make tests pass.
 */

describe("calculateAverage - TDD Approach", () => {
  describe("Basic functionality", () => {
    it("should calculate average of positive numbers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should calculate average of negative numbers", () => {
      expect(calculateAverage([-1, -2, -3])).toBe(-2);
    });

    it("should calculate average of mixed numbers", () => {
      expect(calculateAverage([-10, 10, 0])).toBe(0);
    });

    it("should handle single number array", () => {
      expect(calculateAverage([42])).toBe(42);
    });

    it("should handle decimal numbers", () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });

    it("should handle array with zeros", () => {
      expect(calculateAverage([0, 0, 0])).toBe(0);
    });

    it("should handle very large numbers without overflow", () => {
      const result = calculateAverage([Number.MAX_VALUE / 2, Number.MAX_VALUE / 2]);
      expect(result).toBe(Number.MAX_VALUE / 2);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should throw error for empty array", () => {
      expect(() => calculateAverage([])).toThrow("Cannot calculate average of an empty array");
    });

    it("should throw error for array containing NaN", () => {
      expect(() => calculateAverage([1, 2, NaN, 4])).toThrow("Cannot calculate average of array containing NaN");
    });

    it("should throw error for array containing only NaN", () => {
      expect(() => calculateAverage([NaN])).toThrow("Cannot calculate average of array containing NaN");
    });

    it("should throw error for array containing Infinity", () => {
      expect(() => calculateAverage([1, 2, Infinity])).toThrow("Cannot calculate average of array containing Infinity");
    });

    it("should throw error for array containing negative Infinity", () => {
      expect(() => calculateAverage([1, -Infinity, 3])).toThrow("Cannot calculate average of array containing Infinity");
    });

    it("should throw error when sum causes overflow", () => {
      const largeNumbers = [Number.MAX_VALUE, Number.MAX_VALUE];
      expect(() => calculateAverage(largeNumbers)).toThrow("Overflow occurred during calculation - numbers are too large");
    });

    it("should throw error for null input", () => {
      expect(() => calculateAverage(null as any)).toThrow("Input must be an array");
    });

    it("should throw error for undefined input", () => {
      expect(() => calculateAverage(undefined as any)).toThrow("Input must be an array");
    });

    it("should throw error for non-array input", () => {
      expect(() => calculateAverage("not an array" as any)).toThrow("Input must be an array");
    });

    it("should throw error for array with non-numeric values", () => {
      expect(() => calculateAverage([1, "2", 3] as any)).toThrow("All elements must be numbers");
    });

    it("should throw error for array with objects", () => {
      expect(() => calculateAverage([1, {}, 3] as any)).toThrow("All elements must be numbers");
    });
  });
});

describe("getUserName - TDD Approach", () => {
  describe("Basic functionality", () => {
    it("should return uppercase name for valid user", () => {
      expect(getUserName({ name: "john" })).toBe("JOHN");
    });

    it("should handle already uppercase names", () => {
      expect(getUserName({ name: "JANE" })).toBe("JANE");
    });

    it("should handle mixed case names", () => {
      expect(getUserName({ name: "JoHn DoE" })).toBe("JOHN DOE");
    });

    it("should trim whitespace from names", () => {
      expect(getUserName({ name: "  john  " })).toBe("JOHN");
    });

    it("should handle names with special characters", () => {
      expect(getUserName({ name: "josé-maría" })).toBe("JOSÉ-MARÍA");
    });

    it("should handle names with numbers", () => {
      expect(getUserName({ name: "user123" })).toBe("USER123");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should throw error for empty string name", () => {
      expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
    });

    it("should throw error for whitespace-only name", () => {
      expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
    });

    it("should throw error for null user", () => {
      expect(() => getUserName(null as any)).toThrow("User cannot be null or undefined");
    });

    it("should throw error for undefined user", () => {
      expect(() => getUserName(undefined as any)).toThrow("User cannot be null or undefined");
    });

    it("should throw error for user with null name", () => {
      expect(() => getUserName({ name: null as any })).toThrow("User must have a name property");
    });

    it("should throw error for user with undefined name", () => {
      expect(() => getUserName({ name: undefined as any })).toThrow("User must have a name property");
    });

    it("should throw error for user with non-string name", () => {
      expect(() => getUserName({ name: 123 as any })).toThrow("User name must be a string");
    });

    it("should throw error for user with object as name", () => {
      expect(() => getUserName({ name: {} as any })).toThrow("User name must be a string");
    });

    it("should throw error for user without name property", () => {
      expect(() => getUserName({} as any)).toThrow("User must have a name property");
    });
  });
});
