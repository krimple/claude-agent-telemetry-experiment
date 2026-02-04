import "dotenv/config";
import { initTelemetry, shutdownTelemetry } from "./telemetry.js";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { getErrorMessage } from "./errorUtils.js";
import { withAgentTelemetry } from "./telemetryHooksIndividualTraces.js";
import {
  mainPrompt,
  canUseTool,
  allowedTools,
  permissionMode,
  agents,
} from "./queryConfig.js";

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
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error during agent execution:", errorMessage);

    // Create a single error span with exception recorded
    const errorSpan = tracer.startSpan("agent.error");
    errorSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: errorMessage,
    });
    errorSpan.recordException(
      error instanceof Error ? error : new Error(errorMessage),
    );
    errorSpan.end();

    throw error;
  } finally {
    telemetry.cleanup();

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
