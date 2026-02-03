import "dotenv/config";
import { initTelemetry, shutdownTelemetry } from "./telemetry.js";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { getErrorMessage } from "./errorUtils.js";
import { withAgentTelemetry } from "./telemetryHooksByAgent.js";

async function main(): Promise<void> {
  initTelemetry();

  const tracer = trace.getTracer("claude-agent", "1.0.0");
  const telemetry = withAgentTelemetry(tracer);

  try {
    for await (const message of query({
      prompt: `
Do all of your tasks through the agents code-reviewer and test-runner.

code-reviewer agent: Review code in ./questionable-code, fix bugs, and write the corrected version to ./reviewed-code.
test-runner agent: Always write tests first, verify problems, then fix them.
`,
      options: {
        hooks: telemetry.hooks,

        canUseTool: async (toolName, input, options) => {
          const { agentID } = options;
          const isSubAgent = agentID !== undefined;

          if (!isSubAgent && toolName === "Bash") {
            return {
              behavior: "deny",
              message: "Use sub-agents for Bash operations",
            };
          }
          return { behavior: "allow", updatedInput: input };
        },

        allowedTools: ["Read", "Glob", "Grep", "Task"],
        permissionMode: "acceptEdits",
        agents: {
          "code-reviewer": {
            description:
              "Reviews code for bugs, security issues, and best practices. Does not write tests.",
            prompt:
              "Review code in ./questionable-code directory. Identify bugs, security issues, and code quality problems. Write the fixed version to ./reviewed-code directory. Do not write tests.",
            tools: ["Bash", "Read", "Write", "Grep", "Edit"],
          },
          "test-runner": {
            description:
              "Writes and runs tests to verify code behavior. Does not review code.",
            prompt:
              "Write tests for code in ./reviewed-code to verify expected behavior. Run tests to identify problems. Fix issues based on test results. Do not write source code, just tests.",
            tools: ["Bash", "Read", "Grep", "Edit", "Write"],
          },
        },
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
