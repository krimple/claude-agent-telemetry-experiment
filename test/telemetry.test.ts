import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Tests for telemetry module parsing and validation logic
 * Note: We test the parsing logic indirectly through environment variables
 */
describe("telemetry module", () => {
  // Store original env values
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment before each test
    delete process.env.CLAUDE_CODE_ENABLE_TELEMETRY;
    delete process.env.OTEL_METRIC_EXPORT_INTERVAL;

    // Clear module cache to reload with new env vars
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe("parseMetricExportInterval", () => {
    it("should handle valid positive integer", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "5000";

      // This would initialize with 5000ms interval
      // We can't directly test the private function, but we verify it doesn't throw
      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      expect(() => initTelemetry()).not.toThrow();
      await shutdownTelemetry();
    });

    it("should handle zero interval (invalid)", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "0";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      // Should warn about invalid value
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid OTEL_METRIC_EXPORT_INTERVAL value: "0"')
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should handle negative interval (invalid)", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "-1000";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid OTEL_METRIC_EXPORT_INTERVAL value: "-1000"')
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should handle non-numeric string (invalid)", async () => {
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

    it("should handle very small positive interval with warning", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "1";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      // Should warn about too small interval and clamp to minimum
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("is too small and may cause performance issues")
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should accept interval at minimum threshold (100ms)", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "100";

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      // Should NOT warn for exactly 100ms
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("is too small")
      );

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });

    it("should handle very large interval", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "999999999";

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      expect(() => initTelemetry()).not.toThrow();
      await shutdownTelemetry();
    });
  });

  describe("initTelemetry", () => {
    it("should not initialize when telemetry is disabled", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "0";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { initTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith("Telemetry disabled");
      consoleSpy.mockRestore();
    });

    it("should initialize when telemetry is enabled", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { initTelemetry, shutdownTelemetry } = await import("../src/telemetry.js");
      initTelemetry();

      expect(consoleSpy).toHaveBeenCalledWith("Telemetry initialized");

      await shutdownTelemetry();
      consoleSpy.mockRestore();
    });
  });

  describe("shutdownTelemetry", () => {
    it("should handle shutdown when not initialized", async () => {
      const { shutdownTelemetry } = await import("../src/telemetry.js");

      // Should not throw when SDK is null
      await expect(shutdownTelemetry()).resolves.toBeUndefined();
    });

    it("should shutdown when initialized", async () => {
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
