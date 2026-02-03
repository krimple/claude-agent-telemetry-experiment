import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateAverage, getUserName, User } from "../src/utils.js";
import { getErrorMessage } from "../src/errorUtils.js";

/**
 * Comprehensive integration test suite for all modules
 * This test suite covers:
 * - utils.ts: calculateAverage and getUserName functions
 * - errorUtils.ts: getErrorMessage function
 * - telemetry.ts: initialization and shutdown (tested with environment variables)
 */

describe("Complete Integration Test Suite", () => {
  describe("utils.ts - calculateAverage", () => {
    describe("valid inputs", () => {
      it("should calculate average of positive integers", () => {
        expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      });

      it("should calculate average of negative numbers", () => {
        expect(calculateAverage([-1, -2, -3])).toBe(-2);
      });

      it("should calculate average of mixed positive and negative numbers", () => {
        expect(calculateAverage([-10, 10, 0])).toBe(0);
      });

      it("should handle single number array", () => {
        expect(calculateAverage([42])).toBe(42);
      });

      it("should handle decimal numbers with precision", () => {
        expect(calculateAverage([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
      });

      it("should handle array with zeros", () => {
        expect(calculateAverage([0, 0, 0])).toBe(0);
      });

      it("should handle very small decimal numbers", () => {
        expect(calculateAverage([0.001, 0.002, 0.003])).toBeCloseTo(0.002);
      });

      it("should handle very large numbers without overflow", () => {
        const result = calculateAverage([Number.MAX_VALUE / 2, Number.MAX_VALUE / 2]);
        expect(result).toBe(Number.MAX_VALUE / 2);
      });

      it("should handle negative zero", () => {
        expect(calculateAverage([0, -0])).toBe(0);
      });
    });

    describe("error conditions", () => {
      it("should throw error for empty array", () => {
        expect(() => calculateAverage([])).toThrow("Cannot calculate average of an empty array");
      });

      it("should throw error for array containing NaN", () => {
        expect(() => calculateAverage([1, 2, NaN, 4])).toThrow(
          "Cannot calculate average of array containing NaN"
        );
      });

      it("should throw error for array with only NaN", () => {
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

      it("should handle division by very small numbers", () => {
        const result = calculateAverage([Number.MIN_VALUE, Number.MIN_VALUE]);
        expect(Number.isFinite(result)).toBe(true);
      });
    });
  });

  describe("utils.ts - getUserName", () => {
    describe("valid inputs", () => {
      it("should return uppercase name for valid user", () => {
        expect(getUserName({ name: "john" })).toBe("JOHN");
      });

      it("should handle already uppercase names", () => {
        expect(getUserName({ name: "JANE" })).toBe("JANE");
      });

      it("should handle mixed case names", () => {
        expect(getUserName({ name: "JoHn DoE" })).toBe("JOHN DOE");
      });

      it("should throw error for empty string name", () => {
        expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
      });

      it("should handle names with special characters", () => {
        expect(getUserName({ name: "josé-maría" })).toBe("JOSÉ-MARÍA");
      });

      it("should handle names with numbers", () => {
        expect(getUserName({ name: "user123" })).toBe("USER123");
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

      it("should throw error for whitespace-only name", () => {
        expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
      });

      it("should handle unicode characters", () => {
        expect(getUserName({ name: "αβγδ" })).toBe("ΑΒΓΔ");
      });
    });

    describe("error conditions", () => {
      it("should throw error for null user", () => {
        expect(() => getUserName(null as any)).toThrow("User cannot be null or undefined");
      });

      it("should throw error for undefined user", () => {
        expect(() => getUserName(undefined as any)).toThrow(
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
        const error = new ReferenceError("Undefined variable");
        expect(getErrorMessage(error)).toBe("Undefined variable");
      });

      it("should handle SyntaxError instances", () => {
        const error = new SyntaxError("Invalid syntax");
        expect(getErrorMessage(error)).toBe("Invalid syntax");
      });

      it("should handle custom Error instances", () => {
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

    describe("primitive types", () => {
      it("should handle string errors", () => {
        expect(getErrorMessage("String error")).toBe("String error");
      });

      it("should handle empty string errors", () => {
        expect(getErrorMessage("")).toBe("");
      });

      it("should handle number errors", () => {
        expect(getErrorMessage(123)).toBe("123");
        expect(getErrorMessage(0)).toBe("0");
        expect(getErrorMessage(-456)).toBe("-456");
      });

      it("should handle NaN", () => {
        expect(getErrorMessage(NaN)).toBe("NaN");
      });

      it("should handle Infinity", () => {
        expect(getErrorMessage(Infinity)).toBe("Infinity");
        expect(getErrorMessage(-Infinity)).toBe("-Infinity");
      });

      it("should handle null", () => {
        expect(getErrorMessage(null)).toBe("null");
      });

      it("should handle undefined", () => {
        expect(getErrorMessage(undefined)).toBe("undefined");
      });

      it("should handle boolean errors", () => {
        expect(getErrorMessage(true)).toBe("true");
        expect(getErrorMessage(false)).toBe("false");
      });
    });

    describe("complex types", () => {
      it("should handle object errors", () => {
        const error = { code: 500, message: "Server error" };
        const result = getErrorMessage(error);
        expect(result).toContain("code");
        expect(result).toContain("500");
      });

      it("should handle array errors", () => {
        const error = [1, 2, 3];
        expect(getErrorMessage(error)).toBe("1,2,3");
      });

      it("should handle empty array", () => {
        expect(getErrorMessage([])).toBe("");
      });

      it("should handle symbol errors", () => {
        const symbol = Symbol("test");
        const result = getErrorMessage(symbol);
        expect(result).toContain("Symbol(test)");
      });

      it("should handle function errors", () => {
        const func = () => {};
        const result = getErrorMessage(func);
        // Arrow functions stringify to "() => {}" not "function"
        expect(result).toMatch(/=>|function/);
      });

      it("should handle nested objects", () => {
        const error = { nested: { value: "deep" } };
        const result = getErrorMessage(error);
        expect(typeof result).toBe("string");
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should handle error from calculateAverage in error handler", () => {
      try {
        calculateAverage([]);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("Cannot calculate average of an empty array");
      }
    });

    it("should handle error from getUserName in error handler", () => {
      try {
        getUserName(null as any);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("User cannot be null or undefined");
      }
    });

    it("should process user data and calculate averages", () => {
      const user: User = { name: "john doe" };
      const scores = [85, 90, 92, 88, 95];

      const userName = getUserName(user);
      const averageScore = calculateAverage(scores);

      expect(userName).toBe("JOHN DOE");
      expect(averageScore).toBe(90);
    });

    it("should handle multiple operations in sequence", () => {
      const users: User[] = [
        { name: "alice" },
        { name: "bob" },
        { name: "charlie" },
      ];

      const upperNames = users.map((user) => getUserName(user));
      expect(upperNames).toEqual(["ALICE", "BOB", "CHARLIE"]);

      const nameLengths = upperNames.map((name) => name.length);
      // ALICE = 5, BOB = 3, CHARLIE = 7
      // Average = (5 + 3 + 7) / 3 = 15 / 3 = 5
      const avgLength = calculateAverage(nameLengths);
      expect(avgLength).toBe(5);
    });

    it("should gracefully handle errors in pipeline", () => {
      const mixedData = [
        { name: "valid" },
        null,
        { name: "another" },
      ];

      const results = mixedData.map((item) => {
        try {
          return getUserName(item as any);
        } catch (error) {
          return getErrorMessage(error);
        }
      });

      expect(results[0]).toBe("VALID");
      expect(results[1]).toBe("User cannot be null or undefined");
      expect(results[2]).toBe("ANOTHER");
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("should handle extreme values in calculateAverage", () => {
      const result = calculateAverage([Number.MAX_SAFE_INTEGER, 0, -Number.MAX_SAFE_INTEGER]);
      expect(result).toBe(0);
    });

    it("should handle very long user names", () => {
      const longName = "a".repeat(1000);
      const user: User = { name: longName };
      const result = getUserName(user);
      expect(result).toBe("A".repeat(1000));
      expect(result.length).toBe(1000);
    });

    it("should handle arrays with single element", () => {
      expect(calculateAverage([0])).toBe(0);
      expect(calculateAverage([1])).toBe(1);
      expect(calculateAverage([-1])).toBe(-1);
    });

    it("should handle names with only special characters", () => {
      expect(getUserName({ name: "!@#$%^&*()" })).toBe("!@#$%^&*()");
    });

    it("should handle mixed tabs and spaces in names", () => {
      expect(getUserName({ name: "\t  john  \t" })).toBe("JOHN");
    });

    it("should handle newlines in names", () => {
      expect(getUserName({ name: "\njohn\n" })).toBe("JOHN");
    });
  });
});

describe("Telemetry Integration Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
    delete process.env.OTEL_METRIC_EXPORT_INTERVAL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("initialization and shutdown", () => {
    it("should not initialize when disabled", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "0";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { initTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith("Telemetry disabled");
      consoleSpy.mockRestore();
    });

    it("should initialize when enabled", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith("Telemetry initialized");

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    }, 30000); // Extended timeout for OTLP SDK shutdown

    it("should prevent double initialization", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();
      initTelemetry(); // Try to initialize again

      expect(consoleSpy).toHaveBeenCalledWith("Telemetry already initialized, skipping...");

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should check initialization status", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      const { initTelemetry, shutdownTelemetry, isTelemetryInitialized } = await import(
        "../src/telemetry.js"
      );

      expect(isTelemetryInitialized()).toBe(false);

      initTelemetry();
      expect(isTelemetryInitialized()).toBe(true);

      await shutdownTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    });
  });

  describe("metric export interval validation", () => {
    it("should use default interval when not specified", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      expect(() => initTelemetry()).not.toThrow();
      await shutdownTelemetry();
    });

    it("should accept valid custom interval", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "5000";

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      expect(() => initTelemetry()).not.toThrow();
      await shutdownTelemetry();
    });

    it("should warn and use default for invalid interval (zero)", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "0";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid OTEL_METRIC_EXPORT_INTERVAL value: "0"')
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should warn and use default for invalid interval (negative)", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "-500";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid OTEL_METRIC_EXPORT_INTERVAL value: "-500"')
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should warn and clamp interval that is too small", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "50"; // Below 100ms minimum

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("is too small and may cause performance issues")
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should accept interval at minimum threshold", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "100"; // Exactly at minimum

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("is too small")
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should warn and clamp interval that is too large", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "999999999"; // Way above 1 hour max

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("is too large and may cause stale metrics")
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should warn for non-numeric interval", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "not-a-number";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid OTEL_METRIC_EXPORT_INTERVAL value: "not-a-number"')
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("should handle shutdown when not initialized", async () => {
      const { shutdownTelemetry } = await import("../src/telemetry.js");
      await expect(shutdownTelemetry()).resolves.toBeUndefined();
    });

    it("should complete shutdown successfully", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();
      await shutdownTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith("Telemetry shut down");
      consoleSpy.mockRestore();
    });
  });
});
