import { SpanStatusCode } from "@opentelemetry/api";
import type { Tracer, Span } from "@opentelemetry/api";

const MAX_ATTRIBUTE_LENGTH = 10000;

function truncateAttribute(
  value: string,
  maxLength: number = MAX_ATTRIBUTE_LENGTH,
): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.substring(0, maxLength) + "... [truncated]";
}

export interface TelemetryContext {
  hooks: Record<string, unknown>;
  cleanup: () => void;
}

interface SpanData {
  span: Span;
  startTime: number;
}

export function withAgentTelemetry(tracer: Tracer): TelemetryContext {
  const agentSpans = new Map<string, SpanData>();
  const toolSpans = new Map<string, SpanData>();

  const hooks = {
    UserPromptSubmit: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "UserPromptSubmit") {
              const span = tracer.startSpan("user_prompt_submit");
              span.setAttributes({
                "session.id": input.session_id,
                "prompt": truncateAttribute(input.prompt),
                "prompt.length": input.prompt.length,
                "cwd": input.cwd,
                "permission_mode": input.permission_mode || "",
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    SubagentStart: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "SubagentStart") {
              const span = tracer.startSpan(`agent.${input.agent_type}`);
              span.setAttributes({
                "agent.id": input.agent_id,
                "agent.type": input.agent_type,
                "session.id": input.session_id,
              });

              agentSpans.set(input.agent_id, {
                span,
                startTime: Date.now(),
              });
            }
            return { continue: true };
          },
        ],
      },
    ],

    SubagentStop: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "SubagentStop") {
              const agentData = agentSpans.get(input.agent_id);
              if (agentData) {
                const duration = Date.now() - agentData.startTime;
                agentData.span.setAttribute(
                  "agent.transcript_path",
                  input.agent_transcript_path,
                );
                agentData.span.setAttribute("duration_ms", duration);
                agentData.span.setStatus({ code: SpanStatusCode.OK });
                agentData.span.end();
                agentSpans.delete(input.agent_id);
              }
            }
            return { continue: true };
          },
        ],
      },
    ],

    PreToolUse: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "PreToolUse") {
              const span = tracer.startSpan(`tool.${input.tool_name}`);
              let toolInputStr = "[unable to stringify]";
              try {
                toolInputStr = JSON.stringify(input.tool_input);
              } catch {
                toolInputStr = String(input.tool_input);
              }

              span.setAttributes({
                "tool.name": input.tool_name,
                "tool.use_id": input.tool_use_id,
                "tool.input": truncateAttribute(toolInputStr),
                "session.id": input.session_id,
              });

              toolSpans.set(input.tool_use_id, {
                span,
                startTime: Date.now(),
              });
            }
            return { continue: true };
          },
        ],
      },
    ],

    PostToolUse: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "PostToolUse") {
              const toolData = toolSpans.get(input.tool_use_id);
              if (toolData) {
                const duration = Date.now() - toolData.startTime;
                let responseSize = 0;
                try {
                  responseSize = JSON.stringify(input.tool_response).length;
                } catch {
                  responseSize = String(input.tool_response).length;
                }

                toolData.span.setAttribute("duration_ms", duration);
                toolData.span.setAttribute(
                  "tool.response.size_bytes",
                  responseSize,
                );
                toolData.span.setAttribute("tool.success", true);
                toolData.span.setStatus({ code: SpanStatusCode.OK });
                toolData.span.end();
                toolSpans.delete(input.tool_use_id);
              }
            }
            return { continue: true };
          },
        ],
      },
    ],

    PostToolUseFailure: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "PostToolUseFailure") {
              const toolData = toolSpans.get(input.tool_use_id);
              if (toolData) {
                const duration = Date.now() - toolData.startTime;
                toolData.span.setAttribute("duration_ms", duration);
                toolData.span.setAttribute("tool.success", false);
                toolData.span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: "Tool execution failed",
                });
                toolData.span.end();
                toolSpans.delete(input.tool_use_id);
              }
            }
            return { continue: true };
          },
        ],
      },
    ],

    SessionStart: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "SessionStart") {
              const span = tracer.startSpan("session_start");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    SessionEnd: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "SessionEnd") {
              const span = tracer.startSpan("session_end");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    Notification: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "Notification") {
              const span = tracer.startSpan("notification");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    PermissionRequest: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "PermissionRequest") {
              const span = tracer.startSpan("permission_request");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    PreCompact: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "PreCompact") {
              const span = tracer.startSpan("pre_compact");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    Stop: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "Stop") {
              const span = tracer.startSpan("stop");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],

    Setup: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "Setup") {
              const span = tracer.startSpan("setup");
              span.setAttributes({
                "session.id": input.session_id,
              });
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            }
            return { continue: true };
          },
        ],
      },
    ],
  };

  const cleanup = () => {
    // End orphaned tool spans
    for (const [id, data] of toolSpans) {
      const duration = Date.now() - data.startTime;
      data.span.setAttribute("duration_ms", duration);
      data.span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Orphaned span",
      });
      data.span.end();
      toolSpans.delete(id);
    }
    // End orphaned agent spans
    for (const [id, data] of agentSpans) {
      const duration = Date.now() - data.startTime;
      data.span.setAttribute("duration_ms", duration);
      data.span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Orphaned span",
      });
      data.span.end();
      agentSpans.delete(id);
    }
  };

  return { hooks, cleanup };
}
