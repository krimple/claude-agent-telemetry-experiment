import { describe, it, expect } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";

/**
 * Comprehensive test suite for utils module
 */
describe("calculateAverage", () => {
  describe("basic functionality", () => {
    it("should calculate the average of an array of numbers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should calculate the average of a single number", () => {
      expect(calculateAverage([10])).toBe(10);
      expect(calculateAverage([42])).toBe(42);
    });

    it("should handle decimal averages correctly", () => {
      expect(calculateAverage([1, 2, 3])).toBe(2);
    });

    it("should handle floating point numbers", () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBe(2.5);
    });
  });

  describe("negative numbers", () => {
    it("should handle negative numbers", () => {
      expect(calculateAverage([-5, -10, -15])).toBe(-10);
      expect(calculateAverage([-1, -2, -3])).toBe(-2);
    });

    it("should handle mixed positive and negative numbers", () => {
      expect(calculateAverage([-10, 0, 10])).toBe(0);
      expect(calculateAverage([-10, 10, 0])).toBe(0);
    });
  });

  describe("zeros", () => {
    it("should handle array with zeros", () => {
      expect(calculateAverage([0, 0, 0])).toBe(0);
    });

    it("should handle zeros mixed with other numbers", () => {
      expect(calculateAverage([0, 1, 2])).toBeCloseTo(1);
    });
  });

  describe("error cases", () => {
    it("should throw an error for empty arrays", () => {
      expect(() => calculateAverage([])).toThrow(
        "Cannot calculate average of an empty array"
      );
    });

    it("should throw error for array containing NaN", () => {
      expect(() => calculateAverage([1, 2, NaN, 4])).toThrow(
        "Cannot calculate average of array containing NaN"
      );
    });

    it("should throw error for array containing only NaN", () => {
      expect(() => calculateAverage([NaN])).toThrow(
        "Cannot calculate average of array containing NaN"
      );
    });

    it("should throw error for array containing Infinity", () => {
      expect(() => calculateAverage([1, 2, Infinity])).toThrow(
        "Cannot calculate average of array containing Infinity"
      );
    });

    it("should throw error for array containing negative Infinity", () => {
      expect(() => calculateAverage([1, -Infinity, 3])).toThrow(
        "Cannot calculate average of array containing Infinity"
      );
    });

    it("should throw error when sum causes overflow", () => {
      const largeNumbers = [Number.MAX_VALUE, Number.MAX_VALUE];
      expect(() => calculateAverage(largeNumbers)).toThrow(
        "Overflow occurred during calculation - numbers are too large"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very large numbers without overflow", () => {
      const result = calculateAverage([
        Number.MAX_VALUE / 2,
        Number.MAX_VALUE / 2,
      ]);
      expect(result).toBe(Number.MAX_VALUE / 2);
    });

    it("should handle very small numbers", () => {
      const result = calculateAverage([0.0001, 0.0002, 0.0003]);
      expect(result).toBeCloseTo(0.0002);
    });
  });
});

describe("getUserName", () => {
  describe("basic functionality", () => {
    it("should return the user name in uppercase", () => {
      const user = { name: "john doe" };
      expect(getUserName(user)).toBe("JOHN DOE");
    });

    it("should handle already uppercase names", () => {
      const user = { name: "JANE SMITH" };
      expect(getUserName(user)).toBe("JANE SMITH");
    });

    it("should handle mixed case names", () => {
      const user = { name: "AlIcE WoNdErLaNd" };
      expect(getUserName(user)).toBe("ALICE WONDERLAND");
    });

    it("should handle single word names", () => {
      expect(getUserName({ name: "john" })).toBe("JOHN");
      expect(getUserName({ name: "JANE" })).toBe("JANE");
    });
  });

  describe("special characters", () => {
    it("should handle names with special characters", () => {
      expect(getUserName({ name: "josé-maría" })).toBe("JOSÉ-MARÍA");
    });

    it("should handle names with apostrophes", () => {
      expect(getUserName({ name: "o'brien" })).toBe("O'BRIEN");
    });

    it("should handle names with numbers", () => {
      expect(getUserName({ name: "user123" })).toBe("USER123");
    });
  });

  describe("whitespace handling", () => {
    it("should throw error for empty string names", () => {
      const user = { name: "" };
      expect(() => getUserName(user)).toThrow("User name cannot be empty");
    });

    it("should throw error for names with only whitespace", () => {
      // Whitespace is trimmed, then validation rejects empty result
      expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
    });

    it("should handle names with leading/trailing whitespace", () => {
      // Leading/trailing whitespace is trimmed
      expect(getUserName({ name: "  john  " })).toBe("JOHN");
    });

    it("should handle names with newlines", () => {
      expect(getUserName({ name: "John\nDoe" })).toBe("JOHN\nDOE");
    });

    it("should handle names with tabs", () => {
      expect(getUserName({ name: "John\tDoe" })).toBe("JOHN\tDOE");
    });
  });

  describe("error cases", () => {
    it("should throw an error when user is null", () => {
      expect(() => getUserName(null)).toThrow(
        "User cannot be null or undefined"
      );
    });

    it("should throw an error when user is undefined", () => {
      expect(() => getUserName(undefined)).toThrow(
        "User cannot be null or undefined"
      );
    });

    it("should throw an error when user.name is missing", () => {
      const user = {};
      expect(() => getUserName(user as any)).toThrow(
        "User must have a name property"
      );
    });

    it("should throw an error when user.name is null", () => {
      const user = { name: null };
      expect(() => getUserName(user as any)).toThrow(
        "User must have a name property"
      );
    });

    it("should throw an error when user.name is undefined", () => {
      const user = { name: undefined };
      expect(() => getUserName(user as any)).toThrow(
        "User must have a name property"
      );
    });

    it("should throw an error when user.name is not a string", () => {
      const user = { name: 123 };
      expect(() => getUserName(user as any)).toThrow(
        "User name must be a string"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very long names", () => {
      const longName = "a".repeat(10000);
      expect(getUserName({ name: longName })).toBe(longName.toUpperCase());
    });
  });
});
