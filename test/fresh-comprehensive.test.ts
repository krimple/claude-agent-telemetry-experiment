import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getErrorMessage } from "../src/errorUtils.js";
import { calculateAverage, getUserName, type User } from "../src/utils.js";
import {
  initTelemetry,
  shutdownTelemetry,
  isTelemetryInitialized,
} from "../src/telemetry.js";

/**
 * Comprehensive Test Suite for src/ modules
 * Following Test-First Approach
 */

// =============================================================================
// ERROR UTILS TESTS
// =============================================================================

describe("errorUtils - getErrorMessage", () => {
  describe("Error instances", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Test error message");
      expect(getErrorMessage(error)).toBe("Test error message");
    });

    it("should extract message from TypeError", () => {
      const error = new TypeError("Type error message");
      expect(getErrorMessage(error)).toBe("Type error message");
    });

    it("should extract message from custom Error subclass", () => {
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

  describe("String errors", () => {
    it("should return string as-is", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("should handle empty string", () => {
      expect(getErrorMessage("")).toBe("");
    });

    it("should handle multiline strings", () => {
      const error = "Line 1\nLine 2\nLine 3";
      expect(getErrorMessage(error)).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("Null and undefined", () => {
    it("should handle null", () => {
      expect(getErrorMessage(null)).toBe("null");
    });

    it("should handle undefined", () => {
      expect(getErrorMessage(undefined)).toBe("undefined");
    });
  });

  describe("Primitive types", () => {
    it("should handle number", () => {
      expect(getErrorMessage(42)).toBe("42");
    });

    it("should handle boolean true", () => {
      expect(getErrorMessage(true)).toBe("true");
    });

    it("should handle boolean false", () => {
      expect(getErrorMessage(false)).toBe("false");
    });

    it("should handle zero", () => {
      expect(getErrorMessage(0)).toBe("0");
    });

    it("should handle negative number", () => {
      expect(getErrorMessage(-123)).toBe("-123");
    });
  });

  describe("Arrays", () => {
    it("should convert array to comma-separated string", () => {
      expect(getErrorMessage([1, 2, 3])).toBe("1,2,3");
    });

    it("should handle empty array", () => {
      expect(getErrorMessage([])).toBe("");
    });

    it("should handle array with mixed types", () => {
      expect(getErrorMessage([1, "two", true])).toBe("1,two,true");
    });
  });

  describe("Objects with custom toString", () => {
    it("should use Date toString", () => {
      const date = new Date("2024-06-15T12:00:00.000Z");
      const result = getErrorMessage(date);
      expect(result).toContain("2024");
      expect(result).toContain("Jun");
    });

    it("should use RegExp toString", () => {
      const regex = /test/gi;
      expect(getErrorMessage(regex)).toBe("/test/gi");
    });

    it("should use custom toString method", () => {
      const obj = {
        toString() {
          return "Custom toString result";
        },
      };
      expect(getErrorMessage(obj)).toBe("Custom toString result");
    });

    it("should fall back to JSON.stringify if toString returns default format", () => {
      const obj = {
        value: 42,
        toString() {
          return "[object Object]";
        },
      };
      expect(getErrorMessage(obj)).toBe('{"value":42}');
    });
  });

  describe("Plain objects", () => {
    it("should serialize plain object with JSON.stringify", () => {
      const obj = { code: 500, message: "Server error" };
      expect(getErrorMessage(obj)).toBe('{"code":500,"message":"Server error"}');
    });

    it("should handle nested objects", () => {
      const obj = { outer: { inner: "value" } };
      expect(getErrorMessage(obj)).toBe('{"outer":{"inner":"value"}}');
    });

    it("should handle object with null values", () => {
      const obj = { key: null };
      expect(getErrorMessage(obj)).toBe('{"key":null}');
    });
  });

  describe("Circular references", () => {
    it("should handle circular reference by falling back to String()", () => {
      const obj: any = { name: "circular" };
      obj.self = obj;
      const result = getErrorMessage(obj);
      expect(result).toBe("[object Object]");
    });
  });

  describe("Special types", () => {
    it("should handle Symbol", () => {
      const sym = Symbol("test");
      expect(getErrorMessage(sym)).toBe("Symbol(test)");
    });

    it("should handle Function", () => {
      const fn = function testFunc() {};
      const result = getErrorMessage(fn);
      expect(result).toContain("testFunc");
    });
  });
});

// =============================================================================
// UTILS TESTS
// =============================================================================

describe("utils - calculateAverage", () => {
  describe("Valid inputs", () => {
    it("should calculate average of positive numbers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should calculate average of two numbers", () => {
      expect(calculateAverage([10, 20])).toBe(15);
    });

    it("should calculate average of single number", () => {
      expect(calculateAverage([42])).toBe(42);
    });

    it("should calculate average with negative numbers", () => {
      expect(calculateAverage([-10, 10])).toBe(0);
    });

    it("should calculate average with decimals", () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });

    it("should calculate average of all zeros", () => {
      expect(calculateAverage([0, 0, 0])).toBe(0);
    });

    it("should handle very small numbers", () => {
      expect(calculateAverage([0.001, 0.002, 0.003])).toBeCloseTo(0.002);
    });
  });

  describe("Invalid inputs - Type validation", () => {
    it("should throw error if input is not an array", () => {
      expect(() => calculateAverage(null as any)).toThrow("Input must be an array");
    });

    it("should throw error if input is undefined", () => {
      expect(() => calculateAverage(undefined as any)).toThrow(
        "Input must be an array"
      );
    });

    it("should throw error if input is a number", () => {
      expect(() => calculateAverage(123 as any)).toThrow("Input must be an array");
    });

    it("should throw error if input is a string", () => {
      expect(() => calculateAverage("123" as any)).toThrow("Input must be an array");
    });

    it("should throw error if input is an object", () => {
      expect(() => calculateAverage({ length: 3 } as any)).toThrow(
        "Input must be an array"
      );
    });
  });

  describe("Invalid inputs - Empty array", () => {
    it("should throw error for empty array", () => {
      expect(() => calculateAverage([])).toThrow(
        "Cannot calculate average of an empty array"
      );
    });
  });

  describe("Invalid inputs - Non-numeric elements", () => {
    it("should throw error if array contains string", () => {
      expect(() => calculateAverage([1, "2" as any, 3])).toThrow(
        "All elements must be numbers"
      );
    });

    it("should throw error if array contains null", () => {
      expect(() => calculateAverage([1, null as any, 3])).toThrow(
        "All elements must be numbers"
      );
    });

    it("should throw error if array contains undefined", () => {
      expect(() => calculateAverage([1, undefined as any, 3])).toThrow(
        "All elements must be numbers"
      );
    });

    it("should throw error if array contains object", () => {
      expect(() => calculateAverage([1, {} as any, 3])).toThrow(
        "All elements must be numbers"
      );
    });

    it("should throw error if array contains array", () => {
      expect(() => calculateAverage([1, [2] as any, 3])).toThrow(
        "All elements must be numbers"
      );
    });
  });

  describe("Invalid inputs - NaN and Infinity", () => {
    it("should throw error if array contains NaN", () => {
      expect(() => calculateAverage([1, NaN, 3])).toThrow(
        "Cannot calculate average of array containing NaN"
      );
    });

    it("should throw error if array contains Infinity", () => {
      expect(() => calculateAverage([1, Infinity, 3])).toThrow(
        "Cannot calculate average of array containing Infinity"
      );
    });

    it("should throw error if array contains -Infinity", () => {
      expect(() => calculateAverage([1, -Infinity, 3])).toThrow(
        "Cannot calculate average of array containing Infinity"
      );
    });
  });

  describe("Edge cases - Overflow", () => {
    it("should throw error on overflow with very large numbers", () => {
      const largeNumbers = [Number.MAX_VALUE, Number.MAX_VALUE];
      expect(() => calculateAverage(largeNumbers)).toThrow(
        "Overflow occurred during calculation"
      );
    });

    it("should handle large array of normal numbers", () => {
      const numbers = Array(1000).fill(5);
      expect(calculateAverage(numbers)).toBe(5);
    });
  });
});

describe("utils - getUserName", () => {
  describe("Valid inputs", () => {
    it("should return uppercase name", () => {
      expect(getUserName({ name: "John Doe" })).toBe("JOHN DOE");
    });

    it("should trim and uppercase name", () => {
      expect(getUserName({ name: "  alice  " })).toBe("ALICE");
    });

    it("should handle single character name", () => {
      expect(getUserName({ name: "A" })).toBe("A");
    });

    it("should handle lowercase name", () => {
      expect(getUserName({ name: "bob" })).toBe("BOB");
    });

    it("should handle mixed case name", () => {
      expect(getUserName({ name: "JoHn DoE" })).toBe("JOHN DOE");
    });

    it("should handle name with special characters", () => {
      expect(getUserName({ name: "José García" })).toBe("JOSÉ GARCÍA");
    });

    it("should handle name with numbers", () => {
      expect(getUserName({ name: "User123" })).toBe("USER123");
    });

    it("should preserve multiple spaces after trim", () => {
      expect(getUserName({ name: "  First  Last  " })).toBe("FIRST  LAST");
    });
  });

  describe("Invalid inputs - Null/undefined user", () => {
    it("should throw error if user is null", () => {
      expect(() => getUserName(null)).toThrow("User cannot be null or undefined");
    });

    it("should throw error if user is undefined", () => {
      expect(() => getUserName(undefined)).toThrow(
        "User cannot be null or undefined"
      );
    });
  });

  describe("Invalid inputs - Missing name property", () => {
    it("should throw error if name property is missing", () => {
      expect(() => getUserName({} as User)).toThrow(
        "User must have a name property"
      );
    });

    it("should throw error if name is null", () => {
      expect(() => getUserName({ name: null as any })).toThrow(
        "User must have a name property"
      );
    });

    it("should throw error if name is undefined", () => {
      expect(() => getUserName({ name: undefined as any })).toThrow(
        "User must have a name property"
      );
    });
  });

  describe("Invalid inputs - Invalid name type", () => {
    it("should throw error if name is a number", () => {
      expect(() => getUserName({ name: 123 as any })).toThrow(
        "User name must be a string"
      );
    });

    it("should throw error if name is an object", () => {
      expect(() => getUserName({ name: {} as any })).toThrow(
        "User name must be a string"
      );
    });

    it("should throw error if name is an array", () => {
      expect(() => getUserName({ name: [] as any })).toThrow(
        "User name must be a string"
      );
    });

    it("should throw error if name is boolean", () => {
      expect(() => getUserName({ name: true as any })).toThrow(
        "User name must be a string"
      );
    });
  });

  describe("Invalid inputs - Empty name", () => {
    it("should throw error if name is empty string", () => {
      expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
    });

    it("should throw error if name is only whitespace", () => {
      expect(() => getUserName({ name: "   " })).toThrow(
        "User name cannot be empty"
      );
    });

    it("should throw error if name is tabs and spaces", () => {
      expect(() => getUserName({ name: "\t\n  \r" })).toThrow(
        "User name cannot be empty"
      );
    });
  });
});

// =============================================================================
// TELEMETRY TESTS
// =============================================================================

describe("telemetry - initTelemetry", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    // Ensure clean state before each test
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore errors if already shutdown
    }
  });

  afterEach(async () => {
    process.env = originalEnv;
    // Clean shutdown after each test
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore errors during cleanup
    }
  });

  describe("Telemetry enabled", () => {
    it("should initialize telemetry when enabled", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      expect(() => initTelemetry()).not.toThrow();
    });

    it("should not initialize telemetry when disabled", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "0";
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });

    it("should not initialize telemetry when env var is missing", () => {
      delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });
  });

  describe("Interval validation", () => {
    it("should use default metric interval when not specified", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      delete process.env.OTEL_METRIC_EXPORT_INTERVAL;
      expect(() => initTelemetry()).not.toThrow();
    });

    it("should accept valid metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "5000";
      expect(() => initTelemetry()).not.toThrow();
    });

    it("should use default trace interval when not specified", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      delete process.env.OTEL_TRACE_EXPORT_INTERVAL;
      expect(() => initTelemetry()).not.toThrow();
    });

    it("should accept valid trace interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "3000";
      expect(() => initTelemetry()).not.toThrow();
    });
  });

  describe("Service name configuration", () => {
    it("should use default service name when not specified", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      delete process.env.OTEL_SERVICE_NAME;
      expect(() => initTelemetry()).not.toThrow();
    });

    it("should use custom service name when specified", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_SERVICE_NAME = "custom-service";
      expect(() => initTelemetry()).not.toThrow();
    });
  });

  describe("Double initialization prevention", () => {
    it("should prevent double initialization", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      initTelemetry();
      // Second call should not throw but should warn
      expect(() => initTelemetry()).not.toThrow();
    });
  });
});

describe("telemetry - shutdownTelemetry", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should shutdown telemetry gracefully", async () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
    initTelemetry();
    await expect(shutdownTelemetry()).resolves.not.toThrow();
  });

  it("should handle shutdown when telemetry not initialized", async () => {
    await expect(shutdownTelemetry()).resolves.not.toThrow();
  });

  it("should handle multiple shutdown calls", async () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
    initTelemetry();
    await shutdownTelemetry();
    await expect(shutdownTelemetry()).resolves.not.toThrow();
  });
});

describe("telemetry - isTelemetryInitialized", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(async () => {
    process.env = originalEnv;
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should return false when telemetry not initialized", () => {
    expect(isTelemetryInitialized()).toBe(false);
  });

  it("should return true when telemetry is initialized", () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
    initTelemetry();
    expect(isTelemetryInitialized()).toBe(true);
  });

  it("should return false after shutdown", async () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
    initTelemetry();
    await shutdownTelemetry();
    expect(isTelemetryInitialized()).toBe(false);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("Integration tests", () => {
  describe("Error handling with utils functions", () => {
    it("should properly format calculateAverage errors", () => {
      try {
        calculateAverage([]);
      } catch (error) {
        expect(getErrorMessage(error)).toBe(
          "Cannot calculate average of an empty array"
        );
      }
    });

    it("should properly format getUserName errors", () => {
      try {
        getUserName(null);
      } catch (error) {
        expect(getErrorMessage(error)).toBe("User cannot be null or undefined");
      }
    });
  });

  describe("Telemetry lifecycle", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(async () => {
      process.env = originalEnv;
      try {
        await shutdownTelemetry();
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should complete full telemetry lifecycle", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      // Initialize
      expect(isTelemetryInitialized()).toBe(false);
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(true);

      // Shutdown
      await shutdownTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });
  });
});
