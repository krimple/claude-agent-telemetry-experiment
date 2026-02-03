# Sub-Agent Bug Fixer Design

A Claude Agent SDK experiment demonstrating sub-agent orchestration with OpenTelemetry observability.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Main Agent                          │
│  - Delegates all work to sub-agents                     │
│  - Cannot use Bash directly (enforced by canUseTool)    │
│  - Allowed tools: Read, Glob, Grep, Task                │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────────┐ ┌─────────────────────┐
│   code-reviewer     │ │    test-runner      │
│                     │ │                     │
│ Reviews ./src for:  │ │ TDD approach:       │
│ - Bugs              │ │ - Write tests first │
│ - Security issues   │ │ - Verify problems   │
│ - Code quality      │ │ - Fix based on      │
│                     │ │   test results      │
│ Tools: Bash, Read,  │ │                     │
│ Write, Grep, Edit   │ │ Tools: Bash, Read,  │
└─────────────────────┘ │ Grep, Edit, Write   │
                        └─────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/agent.ts` | Main orchestrator with hooks and sub-agent config |
| `src/constants.ts` | Agent prompts and tool configurations |
| `src/telemetry.ts` | OpenTelemetry setup (traces, metrics, logs) |
| `src/errorUtils.ts` | Error handling utilities |
| `src/utils.ts` | General utilities |

## Telemetry

OpenTelemetry instrumentation tracks the full agent lifecycle via hooks:

- **Session**: `agent.session` root span wraps entire execution
- **Sub-agents**: `agent.{type}` spans track code-reviewer and test-runner
- **Tools**: `tool.{name}` spans nest under their parent agent
- **Hooks**: Individual spans for SessionStart, SessionEnd, Notifications, etc.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_CODE_ENABLE_TELEMETRY` | - | Set to `1` to enable |
| `OTEL_TRACE_EXPORT_INTERVAL` | 5000ms | Trace flush interval |
| `OTEL_METRIC_EXPORT_INTERVAL` | 10000ms | Metric export interval |
| `OTEL_SERVICE_NAME` | `claude-sub-agent` | Service name in traces |

## How It Works

1. `initTelemetry()` sets up OTLP exporters for traces/metrics/logs
2. Main agent starts with a root span
3. Hooks intercept lifecycle events and create child spans:
   - `SubagentStart` / `SubagentStop` - track sub-agent execution
   - `PreToolUse` / `PostToolUse` - track tool calls with input/output
   - `PostToolUseFailure` - marks failed tool calls
4. Tool calls nest under their parent agent's span
5. Orphaned spans are cleaned up in `finally` block
6. `shutdownTelemetry()` flushes all pending data

## Permission Model

The main agent is restricted from using Bash directly via `canUseTool`:

```typescript
if (!isSubAgent && toolName === "Bash") {
  return { behavior: "deny", message: "Use sub-agents for Bash operations" };
}
```

This forces all shell operations through the specialized sub-agents.
