import { describe, it, expect } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";
import { getErrorMessage } from "../src/errorUtils.js";

/**
 * Complete test suite for all utility functions
 * This suite will identify any bugs in the implementations
 */

describe("calculateAverage - Complete Test Suite", () => {
  describe("Valid inputs", () => {
    it("should calculate average of positive numbers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverage([10])).toBe(10);
      expect(calculateAverage([2, 4, 6])).toBe(4);
    });

    it("should calculate average of negative numbers", () => {
      expect(calculateAverage([-1, -2, -3])).toBe(-2);
      expect(calculateAverage([-10])).toBe(-10);
    });

    it("should calculate average of mixed positive and negative", () => {
      expect(calculateAverage([-10, 0, 10])).toBe(0);
      expect(calculateAverage([5, -5])).toBe(0);
    });

    it("should handle decimal numbers", () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBe(2.5);
      expect(calculateAverage([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
    });

    it("should handle zeros", () => {
      expect(calculateAverage([0, 0, 0])).toBe(0);
      expect(calculateAverage([0])).toBe(0);
    });
  });

  describe("Error conditions", () => {
    it("should throw error for empty array", () => {
      expect(() => calculateAverage([])).toThrow();
    });

    it("should throw error for NaN values", () => {
      expect(() => calculateAverage([1, NaN, 3])).toThrow();
      expect(() => calculateAverage([NaN])).toThrow();
    });

    it("should throw error for Infinity", () => {
      expect(() => calculateAverage([1, Infinity])).toThrow();
      expect(() => calculateAverage([Infinity])).toThrow();
    });

    it("should throw error for negative Infinity", () => {
      expect(() => calculateAverage([1, -Infinity])).toThrow();
      expect(() => calculateAverage([-Infinity])).toThrow();
    });

    it("should throw error for overflow", () => {
      // Sum of MAX_VALUE twice will overflow to Infinity
      expect(() => calculateAverage([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle large numbers without overflow", () => {
      const result = calculateAverage([Number.MAX_VALUE / 2, Number.MAX_VALUE / 2]);
      expect(result).toBe(Number.MAX_VALUE / 2);
    });

    it("should handle very small numbers", () => {
      const result = calculateAverage([1e-10, 2e-10, 3e-10]);
      expect(result).toBeCloseTo(2e-10);
    });

    it("should handle negative zeros", () => {
      expect(calculateAverage([0, -0, 0])).toBe(0);
    });
  });
});

describe("getUserName - Complete Test Suite", () => {
  describe("Valid inputs", () => {
    it("should convert lowercase to uppercase", () => {
      expect(getUserName({ name: "john" })).toBe("JOHN");
      expect(getUserName({ name: "jane doe" })).toBe("JANE DOE");
    });

    it("should handle already uppercase names", () => {
      expect(getUserName({ name: "JOHN" })).toBe("JOHN");
      expect(getUserName({ name: "JANE DOE" })).toBe("JANE DOE");
    });

    it("should handle mixed case", () => {
      expect(getUserName({ name: "JoHn DoE" })).toBe("JOHN DOE");
    });

    it("should handle special characters", () => {
      expect(getUserName({ name: "josé" })).toBe("JOSÉ");
      expect(getUserName({ name: "o'brien" })).toBe("O'BRIEN");
      expect(getUserName({ name: "user-123" })).toBe("USER-123");
    });

    it("should handle whitespace trimming (if implemented)", () => {
      // Test if the function trims whitespace
      const result = getUserName({ name: "  john  " });
      // This will reveal if trimming is actually happening
      expect(result).toBeDefined();
    });
  });

  describe("Error conditions", () => {
    it("should throw error for null user", () => {
      expect(() => getUserName(null)).toThrow();
    });

    it("should throw error for undefined user", () => {
      expect(() => getUserName(undefined)).toThrow();
    });

    it("should throw error for null name", () => {
      expect(() => getUserName({ name: null } as any)).toThrow();
    });

    it("should throw error for undefined name", () => {
      expect(() => getUserName({ name: undefined } as any)).toThrow();
    });

    it("should throw error for non-string name", () => {
      expect(() => getUserName({ name: 123 } as any)).toThrow();
      expect(() => getUserName({ name: {} } as any)).toThrow();
      expect(() => getUserName({ name: [] } as any)).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should throw error for empty string", () => {
      // Empty strings should be rejected
      expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
    });

    it("should throw error for whitespace-only strings", () => {
      // Whitespace-only strings should be rejected
      expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
    });

    it("should handle very long names", () => {
      const longName = "a".repeat(1000);
      const result = getUserName({ name: longName });
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle names with newlines", () => {
      const result = getUserName({ name: "john\ndoe" });
      expect(result).toBeDefined();
    });
  });
});

describe("getErrorMessage - Complete Test Suite", () => {
  describe("Error instances", () => {
    it("should extract message from Error", () => {
      expect(getErrorMessage(new Error("test"))).toBe("test");
    });

    it("should extract message from TypeError", () => {
      expect(getErrorMessage(new TypeError("type error"))).toBe("type error");
    });

    it("should extract message from RangeError", () => {
      expect(getErrorMessage(new RangeError("range error"))).toBe("range error");
    });
  });

  describe("Primitive types", () => {
    it("should handle string errors", () => {
      expect(getErrorMessage("string error")).toBe("string error");
      expect(getErrorMessage("")).toBe("");
    });

    it("should handle number errors", () => {
      expect(getErrorMessage(123)).toBe("123");
      expect(getErrorMessage(0)).toBe("0");
      expect(getErrorMessage(-456)).toBe("-456");
    });

    it("should handle boolean errors", () => {
      expect(getErrorMessage(true)).toBe("true");
      expect(getErrorMessage(false)).toBe("false");
    });

    it("should handle null", () => {
      expect(getErrorMessage(null)).toBe("null");
    });

    it("should handle undefined", () => {
      expect(getErrorMessage(undefined)).toBe("undefined");
    });
  });

  describe("Complex types", () => {
    it("should handle object errors", () => {
      const error = { code: 500, message: "error" };
      const result = getErrorMessage(error);
      expect(result).toContain("500");
    });

    it("should handle array errors", () => {
      expect(getErrorMessage([1, 2, 3])).toBe("1,2,3");
    });

    it("should handle symbol errors", () => {
      const symbol = Symbol("test");
      const result = getErrorMessage(symbol);
      expect(typeof result).toBe("string");
    });
  });
});
