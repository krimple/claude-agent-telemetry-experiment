import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";
import { getErrorMessage } from "../src/errorUtils.js";
import {
  initTelemetry,
  shutdownTelemetry,
  isTelemetryInitialized,
} from "../src/telemetry.js";
import {
  MAIN_AGENT_PROMPT,
  CODE_REVIEWER_AGENT,
  TEST_RUNNER_AGENT,
  ROOT_ALLOWED_TOOLS,
  TELEMETRY_CONFIG,
} from "../src/constants.js";

/**
 * Comprehensive Test Suite following Test-Driven Development principles
 *
 * This test suite aims to:
 * 1. Test all edge cases and boundary conditions
 * 2. Verify error handling and validation
 * 3. Ensure type safety and contract compliance
 * 4. Test integration between modules
 */

describe("utils.ts - calculateAverage", () => {
  describe("Basic functionality", () => {
    it("should calculate average of positive integers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should calculate average of negative integers", () => {
      expect(calculateAverage([-1, -2, -3])).toBe(-2);
    });

    it("should calculate average of mixed positive and negative numbers", () => {
      expect(calculateAverage([-10, 10, 0])).toBe(0);
    });

    it("should handle single element array", () => {
      expect(calculateAverage([42])).toBe(42);
      expect(calculateAverage([0])).toBe(0);
      expect(calculateAverage([-5])).toBe(-5);
    });

    it("should calculate average of decimal numbers", () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
      expect(calculateAverage([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
    });

    it("should handle array with zeros", () => {
      expect(calculateAverage([0, 0, 0])).toBe(0);
      expect(calculateAverage([1, 0, -1])).toBe(0);
    });

    it("should handle very small numbers", () => {
      const result = calculateAverage([0.0001, 0.0002, 0.0003]);
      expect(result).toBeCloseTo(0.0002);
    });

    it("should handle large arrays", () => {
      const largeArray = Array(1000).fill(5);
      expect(calculateAverage(largeArray)).toBe(5);
    });
  });

  describe("Error handling", () => {
    it("should throw error for empty array", () => {
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

  describe("Boundary conditions", () => {
    it("should handle maximum safe integer values", () => {
      const result = calculateAverage([
        Number.MAX_SAFE_INTEGER / 2,
        Number.MAX_SAFE_INTEGER / 2,
      ]);
      expect(result).toBe(Number.MAX_SAFE_INTEGER / 2);
    });

    it("should handle minimum safe integer values", () => {
      const result = calculateAverage([
        Number.MIN_SAFE_INTEGER / 2,
        Number.MIN_SAFE_INTEGER / 2,
      ]);
      expect(result).toBe(Number.MIN_SAFE_INTEGER / 2);
    });

    it("should handle very large but valid numbers", () => {
      const result = calculateAverage([
        Number.MAX_VALUE / 10,
        Number.MAX_VALUE / 10,
      ]);
      expect(result).toBe(Number.MAX_VALUE / 10);
    });

    it("should handle numbers very close to zero", () => {
      const result = calculateAverage([Number.MIN_VALUE, Number.MIN_VALUE]);
      expect(result).toBeCloseTo(Number.MIN_VALUE);
    });
  });
});

describe("utils.ts - getUserName", () => {
  describe("Basic functionality", () => {
    it("should convert lowercase name to uppercase", () => {
      expect(getUserName({ name: "john" })).toBe("JOHN");
    });

    it("should handle already uppercase names", () => {
      expect(getUserName({ name: "JANE" })).toBe("JANE");
    });

    it("should handle mixed case names", () => {
      expect(getUserName({ name: "JoHn DoE" })).toBe("JOHN DOE");
    });

    it("should trim leading whitespace", () => {
      expect(getUserName({ name: "  john" })).toBe("JOHN");
    });

    it("should trim trailing whitespace", () => {
      expect(getUserName({ name: "john  " })).toBe("JOHN");
    });

    it("should trim both leading and trailing whitespace", () => {
      expect(getUserName({ name: "  john  " })).toBe("JOHN");
    });

    it("should handle names with internal whitespace", () => {
      expect(getUserName({ name: "john   doe" })).toBe("JOHN   DOE");
    });

    it("should throw error for empty string name", () => {
      expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
    });

    it("should throw error for whitespace-only names", () => {
      expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
    });

    it("should handle names with special characters", () => {
      expect(getUserName({ name: "josé-maría" })).toBe("JOSÉ-MARÍA");
    });

    it("should handle names with numbers", () => {
      expect(getUserName({ name: "user123" })).toBe("USER123");
    });

    it("should handle names with unicode characters", () => {
      expect(getUserName({ name: "李明" })).toBe("李明");
    });

    it("should handle names with emojis", () => {
      expect(getUserName({ name: "john 😊" })).toBe("JOHN 😊");
    });
  });

  describe("Error handling", () => {
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

    it("should throw error for user with non-string name (number)", () => {
      expect(() => getUserName({ name: 123 as any })).toThrow(
        "User name must be a string"
      );
    });

    it("should throw error for user with non-string name (object)", () => {
      expect(() => getUserName({ name: {} as any })).toThrow(
        "User name must be a string"
      );
    });

    it("should throw error for user with non-string name (array)", () => {
      expect(() => getUserName({ name: [] as any })).toThrow(
        "User name must be a string"
      );
    });
  });
});

describe("errorUtils.ts - getErrorMessage", () => {
  describe("Error instances", () => {
    it("should extract message from Error", () => {
      const error = new Error("Test error");
      expect(getErrorMessage(error)).toBe("Test error");
    });

    it("should handle TypeError", () => {
      const error = new TypeError("Type mismatch");
      expect(getErrorMessage(error)).toBe("Type mismatch");
    });

    it("should handle RangeError", () => {
      const error = new RangeError("Out of range");
      expect(getErrorMessage(error)).toBe("Out of range");
    });

    it("should handle ReferenceError", () => {
      const error = new ReferenceError("Reference error");
      expect(getErrorMessage(error)).toBe("Reference error");
    });

    it("should handle SyntaxError", () => {
      const error = new SyntaxError("Syntax error");
      expect(getErrorMessage(error)).toBe("Syntax error");
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
    });

    it("should handle empty string", () => {
      expect(getErrorMessage("")).toBe("");
    });

    it("should handle number errors", () => {
      expect(getErrorMessage(123)).toBe("123");
      expect(getErrorMessage(0)).toBe("0");
      expect(getErrorMessage(-456)).toBe("-456");
      expect(getErrorMessage(3.14)).toBe("3.14");
    });

    it("should handle NaN", () => {
      expect(getErrorMessage(NaN)).toBe("NaN");
    });

    it("should handle Infinity", () => {
      expect(getErrorMessage(Infinity)).toBe("Infinity");
      expect(getErrorMessage(-Infinity)).toBe("-Infinity");
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
    it("should handle plain objects", () => {
      const error = { code: 500, message: "Server error" };
      const result = getErrorMessage(error);
      expect(result).toContain("500");
      expect(result).toContain("Server error");
    });

    it("should handle nested objects", () => {
      const error = { outer: { inner: "nested" } };
      const result = getErrorMessage(error);
      expect(result).toContain("inner");
      expect(result).toContain("nested");
    });

    it("should handle empty objects", () => {
      expect(getErrorMessage({})).toBe("{}");
    });

    it("should handle arrays", () => {
      expect(getErrorMessage([1, 2, 3])).toBe("1,2,3");
      expect(getErrorMessage(["a", "b", "c"])).toBe("a,b,c");
      expect(getErrorMessage([])).toBe("");
    });

    it("should handle Date objects", () => {
      const date = new Date("2024-01-01");
      const result = getErrorMessage(date);
      // Date.toString() varies by timezone, so just verify we get a date string representation
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle RegExp objects", () => {
      const regex = /test/g;
      expect(getErrorMessage(regex)).toBe("/test/g");
    });

    it("should handle objects with custom toString", () => {
      const obj = {
        toString() {
          return "custom toString";
        },
      };
      expect(getErrorMessage(obj)).toBe("custom toString");
    });

    it("should handle objects with toString that returns default format", () => {
      const obj = {
        toString() {
          return "[object Custom]";
        },
        value: 42,
      };
      const result = getErrorMessage(obj);
      // Should fall back to JSON.stringify
      expect(result).toContain("value");
      expect(result).toContain("42");
    });

    it("should handle circular references", () => {
      const obj: any = { name: "test" };
      obj.self = obj;
      const result = getErrorMessage(obj);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should handle symbols", () => {
      const symbol = Symbol("test");
      const result = getErrorMessage(symbol);
      expect(result).toContain("Symbol(test)");
    });

    it("should handle functions", () => {
      const fn = function testFunc() {};
      const result = getErrorMessage(fn);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });
  });
});

describe("constants.ts - Configuration", () => {
  describe("Agent prompts", () => {
    it("should have main agent prompt", () => {
      expect(MAIN_AGENT_PROMPT).toBeTruthy();
      expect(typeof MAIN_AGENT_PROMPT).toBe("string");
      expect(MAIN_AGENT_PROMPT.length).toBeGreaterThan(0);
    });

    it("should reference sub-agents in main prompt", () => {
      expect(MAIN_AGENT_PROMPT).toContain("code-reviewer");
      expect(MAIN_AGENT_PROMPT).toContain("test-runner");
    });
  });

  describe("Code reviewer agent", () => {
    it("should have description", () => {
      expect(CODE_REVIEWER_AGENT.description).toBeTruthy();
      expect(typeof CODE_REVIEWER_AGENT.description).toBe("string");
    });

    it("should have prompt", () => {
      expect(CODE_REVIEWER_AGENT.prompt).toBeTruthy();
      expect(typeof CODE_REVIEWER_AGENT.prompt).toBe("string");
    });

    it("should have tools array", () => {
      expect(Array.isArray(CODE_REVIEWER_AGENT.tools)).toBe(true);
      expect(CODE_REVIEWER_AGENT.tools.length).toBeGreaterThan(0);
    });

    it("should include essential tools", () => {
      expect(CODE_REVIEWER_AGENT.tools).toContain("Read");
      expect(CODE_REVIEWER_AGENT.tools).toContain("Bash");
    });
  });

  describe("Test runner agent", () => {
    it("should have description", () => {
      expect(TEST_RUNNER_AGENT.description).toBeTruthy();
      expect(typeof TEST_RUNNER_AGENT.description).toBe("string");
    });

    it("should have prompt", () => {
      expect(TEST_RUNNER_AGENT.prompt).toBeTruthy();
      expect(typeof TEST_RUNNER_AGENT.prompt).toBe("string");
    });

    it("should have tools array", () => {
      expect(Array.isArray(TEST_RUNNER_AGENT.tools)).toBe(true);
      expect(TEST_RUNNER_AGENT.tools.length).toBeGreaterThan(0);
    });

    it("should include Bash for running tests", () => {
      expect(TEST_RUNNER_AGENT.tools).toContain("Bash");
    });
  });

  describe("Root allowed tools", () => {
    it("should be an array", () => {
      expect(Array.isArray(ROOT_ALLOWED_TOOLS)).toBe(true);
    });

    it("should not include Bash", () => {
      expect(ROOT_ALLOWED_TOOLS).not.toContain("Bash");
    });

    it("should include Read", () => {
      expect(ROOT_ALLOWED_TOOLS).toContain("Read");
    });
  });

  describe("Telemetry config", () => {
    it("should have MIN_METRIC_INTERVAL", () => {
      expect(TELEMETRY_CONFIG.MIN_METRIC_INTERVAL).toBe(100);
    });

    it("should have MAX_METRIC_INTERVAL", () => {
      expect(TELEMETRY_CONFIG.MAX_METRIC_INTERVAL).toBe(3600000);
    });

    it("should have DEFAULT_METRIC_INTERVAL", () => {
      expect(TELEMETRY_CONFIG.DEFAULT_METRIC_INTERVAL).toBe(10000);
    });

    it("should have DEFAULT_SERVICE_NAME", () => {
      expect(TELEMETRY_CONFIG.DEFAULT_SERVICE_NAME).toBe("claude-sub-agent");
    });

    it("should have min less than default less than max", () => {
      expect(TELEMETRY_CONFIG.MIN_METRIC_INTERVAL).toBeLessThan(
        TELEMETRY_CONFIG.DEFAULT_METRIC_INTERVAL
      );
      expect(TELEMETRY_CONFIG.DEFAULT_METRIC_INTERVAL).toBeLessThan(
        TELEMETRY_CONFIG.MAX_METRIC_INTERVAL
      );
    });
  });
});

describe("telemetry.ts - Telemetry Management", () => {
  const originalEnv = process.env.CLAUDE_CODE_ENABLE_TELEMETRY;

  afterEach(async () => {
    // Cleanup: shutdown telemetry and restore env
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore errors during cleanup
    }
    if (originalEnv === undefined) {
      delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
    } else {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = originalEnv;
    }
  });

  describe("Initialization", () => {
    it("should not initialize when telemetry is disabled", () => {
      delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });

    it("should not initialize when env var is 0", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "0";
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });

    it("should initialize when env var is 1", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(true);
    });

    it("should prevent double initialization", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      initTelemetry();
      const firstInit = isTelemetryInitialized();
      initTelemetry(); // Try to initialize again
      expect(isTelemetryInitialized()).toBe(firstInit);
    });
  });

  describe("Shutdown", () => {
    it("should handle shutdown when not initialized", async () => {
      delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
      await expect(shutdownTelemetry()).resolves.not.toThrow();
    });

    it("should shutdown when initialized", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(true);
      await shutdownTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });

    it("should handle multiple shutdown calls gracefully", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      initTelemetry();
      await shutdownTelemetry();
      await expect(shutdownTelemetry()).resolves.not.toThrow();
    });
  });

  describe("State checking", () => {
    it("should return false when not initialized", () => {
      delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
      expect(isTelemetryInitialized()).toBe(false);
    });

    it("should return true when initialized", () => {
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
});

describe("Integration Tests", () => {
  describe("Error handling across modules", () => {
    it("should use getErrorMessage for calculateAverage errors", () => {
      try {
        calculateAverage([]);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("Cannot calculate average of an empty array");
      }
    });

    it("should use getErrorMessage for getUserName errors", () => {
      try {
        getUserName(null);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("User cannot be null or undefined");
      }
    });
  });

  describe("Constants usage in telemetry", () => {
    const originalEnv = process.env.CLAUDE_CODE_ENABLE_TELEMETRY;

    afterEach(async () => {
      try {
        await shutdownTelemetry();
      } catch {
        // Ignore
      }
      if (originalEnv === undefined) {
        delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
      } else {
        process.env.CLAUDE_CODE_ENABLE_TELEMETRY = originalEnv;
      }
    });

    it("should use constants for configuration", () => {
      expect(TELEMETRY_CONFIG.MIN_METRIC_INTERVAL).toBe(100);
      expect(TELEMETRY_CONFIG.DEFAULT_METRIC_INTERVAL).toBe(10000);
    });
  });
});
