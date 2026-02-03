import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  initTelemetry,
  shutdownTelemetry,
  isTelemetryInitialized,
} from "../src/telemetry.js";

/**
 * Edge case tests for telemetry interval parsing and validation
 */

describe("telemetry - parseExportInterval edge cases", () => {
  let originalEnv: NodeJS.ProcessEnv;
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(async () => {
    originalEnv = { ...process.env };
    consoleWarnSpy.mockClear();
    // Ensure clean state
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore
    }
  });

  afterEach(async () => {
    process.env = originalEnv;
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore
    }
  });

  describe("Invalid metric interval values", () => {
    it("should warn and use default for NaN metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "not-a-number";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid OTEL_METRIC_EXPORT_INTERVAL")
      );
    });

    it("should warn and use default for negative metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "-1000";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid OTEL_METRIC_EXPORT_INTERVAL")
      );
    });

    it("should warn and use default for zero metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "0";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid OTEL_METRIC_EXPORT_INTERVAL")
      );
    });

    it("should warn and clamp too small metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "50"; // Less than MIN_INTERVAL (100)
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("OTEL_METRIC_EXPORT_INTERVAL value 50ms is too small")
      );
    });

    it("should warn and clamp too large metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "9999999999"; // Greater than MAX_INTERVAL
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "OTEL_METRIC_EXPORT_INTERVAL value 9999999999ms is too large"
        )
      );
    });

    it("should handle empty string metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "";
      initTelemetry();
      // Empty string should be treated as not set, no warning about OTEL_METRIC_EXPORT_INTERVAL
      const relevantWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.includes("OTEL_METRIC_EXPORT_INTERVAL")
      );
      expect(relevantWarnings).toHaveLength(0);
    });

    it("should handle decimal metric interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "5000.5";
      initTelemetry();
      // Should parse as integer 5000, no warning about OTEL_METRIC_EXPORT_INTERVAL
      const relevantWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.includes("OTEL_METRIC_EXPORT_INTERVAL")
      );
      expect(relevantWarnings).toHaveLength(0);
    });
  });

  describe("Invalid trace interval values", () => {
    it("should warn and use default for NaN trace interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "invalid";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid OTEL_TRACE_EXPORT_INTERVAL")
      );
    });

    it("should warn and use default for negative trace interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "-5000";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid OTEL_TRACE_EXPORT_INTERVAL")
      );
    });

    it("should warn and clamp too small trace interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "10"; // Less than MIN_INTERVAL (100)
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("OTEL_TRACE_EXPORT_INTERVAL value 10ms is too small")
      );
    });

    it("should warn and clamp too large trace interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "99999999999";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("OTEL_TRACE_EXPORT_INTERVAL value 99999999999ms is too large")
      );
    });
  });

  describe("Boundary values", () => {
    it("should accept minimum allowed metric interval (100ms)", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "100";
      initTelemetry();
      const relevantWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.includes("OTEL_METRIC_EXPORT_INTERVAL")
      );
      expect(relevantWarnings).toHaveLength(0);
    });

    it("should accept maximum allowed metric interval (3600000ms)", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "3600000";
      initTelemetry();
      const relevantWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.includes("OTEL_METRIC_EXPORT_INTERVAL")
      );
      expect(relevantWarnings).toHaveLength(0);
    });

    it("should accept minimum allowed trace interval (100ms)", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "100";
      initTelemetry();
      const relevantWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.includes("OTEL_TRACE_EXPORT_INTERVAL")
      );
      expect(relevantWarnings).toHaveLength(0);
    });

    it("should accept maximum allowed trace interval (3600000ms)", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_TRACE_EXPORT_INTERVAL = "3600000";
      initTelemetry();
      const relevantWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.includes("OTEL_TRACE_EXPORT_INTERVAL")
      );
      expect(relevantWarnings).toHaveLength(0);
    });

    it("should reject value just below minimum (99ms)", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "99";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("too small")
      );
    });

    it("should reject value just above maximum (3600001ms)", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "3600001";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("too large")
      );
    });
  });

  describe("Special string values", () => {
    it("should handle whitespace-only interval", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "   ";
      initTelemetry();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid")
      );
    });

    it("should handle hex number string", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "0x1000";
      initTelemetry();
      // parseInt with radix 10 will parse as 0, which is invalid
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid")
      );
    });

    it("should handle scientific notation", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      process.env.OTEL_METRIC_EXPORT_INTERVAL = "1e3"; // 1000
      initTelemetry();
      // parseInt parses this as 1, which is too small
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("too small")
      );
    });
  });

  describe("Error handling during initialization", () => {
    it("should reset state on initialization failure", async () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      // Force an error by using invalid exporter endpoint
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "not-a-valid-url://test";

      try {
        initTelemetry();
        // May or may not throw depending on validation
      } catch {
        // Expected
      }

      // State should allow re-initialization
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = originalEnv.OTEL_EXPORTER_OTLP_ENDPOINT || "";
      expect(() => initTelemetry()).not.toThrow();
    });
  });

  describe("Concurrent initialization", () => {
    it("should prevent double initialization", () => {
      process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      initTelemetry();
      initTelemetry(); // Second call

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("already initialized")
      );

      consoleLogSpy.mockRestore();
    });
  });
});

describe("telemetry - initialization state management", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore
    }
  });

  afterEach(async () => {
    process.env = originalEnv;
    try {
      await shutdownTelemetry();
    } catch {
      // Ignore
    }
  });

  it("should report correct initialization state throughout lifecycle", async () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

    // Before init
    expect(isTelemetryInitialized()).toBe(false);

    // After init
    initTelemetry();
    expect(isTelemetryInitialized()).toBe(true);

    // After shutdown
    await shutdownTelemetry();
    expect(isTelemetryInitialized()).toBe(false);

    // After re-init
    initTelemetry();
    expect(isTelemetryInitialized()).toBe(true);

    // Cleanup
    await shutdownTelemetry();
  });

  it("should handle rapid init/shutdown cycles", async () => {
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";

    for (let i = 0; i < 3; i++) {
      initTelemetry();
      expect(isTelemetryInitialized()).toBe(true);
      await shutdownTelemetry();
      expect(isTelemetryInitialized()).toBe(false);
    }
  });
});
