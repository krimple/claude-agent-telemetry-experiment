import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import type { Tracer, Span, Context } from "@opentelemetry/api";

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
  rootSpan: Span;
  rootSpanContext: Context;
  sessionSpan: Span;
  sessionSpanContext: Context;
  hooks: Record<string, unknown>;
  cleanup: () => void;
}

export function withAgentTelemetry(tracer: Tracer): TelemetryContext {
  const agentSpans = new Map<string, { span: Span; context: Context }>();
  const toolSpans = new Map<string, { span: Span; context: Context }>();

  // Create root span and end it immediately
  const rootSpan = tracer.startSpan("agent.root");
  const rootSpanContext = trace.setSpan(context.active(), rootSpan);
  rootSpan.end();

  // Create session span as child of root - this stays open until cleanup
  const sessionSpan = tracer.startSpan("agent.session", undefined, rootSpanContext);
  const sessionSpanContext = trace.setSpan(context.active(), sessionSpan);

  const hooks = {
    UserPromptSubmit: [
      {
        hooks: [
          async (input: any) => {
            if (input.hook_event_name === "UserPromptSubmit") {
              sessionSpan.setAttribute("session.id", input.session_id);
              sessionSpan.setAttribute("prompt", truncateAttribute(input.prompt));
              sessionSpan.setAttribute("cwd", input.cwd);
              sessionSpan.setAttribute(
                "permission_mode",
                input.permission_mode || "",
              );

              const span = tracer.startSpan(
                "hook.user_prompt_submit",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "UserPromptSubmit",
                "session.id": input.session_id,
                "prompt.length": input.prompt.length,
              });
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
              const span = tracer.startSpan(
                `agent.${input.agent_type}`,
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "agent.id": input.agent_id,
                "agent.type": input.agent_type,
                "session.id": input.session_id,
              });

              const spanContext = trace.setSpan(context.active(), span);
              agentSpans.set(input.agent_id, { span, context: spanContext });
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
                agentData.span.setAttribute(
                  "agent.transcript_path",
                  input.agent_transcript_path,
                );
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
              let parentContext = sessionSpanContext;
              const agentEntries = Array.from(agentSpans.values());
              if (agentEntries.length > 0) {
                const lastEntry = agentEntries[agentEntries.length - 1];
                if (lastEntry) {
                  parentContext = lastEntry.context;
                }
              }

              const span = tracer.startSpan(
                `tool.${input.tool_name}`,
                undefined,
                parentContext,
              );
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

              const spanContext = trace.setSpan(context.active(), span);
              toolSpans.set(input.tool_use_id, { span, context: spanContext });
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
                let responseSize = 0;
                try {
                  responseSize = JSON.stringify(input.tool_response).length;
                } catch {
                  responseSize = String(input.tool_response).length;
                }

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
                const errorMessage = input.error || "Unknown error";
                toolData.span.setAttribute("tool.success", false);
                toolData.span.setAttribute(
                  "tool.error",
                  truncateAttribute(errorMessage),
                );
                toolData.span.recordException(new Error(errorMessage));
                toolData.span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: truncateAttribute(errorMessage, 256),
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
              const span = tracer.startSpan(
                "hook.session_start",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "SessionStart",
                "session.id": input.session_id,
              });
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
              const span = tracer.startSpan(
                "hook.session_end",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "SessionEnd",
                "session.id": input.session_id,
              });
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
              const span = tracer.startSpan(
                "hook.notification",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "Notification",
                "session.id": input.session_id,
              });
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
              const span = tracer.startSpan(
                "hook.permission_request",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "PermissionRequest",
                "session.id": input.session_id,
              });
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
              const span = tracer.startSpan(
                "hook.pre_compact",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "PreCompact",
                "session.id": input.session_id,
              });
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
              const span = tracer.startSpan(
                "hook.stop",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "Stop",
                "session.id": input.session_id,
              });
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
              const span = tracer.startSpan(
                "hook.setup",
                undefined,
                sessionSpanContext,
              );
              span.setAttributes({
                "hook.event_name": "Setup",
                "session.id": input.session_id,
              });
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
      data.span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Orphaned span",
      });
      data.span.end();
      toolSpans.delete(id);
    }
    // End orphaned agent spans
    for (const [id, data] of agentSpans) {
      data.span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Orphaned span",
      });
      data.span.end();
      agentSpans.delete(id);
    }
    // End the session span
    sessionSpan.setStatus({ code: SpanStatusCode.OK });
    sessionSpan.end();
  };

  return { rootSpan, rootSpanContext, sessionSpan, sessionSpanContext, hooks, cleanup };
}
