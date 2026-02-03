import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateAverage, getUserName, type User } from "../src/utils.js";
import { getErrorMessage } from "../src/errorUtils.js";

/**
 * Comprehensive test suite for all modules in src/
 * This test file covers:
 * - utils.ts (calculateAverage, getUserName)
 * - errorUtils.ts (getErrorMessage)
 * - Edge cases and boundary conditions
 * - Error handling scenarios
 */

describe("Comprehensive Module Tests", () => {
  describe("utils.ts - calculateAverage", () => {
    describe("Valid inputs", () => {
      it("should calculate average of positive integers", () => {
        expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
        expect(calculateAverage([10, 20, 30])).toBe(20);
      });

      it("should calculate average of negative integers", () => {
        expect(calculateAverage([-1, -2, -3])).toBe(-2);
        expect(calculateAverage([-10, -20])).toBe(-15);
      });

      it("should calculate average of mixed positive and negative numbers", () => {
        expect(calculateAverage([-10, 10])).toBe(0);
        expect(calculateAverage([-5, 0, 5])).toBe(0);
        expect(calculateAverage([100, -50, 50])).toBe(33.333333333333336);
      });

      it("should handle single element arrays", () => {
        expect(calculateAverage([42])).toBe(42);
        expect(calculateAverage([0])).toBe(0);
        expect(calculateAverage([-1])).toBe(-1);
      });

      it("should calculate average of decimal numbers", () => {
        expect(calculateAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
        expect(calculateAverage([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
      });

      it("should handle arrays with zeros", () => {
        expect(calculateAverage([0, 0, 0])).toBe(0);
        expect(calculateAverage([1, 0, -1])).toBe(0);
      });

      it("should handle very small decimal numbers", () => {
        const result = calculateAverage([0.0001, 0.0002, 0.0003]);
        expect(result).toBeCloseTo(0.0002, 4);
      });

      it("should handle large but safe numbers", () => {
        const safeMax = Number.MAX_SAFE_INTEGER / 10;
        expect(calculateAverage([safeMax, safeMax])).toBe(safeMax);
      });
    });

    describe("Error conditions", () => {
      it("should throw error for empty array", () => {
        expect(() => calculateAverage([])).toThrow(
          "Cannot calculate average of an empty array"
        );
      });

      it("should throw error for array containing NaN", () => {
        expect(() => calculateAverage([1, 2, NaN, 4])).toThrow(
          "Cannot calculate average of array containing NaN"
        );
        expect(() => calculateAverage([NaN])).toThrow(
          "Cannot calculate average of array containing NaN"
        );
        expect(() => calculateAverage([NaN, NaN])).toThrow(
          "Cannot calculate average of array containing NaN"
        );
      });

      it("should throw error for array containing Infinity", () => {
        expect(() => calculateAverage([1, 2, Infinity])).toThrow(
          "Cannot calculate average of array containing Infinity"
        );
        expect(() => calculateAverage([Infinity])).toThrow(
          "Cannot calculate average of array containing Infinity"
        );
      });

      it("should throw error for array containing negative Infinity", () => {
        expect(() => calculateAverage([1, -Infinity, 3])).toThrow(
          "Cannot calculate average of array containing Infinity"
        );
        expect(() => calculateAverage([-Infinity])).toThrow(
          "Cannot calculate average of array containing Infinity"
        );
      });

      it("should throw error when sum causes overflow", () => {
        const largeNumbers = [Number.MAX_VALUE, Number.MAX_VALUE];
        expect(() => calculateAverage(largeNumbers)).toThrow(
          "Overflow occurred during calculation - numbers are too large"
        );
      });

      it("should handle edge case with alternating very large numbers", () => {
        // This should work because they cancel out
        const result = calculateAverage([
          Number.MAX_VALUE / 2,
          Number.MAX_VALUE / 2,
        ]);
        expect(result).toBe(Number.MAX_VALUE / 2);
      });
    });

    describe("Precision and rounding", () => {
      it("should maintain precision for decimal results", () => {
        expect(calculateAverage([1, 2])).toBe(1.5);
        expect(calculateAverage([1, 2, 3])).toBeCloseTo(2);
      });

      it("should handle floating point arithmetic correctly", () => {
        // Classic floating point issue: 0.1 + 0.2 !== 0.3
        const result = calculateAverage([0.1, 0.2]);
        expect(result).toBeCloseTo(0.15, 10);
      });
    });
  });

  describe("utils.ts - getUserName", () => {
    describe("Valid inputs", () => {
      it("should convert lowercase names to uppercase", () => {
        expect(getUserName({ name: "john" })).toBe("JOHN");
        expect(getUserName({ name: "jane" })).toBe("JANE");
      });

      it("should handle already uppercase names", () => {
        expect(getUserName({ name: "JOHN" })).toBe("JOHN");
        expect(getUserName({ name: "JANE DOE" })).toBe("JANE DOE");
      });

      it("should handle mixed case names", () => {
        expect(getUserName({ name: "JoHn DoE" })).toBe("JOHN DOE");
        expect(getUserName({ name: "aBcDeF" })).toBe("ABCDEF");
      });

      it("should trim whitespace from names", () => {
        expect(getUserName({ name: "  john  " })).toBe("JOHN");
        expect(getUserName({ name: "\tjane\t" })).toBe("JANE");
        expect(getUserName({ name: "\n  bob  \n" })).toBe("BOB");
      });

      it("should handle names with special characters", () => {
        expect(getUserName({ name: "josé" })).toBe("JOSÉ");
        expect(getUserName({ name: "françois" })).toBe("FRANÇOIS");
        expect(getUserName({ name: "andré-marie" })).toBe("ANDRÉ-MARIE");
      });

      it("should handle names with numbers", () => {
        expect(getUserName({ name: "user123" })).toBe("USER123");
        expect(getUserName({ name: "42agent" })).toBe("42AGENT");
      });

      it("should handle single character names", () => {
        expect(getUserName({ name: "a" })).toBe("A");
        expect(getUserName({ name: "Z" })).toBe("Z");
      });

      it("should throw error for empty string after trimming", () => {
        expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
        expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
        expect(() => getUserName({ name: "\t\n" })).toThrow("User name cannot be empty");
      });
    });

    describe("Error conditions", () => {
      it("should throw error for null user", () => {
        expect(() => getUserName(null)).toThrow(
          "User cannot be null or undefined"
        );
      });

      it("should throw error for undefined user", () => {
        expect(() => getUserName(undefined)).toThrow(
          "User cannot be null or undefined"
        );
      });

      it("should throw error for user with null name", () => {
        expect(() => getUserName({ name: null as any })).toThrow(
          "User must have a name property"
        );
      });

      it("should throw error for user with undefined name", () => {
        expect(() => getUserName({ name: undefined as any })).toThrow(
          "User must have a name property"
        );
      });

      it("should throw error for user with non-string name", () => {
        expect(() => getUserName({ name: 123 as any })).toThrow(
          "User name must be a string"
        );
        expect(() => getUserName({ name: {} as any })).toThrow(
          "User name must be a string"
        );
        expect(() => getUserName({ name: [] as any })).toThrow(
          "User name must be a string"
        );
      });

      it("should throw error for user without name property", () => {
        expect(() => getUserName({} as any)).toThrow(
          "User must have a name property"
        );
      });
    });

    describe("Type safety", () => {
      it("should accept proper User interface", () => {
        const user: User = { name: "test" };
        expect(getUserName(user)).toBe("TEST");
      });

      it("should handle user objects with additional properties", () => {
        const user = { name: "john", age: 30, email: "john@example.com" };
        expect(getUserName(user)).toBe("JOHN");
      });
    });
  });

  describe("errorUtils.ts - getErrorMessage", () => {
    describe("Error instances", () => {
      it("should extract message from Error instances", () => {
        const error = new Error("Test error");
        expect(getErrorMessage(error)).toBe("Test error");
      });

      it("should handle TypeError instances", () => {
        const error = new TypeError("Type mismatch");
        expect(getErrorMessage(error)).toBe("Type mismatch");
      });

      it("should handle RangeError instances", () => {
        const error = new RangeError("Out of range");
        expect(getErrorMessage(error)).toBe("Out of range");
      });

      it("should handle ReferenceError instances", () => {
        const error = new ReferenceError("Variable not defined");
        expect(getErrorMessage(error)).toBe("Variable not defined");
      });

      it("should handle SyntaxError instances", () => {
        const error = new SyntaxError("Invalid syntax");
        expect(getErrorMessage(error)).toBe("Invalid syntax");
      });

      it("should handle custom Error subclasses", () => {
        class CustomError extends Error {
          constructor(message: string) {
            super(message);
            this.name = "CustomError";
          }
        }
        const error = new CustomError("Custom error message");
        expect(getErrorMessage(error)).toBe("Custom error message");
      });

      it("should handle Error with empty message", () => {
        const error = new Error("");
        expect(getErrorMessage(error)).toBe("");
      });
    });

    describe("Primitive types", () => {
      it("should handle string errors", () => {
        expect(getErrorMessage("String error")).toBe("String error");
        expect(getErrorMessage("")).toBe("");
        expect(getErrorMessage("Multi\nline\nerror")).toBe("Multi\nline\nerror");
      });

      it("should handle number errors", () => {
        expect(getErrorMessage(123)).toBe("123");
        expect(getErrorMessage(0)).toBe("0");
        expect(getErrorMessage(-456)).toBe("-456");
        expect(getErrorMessage(3.14)).toBe("3.14");
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

      it("should handle BigInt", () => {
        expect(getErrorMessage(BigInt(123))).toBe("123");
        expect(getErrorMessage(BigInt(999999999999))).toBe("999999999999");
      });

      it("should handle Symbol", () => {
        const symbol = Symbol("test");
        const result = getErrorMessage(symbol);
        expect(result).toContain("Symbol(test)");
      });

      it("should handle Symbol without description", () => {
        const symbol = Symbol();
        const result = getErrorMessage(symbol);
        expect(result).toContain("Symbol()");
      });
    });

    describe("Complex types", () => {
      it("should handle plain objects", () => {
        const error = { code: 500, message: "Server error" };
        const result = getErrorMessage(error);
        expect(result).toContain("code");
        expect(result).toContain("500");
        expect(result).toContain("message");
      });

      it("should handle nested objects", () => {
        const error = {
          outer: { inner: { value: "nested" } },
        };
        const result = getErrorMessage(error);
        // JSON.stringify creates a proper JSON representation
        expect(result).toContain("outer");
        expect(result).toContain("inner");
        expect(result).toContain("nested");
      });

      it("should handle arrays", () => {
        expect(getErrorMessage([1, 2, 3])).toBe("1,2,3");
        expect(getErrorMessage([])).toBe("");
        expect(getErrorMessage(["a", "b", "c"])).toBe("a,b,c");
      });

      it("should handle functions", () => {
        const func = () => "test";
        const result = getErrorMessage(func);
        expect(typeof result).toBe("string");
      });

      it("should handle Date objects", () => {
        const date = new Date("2024-06-15T12:00:00.000Z");
        const result = getErrorMessage(date);
        expect(result).toContain("2024");
      });

      it("should handle RegExp objects", () => {
        const regex = /test/gi;
        const result = getErrorMessage(regex);
        expect(result).toContain("test");
      });
    });

    describe("Special numeric values", () => {
      it("should handle NaN", () => {
        expect(getErrorMessage(NaN)).toBe("NaN");
      });

      it("should handle Infinity", () => {
        expect(getErrorMessage(Infinity)).toBe("Infinity");
        expect(getErrorMessage(-Infinity)).toBe("-Infinity");
      });
    });

    describe("Edge cases", () => {
      it("should handle objects with custom toString", () => {
        const error = {
          toString() {
            return "Custom error representation";
          },
        };
        const result = getErrorMessage(error);
        expect(result).toBe("Custom error representation");
      });

      it("should handle objects with valueOf", () => {
        const error = {
          valueOf() {
            return 42;
          },
          toString() {
            return "Error with valueOf";
          },
        };
        const result = getErrorMessage(error);
        expect(result).toBe("Error with valueOf");
      });

      it("should handle circular references", () => {
        const error: any = { name: "circular" };
        error.self = error;
        const result = getErrorMessage(error);
        expect(typeof result).toBe("string");
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should handle errors from calculateAverage in getUserName context", () => {
      // Simulate catching an error and converting it
      try {
        calculateAverage([]);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("Cannot calculate average of an empty array");
      }
    });

    it("should handle errors from getUserName in error handling context", () => {
      try {
        getUserName(null);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("User cannot be null or undefined");
      }
    });

    it("should chain error handling correctly", () => {
      const errors: string[] = [];

      try {
        calculateAverage([NaN]);
      } catch (error) {
        errors.push(getErrorMessage(error));
      }

      try {
        getUserName(undefined);
      } catch (error) {
        errors.push(getErrorMessage(error));
      }

      expect(errors).toHaveLength(2);
      expect(errors[0]).toContain("NaN");
      expect(errors[1]).toContain("null or undefined");
    });
  });
});
