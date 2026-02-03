# Sub-Agent Bug Fixer (TypeScript)

A TypeScript demonstration of Claude sub-agent orchestration with OpenTelemetry instrumentation.

## Overview

This project is based on the Claude Agent SDK samples, using a bug-fixing workflow where a parent agent directs work to specialized sub-agents:

- **code-reviewer** - Identifies bugs and security issues, writes fixes to a separate directory
- **test-runner** - Writes tests, verifies problems, and fixes issues based on test results

The system integrates OpenTelemetry for tracing, metrics, and logging.

## Installation

```bash
npm install
```

## Usage

Put awful code in src/questionable-code/
Run the agent, view the improved code in src/reviewed-code/

### Build

```bash
npm run build
```

### Run

Three variants with different telemetry strategies:

```bash
npm run agent                      # Single-trace telemetry across all agent/sub-agent
npm run agent-individual-traces    # Individual traces per agent
npm run agent-traces-by-agent      # Hierarchical traces organized by agent
```

### Test

```bash
npm run test         # Run tests once
npm run test:watch   # Watch mode
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_CODE_ENABLE_TELEMETRY` | Enable telemetry (set to `1`) | disabled |
| `OTEL_METRIC_EXPORT_INTERVAL` | Metric export interval (ms) | 10000 |
| `OTEL_TRACE_EXPORT_INTERVAL` | Trace export interval (ms) | 5000 |
| `OTEL_SERVICE_NAME` | Service name for telemetry | claude-sub-agent |

## Project Structure

```
src/
├── agent.ts                        # Main entry point (standard telemetry)
├── agentIndividualTraces.ts        # Entry point (individual trace spans)
├── agentWithTracesByAgent.ts       # Entry point (hierarchical by agent)
├── telemetry.ts                    # OpenTelemetry SDK initialization
├── telemetryHooks.ts               # Core telemetry hooks
├── telemetryHooksIndividualTraces.ts
├── telemetryHooksByAgent.ts
├── constants.ts                    # Telemetry config constants
├── errorUtils.ts                   # Error message extraction utilities
└── utils.ts                        # Helper functions
```

## Dependencies

- `@anthropic-ai/claude-agent-sdk` - Claude agent orchestration
- `@opentelemetry/*` - Observability stack (traces, metrics, logs)
- `dotenv` - Environment configuration
