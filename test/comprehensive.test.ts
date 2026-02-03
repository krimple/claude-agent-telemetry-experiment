import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";
import { getErrorMessage } from "../src/errorUtils.js";

/**
 * Comprehensive test suite for all utility functions
 */

describe("Utils Module - calculateAverage", () => {
  describe("Basic functionality", () => {
    it("should calculate average of positive integers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should calculate average of single number", () => {
      expect(calculateAverage([10])).toBe(10);
    });

    it("should calculate average with decimal result", () => {
      expect(calculateAverage([1, 2])).toBe(1.5);
    });

    it("should handle floating point numbers", () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBe(2.5);
    });

    it("should handle negative numbers", () => {
      expect(calculateAverage([-5, -10, -15])).toBe(-10);
    });

    it("should handle mixed positive and negative numbers", () => {
      expect(calculateAverage([-10, 0, 10])).toBe(0);
    });

    it("should handle very small decimals", () => {
      expect(calculateAverage([0.1, 0.2, 0.3])).toBeCloseTo(0.2, 10);
    });

    it("should handle large numbers", () => {
      expect(calculateAverage([1000000, 2000000, 3000000])).toBe(2000000);
    });
  });

  describe("Edge cases", () => {
    it("should throw error for empty array", () => {
      expect(() => calculateAverage([])).toThrow(
        "Cannot calculate average of an empty array"
      );
    });

    it("should throw error for array with NaN", () => {
      expect(() => calculateAverage([1, NaN, 3])).toThrow(
        "Cannot calculate average of array containing NaN"
      );
    });

    it("should throw error for array with Infinity", () => {
      expect(() => calculateAverage([1, Infinity, 3])).toThrow(
        "Cannot calculate average of array containing Infinity"
      );
    });

    it("should throw error for array with -Infinity", () => {
      expect(() => calculateAverage([1, -Infinity, 3])).toThrow(
        "Cannot calculate average of array containing Infinity"
      );
    });

    it("should throw error when sum overflows to Infinity", () => {
      expect(() => calculateAverage([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(
        "Overflow occurred during calculation - numbers are too large"
      );
    });

    it("should handle very small numbers without underflow", () => {
      const result = calculateAverage([Number.MIN_VALUE, Number.MIN_VALUE]);
      expect(Number.isFinite(result)).toBe(true);
    });

    it("should handle zero", () => {
      expect(calculateAverage([0, 0, 0])).toBe(0);
    });

    it("should handle mix of zero and non-zero", () => {
      expect(calculateAverage([0, 5, 10])).toBe(5);
    });
  });

  describe("Precision", () => {
    it("should maintain reasonable precision for floating point", () => {
      const result = calculateAverage([0.1, 0.2]);
      expect(result).toBeCloseTo(0.15, 10);
    });

    it("should handle repeating decimals", () => {
      const result = calculateAverage([1, 2, 3]);
      expect(result).toBe(2);
    });
  });
});

describe("Utils Module - getUserName", () => {
  describe("Basic functionality", () => {
    it("should convert lowercase name to uppercase", () => {
      expect(getUserName({ name: "john doe" })).toBe("JOHN DOE");
    });

    it("should handle already uppercase names", () => {
      expect(getUserName({ name: "JANE SMITH" })).toBe("JANE SMITH");
    });

    it("should handle mixed case names", () => {
      expect(getUserName({ name: "AlIcE WoNdErLaNd" })).toBe("ALICE WONDERLAND");
    });

    it("should handle single character names", () => {
      expect(getUserName({ name: "a" })).toBe("A");
    });

    it("should throw error for empty string", () => {
      expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
    });

    it("should handle names with numbers", () => {
      expect(getUserName({ name: "user123" })).toBe("USER123");
    });

    it("should handle names with special characters", () => {
      expect(getUserName({ name: "john-doe" })).toBe("JOHN-DOE");
    });

    it("should handle unicode characters", () => {
      expect(getUserName({ name: "josé" })).toBe("JOSÉ");
    });
  });

  describe("Error cases", () => {
    it("should throw error when user is null", () => {
      expect(() => getUserName(null)).toThrow(
        "User cannot be null or undefined"
      );
    });

    it("should throw error when user is undefined", () => {
      expect(() => getUserName(undefined)).toThrow(
        "User cannot be null or undefined"
      );
    });

    it("should throw error when user.name is null", () => {
      expect(() => getUserName({ name: null } as any)).toThrow(
        "User must have a name property"
      );
    });

    it("should throw error when user.name is undefined", () => {
      expect(() => getUserName({ name: undefined } as any)).toThrow(
        "User must have a name property"
      );
    });

    it("should throw error when user.name is not a string", () => {
      expect(() => getUserName({ name: 123 } as any)).toThrow(
        "User name must be a string"
      );
    });

    it("should throw error when user object has no name property", () => {
      expect(() => getUserName({} as any)).toThrow(
        "User must have a name property"
      );
    });
  });

  describe("Whitespace handling", () => {
    it("should trim leading whitespace", () => {
      expect(getUserName({ name: "  john" })).toBe("JOHN");
    });

    it("should trim trailing whitespace", () => {
      expect(getUserName({ name: "john  " })).toBe("JOHN");
    });

    it("should trim both leading and trailing whitespace", () => {
      expect(getUserName({ name: "  john  " })).toBe("JOHN");
    });

    it("should preserve internal whitespace", () => {
      expect(getUserName({ name: "john  doe" })).toBe("JOHN  DOE");
    });

    it("should throw error for whitespace-only string", () => {
      expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
    });

    it("should trim and handle multi-word names", () => {
      expect(getUserName({ name: "  john doe  " })).toBe("JOHN DOE");
    });
  });
});

describe("ErrorUtils Module - getErrorMessage", () => {
  describe("Error instances", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Test error");
      expect(getErrorMessage(error)).toBe("Test error");
    });

    it("should handle TypeError", () => {
      const error = new TypeError("Type error");
      expect(getErrorMessage(error)).toBe("Type error");
    });

    it("should handle RangeError", () => {
      const error = new RangeError("Range error");
      expect(getErrorMessage(error)).toBe("Range error");
    });

    it("should handle ReferenceError", () => {
      const error = new ReferenceError("Reference error");
      expect(getErrorMessage(error)).toBe("Reference error");
    });

    it("should handle SyntaxError", () => {
      const error = new SyntaxError("Syntax error");
      expect(getErrorMessage(error)).toBe("Syntax error");
    });

    it("should handle Error with empty message", () => {
      const error = new Error("");
      expect(getErrorMessage(error)).toBe("");
    });
  });

  describe("String errors", () => {
    it("should handle string error", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("should handle empty string", () => {
      expect(getErrorMessage("")).toBe("");
    });

    it("should handle string with special characters", () => {
      expect(getErrorMessage("Error: \n\t Special")).toBe("Error: \n\t Special");
    });
  });

  describe("Primitive types", () => {
    it("should handle number error", () => {
      expect(getErrorMessage(123)).toBe("123");
    });

    it("should handle zero", () => {
      expect(getErrorMessage(0)).toBe("0");
    });

    it("should handle negative number", () => {
      expect(getErrorMessage(-42)).toBe("-42");
    });

    it("should handle boolean true", () => {
      expect(getErrorMessage(true)).toBe("true");
    });

    it("should handle boolean false", () => {
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
    it("should handle plain object", () => {
      const error = { code: 500, message: "Server error" };
      const result = getErrorMessage(error);
      expect(result).toContain("code");
      expect(result).toContain("500");
    });

    it("should handle array", () => {
      const result = getErrorMessage([1, 2, 3]);
      expect(result).toBe("1,2,3");
    });

    it("should handle empty object", () => {
      const result = getErrorMessage({});
      // Empty object serializes to "{}" with JSON.stringify
      expect(result).toBe("{}");
    });

    it("should handle symbol", () => {
      const sym = Symbol("test");
      const result = getErrorMessage(sym);
      expect(result).toContain("Symbol");
    });
  });

  describe("Edge cases", () => {
    it("should handle NaN", () => {
      expect(getErrorMessage(NaN)).toBe("NaN");
    });

    it("should handle Infinity", () => {
      expect(getErrorMessage(Infinity)).toBe("Infinity");
    });

    it("should handle -Infinity", () => {
      expect(getErrorMessage(-Infinity)).toBe("-Infinity");
    });

    it("should handle circular reference object", () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      const result = getErrorMessage(obj);
      expect(typeof result).toBe("string");
    });
  });
});
