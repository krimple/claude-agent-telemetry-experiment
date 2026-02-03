import "dotenv/config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { logs } from "@opentelemetry/api-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getErrorMessage } from "./errorUtils.js";
import { TELEMETRY_CONFIG } from "./constants.js";

let sdk: NodeSDK | null = null;
let loggerProvider: LoggerProvider | null = null;

/**
 * Checks if telemetry is enabled via environment variable.
 * This is checked at runtime rather than module load time to allow for testing.
 *
 * @returns True if telemetry should be enabled
 */
function isTelemetryEnabled(): boolean {
  return process.env.CLAUDE_CODE_ENABLE_TELEMETRY === "1";
}

/**
 * Parses an export interval from environment variable with validation.
 *
 * @param envName - The environment variable name (for error messages)
 * @param envValue - The environment variable value to parse
 * @param defaultValue - The default value to use if parsing fails
 * @returns The parsed interval in milliseconds or the default value
 *
 * @remarks
 * Enforces a minimum interval of 100ms to prevent performance issues.
 * Enforces a maximum interval of 3600000ms (1 hour) to prevent stale data.
 * Values outside this range will be clamped with a warning.
 */
function parseExportInterval(
  envName: string,
  envValue: string | undefined,
  defaultValue: number
): number {
  const MIN_INTERVAL = TELEMETRY_CONFIG.MIN_METRIC_INTERVAL;
  const MAX_INTERVAL = TELEMETRY_CONFIG.MAX_METRIC_INTERVAL;

  if (!envValue) {
    return defaultValue;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed) || parsed <= 0) {
    console.warn(
      `Invalid ${envName} value: "${envValue}". Using default: ${defaultValue}ms`
    );
    return defaultValue;
  }

  // Warn and clamp if interval is too small
  if (parsed < MIN_INTERVAL) {
    console.warn(
      `${envName} value ${parsed}ms is too small and may cause performance issues. Using minimum: ${MIN_INTERVAL}ms`
    );
    return MIN_INTERVAL;
  }

  // Warn and clamp if interval is too large
  if (parsed > MAX_INTERVAL) {
    console.warn(
      `${envName} value ${parsed}ms is too large and may cause stale data. Using maximum: ${MAX_INTERVAL}ms`
    );
    return MAX_INTERVAL;
  }

  return parsed;
}

/**
 * Initializes OpenTelemetry instrumentation for traces, metrics, and logs.
 * Only initializes if CLAUDE_CODE_ENABLE_TELEMETRY environment variable is set to "1".
 *
 * @remarks
 * Configures OTLP exporters for traces, metrics, and logs with automatic instrumentation.
 * - OTEL_TRACE_EXPORT_INTERVAL: Trace flush interval in ms (default: 5000)
 * - OTEL_METRIC_EXPORT_INTERVAL: Metric export interval in ms (default: 10000)
 *
 * @example
 * // Enable telemetry
 * process.env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";
 * initTelemetry();
 */
export function initTelemetry(): void {
  if (!isTelemetryEnabled()) {
    console.log("Telemetry disabled");
    return;
  }

  // Prevent double initialization
  if (sdk !== null) {
    console.warn("Telemetry already initialized, skipping...");
    return;
  }

  try {
    const traceExporter = new OTLPTraceExporter();
    const metricExporter = new OTLPMetricExporter();
    const logExporter = new OTLPLogExporter();

    const exportIntervalMillis = parseExportInterval(
      "OTEL_METRIC_EXPORT_INTERVAL",
      process.env.OTEL_METRIC_EXPORT_INTERVAL,
      TELEMETRY_CONFIG.DEFAULT_METRIC_INTERVAL
    );

    // Create shared resource for consistent service identification
    const serviceName = process.env.OTEL_SERVICE_NAME || TELEMETRY_CONFIG.DEFAULT_SERVICE_NAME;
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    });

    // Create and register LoggerProvider with global API
    // This is required for logs.getLogger() to work
    // Using SimpleLogRecordProcessor for immediate export (debug)
    loggerProvider = new LoggerProvider({
      resource,
      processors: [new SimpleLogRecordProcessor(logExporter)],
    });
    logs.setGlobalLoggerProvider(loggerProvider);

    // Use BatchSpanProcessor with configurable flush interval
    // Default 5 seconds for near-real-time visibility in Honeycomb
    const traceExportIntervalMillis = parseExportInterval(
      "OTEL_TRACE_EXPORT_INTERVAL",
      process.env.OTEL_TRACE_EXPORT_INTERVAL,
      5000
    );
    const spanProcessor = new BatchSpanProcessor(traceExporter, {
      scheduledDelayMillis: traceExportIntervalMillis,
      maxExportBatchSize: 512,
      maxQueueSize: 2048,
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      spanProcessors: [spanProcessor],
      metricReaders: [
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis,
        }),
      ],
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log("Telemetry initialized");
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to initialize telemetry:", errorMessage);
    // Reset state on failure
    sdk = null;
    loggerProvider = null;
    throw error;
  }
}

/**
 * Gracefully shuts down the OpenTelemetry SDK.
 * Ensures all pending telemetry data is exported before shutdown.
 *
 * @remarks
 * This function should be called before the application exits to ensure
 * all telemetry data is properly flushed and exported.
 *
 * @example
 * await shutdownTelemetry();
 */
export async function shutdownTelemetry(): Promise<void> {
  if (!sdk && !loggerProvider) {
    return;
  }

  try {
    if (loggerProvider) {
      await loggerProvider.shutdown();
      loggerProvider = null;
    }
    if (sdk) {
      await sdk.shutdown();
      sdk = null;
    }
    console.log("Telemetry shut down");
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error during telemetry shutdown:", errorMessage);
    // Still reset state to prevent future shutdown attempts
    sdk = null;
    loggerProvider = null;
    throw error;
  }
}

/**
 * Checks if telemetry is currently initialized.
 *
 * @returns True if both telemetry SDK and logger provider are initialized, false otherwise
 *
 * @example
 * if (isTelemetryInitialized()) {
 *   console.log("Telemetry is running");
 * }
 */
export function isTelemetryInitialized(): boolean {
  return sdk !== null && loggerProvider !== null;
}
