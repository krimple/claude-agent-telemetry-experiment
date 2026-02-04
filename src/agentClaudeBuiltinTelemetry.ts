import dotenv from "dotenv";
import { initTelemetry, shutdownTelemetry } from "./telemetry.js";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { getErrorMessage } from "./errorUtils.js";
import {
  mainPrompt,
  canUseTool,
  allowedTools,
  permissionMode,
  agents,
} from "./queryConfig.js";

// load env into local var
const otelEnv: Record<string, string> = {};
dotenv.config({ processEnv: otelEnv });

/**
 * This one just runs the build-in claude telemetry in logs. Note, I can't
 * currently get it to export metrics, something is either wrong or maybe
 * the agent SDK doesn't export them like the Claude client SDK does.
 * 
 * I had to go through some trickery to get it to read the env - if you just
 * put the env vars in from dotenv, it doesn't include PATH and it can't see
 * claude code... Oh fun! -- Ken
 */
async function main(): Promise<void> {
  initTelemetry();

  const tracer = trace.getTracer("claude-agent", "1.0.0");

  try {
    for await (const message of query({
      prompt: mainPrompt,
      options: {
        //hooks: telemetry.hooks,
        canUseTool,
        allowedTools: [...allowedTools],
        permissionMode,
        agents,
        env: {
            ...process.env,
            OTEL_LOG_USER_PROMPTS: otelEnv.OTEL_LOG_USER_PROMPTS,
            CLAUDE_CODE_ENABLE_TELEMETRY: otelEnv.CLAUDE_CODE_ENABLE_TELEMETRY,
            OTEL_LOGS_EXPORTER: otelEnv.OTEL_LOGS_EXPORTER,
            OTEL_METRICS_EXPORTER: otelEnv.OTEL_METRICS_EXPORTER,
            OTEL_METRICS_OTLP_PROTOCOL: otelEnv.OTEL_METRICS_OTLP_PROTOCOL,
            OTEL_LOGS_OTLP_PROTOCOL: otelEnv.OTEL_LOGS_OTLP_PROTOCOL,
            OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: otelEnv.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
            OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: otelEnv.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
            OTEL_EXPORTER_OTLP_HEADERS: otelEnv.OTEL_EXPORTER_OTLP_HEADERS,
            OTEL_SERVICE_NAME: otelEnv.OTEL_SERVICE_NAME,
            OTEL_LOGS_EXPORT_INTERVAL: otelEnv.OTEL_METRIC_EXPORT_INTERVAL,
            OTEL_METRICS_EXPORT_INTERVAL: otelEnv.OTEL_METRICS_EXPORT_INTERVAL,
        }
      },
    })) {
      console.log(message);
    }
  } catch (error) {
    console.error("Error during agent execution:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("Fatal error:", getErrorMessage(error));
  process.exit(1);
});
