import dotenv from "dotenv";
import { initTelemetry, shutdownTelemetry } from "./telemetry.js";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { getErrorMessage, stripAnsiCodes } from "./errorUtils.js";
import { withAgentTelemetry } from "./telemetryHooksSingleTrace.js";
import {
  mainPrompt,
  canUseTool,
  allowedTools,
  permissionMode,
  agents,
} from "./queryConfig.js";

const otelEnv: Record<string, string> = {};
dotenv.config({ processEnv: otelEnv });

async function main(): Promise<void> {
  initTelemetry();

  const tracer = trace.getTracer("claude-agent", "1.0.0");
  const telemetry = withAgentTelemetry(tracer);

  try {
    for await (const message of query({
      prompt: mainPrompt,
      options: {
        hooks: telemetry.hooks,
        canUseTool,
        allowedTools: [...allowedTools],
        permissionMode,
        agents,
      },
    })) {
      console.log(message);
    }

    telemetry.rootSpan.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    const rawMessage = getErrorMessage(error);
    const errorMessage = stripAnsiCodes(rawMessage);
    console.error("Error during agent execution:", errorMessage);

    telemetry.rootSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: errorMessage,
    });
    telemetry.rootSpan.recordException(new Error(errorMessage));

    throw error;
  } finally {
    telemetry.cleanup();
    telemetry.rootSpan.end();

    try {
      await shutdownTelemetry();
    } catch (shutdownError) {
      console.error(
        "Error during telemetry shutdown:",
        getErrorMessage(shutdownError),
      );
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", getErrorMessage(error));
  process.exit(1);
});
