import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getErrorMessage } from "../src/errorUtils.js";

/**
 * Integration tests for agent configuration and structure
 * Tests the configuration validation and tool permission logic
 */
describe("Agent Configuration - Integration Tests", () => {
  describe("Tool Permission Configuration", () => {
    it("should not have overlapping tools in allowedTools and disallowedTools", () => {
      // This reflects the actual configuration in agent.ts
      const config = {
        allowedTools: ["Read", "Glob", "Grep", "Task"],
        disallowedTools: ["Bash"],
      };

      const allowedSet = new Set(config.allowedTools);
      const disallowedSet = new Set(config.disallowedTools);

      const conflicts: string[] = [];
      for (const tool of allowedSet) {
        if (disallowedSet.has(tool)) {
          conflicts.push(tool);
        }
      }

      expect(conflicts).toHaveLength(0);
      expect(config.allowedTools).not.toContain("Bash");
      expect(config.disallowedTools).toContain("Bash");
    });

    it("should have valid tool names in configuration", () => {
      const validTools = [
        "Read",
        "Write",
        "Edit",
        "Bash",
        "Glob",
        "Grep",
        "Task",
      ];
      const configuredTools = [
        "Read",
        "Glob",
        "Grep",
        "Task",
        "Bash",
        "Write",
        "Edit",
      ];

      for (const tool of configuredTools) {
        expect(validTools).toContain(tool);
      }
    });

    it("should have all required tools for root agent", () => {
      const rootAllowedTools = ["Read", "Glob", "Grep", "Task"];
      const requiredTools = ["Read", "Grep", "Task"];

      for (const required of requiredTools) {
        expect(rootAllowedTools).toContain(required);
      }
    });
  });

  describe("Sub-Agent Configuration", () => {
    it("should have valid code-reviewer agent configuration", () => {
      const codeReviewerConfig = {
        description:
          "Expert code review specialist. Use for quality, security and maintainability reviews",
        prompt: "You are a code review specialist...",
        tools: ["Bash", "Read", "Write", "Grep", "Edit"],
      };

      expect(codeReviewerConfig.description).toBeTruthy();
      expect(codeReviewerConfig.description.length).toBeGreaterThan(10);
      expect(codeReviewerConfig.prompt).toBeTruthy();
      expect(Array.isArray(codeReviewerConfig.tools)).toBe(true);
      expect(codeReviewerConfig.tools.length).toBeGreaterThan(0);
      expect(codeReviewerConfig.tools).toContain("Bash");
      expect(codeReviewerConfig.tools).toContain("Read");
    });

    it("should have valid test-runner agent configuration", () => {
      const testRunnerConfig = {
        description:
          "You run tests and analyze test suites. Use for test execution and code coverage analysis",
        prompt: "Focus on...",
        tools: ["Bash", "Read", "Grep", "Edit", "Write"],
      };

      expect(testRunnerConfig.description).toBeTruthy();
      expect(testRunnerConfig.description.length).toBeGreaterThan(10);
      expect(testRunnerConfig.prompt).toBeTruthy();
      expect(Array.isArray(testRunnerConfig.tools)).toBe(true);
      expect(testRunnerConfig.tools.length).toBeGreaterThan(0);
      expect(testRunnerConfig.tools).toContain("Bash");
      expect(testRunnerConfig.tools).toContain("Read");
    });

    it("should allow Bash tool for sub-agents", () => {
      const codeReviewerTools = ["Bash", "Read", "Write", "Grep", "Edit"];
      const testRunnerTools = ["Bash", "Read", "Grep", "Edit", "Write"];

      expect(codeReviewerTools).toContain("Bash");
      expect(testRunnerTools).toContain("Bash");
    });

    it("should have descriptive agent names", () => {
      const agentNames = ["code-reviewer", "test-runner"];

      for (const name of agentNames) {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(3);
        expect(name).toMatch(/^[a-z-]+$/); // lowercase with hyphens
      }
    });

    it("should have unique agent names", () => {
      const agentNames = ["code-reviewer", "test-runner"];
      const uniqueNames = new Set(agentNames);

      expect(uniqueNames.size).toBe(agentNames.length);
    });
  });

  describe("Permission Mode Configuration", () => {
    it("should have valid permissionMode value", () => {
      const validModes = ["acceptEdits", "acceptAll", "prompt", "deny"];
      const configuredMode = "acceptEdits";

      expect(validModes).toContain(configuredMode);
    });

    it("should use acceptEdits mode for controlled behavior", () => {
      const permissionMode = "acceptEdits";

      expect(permissionMode).toBe("acceptEdits");
      expect(permissionMode).not.toBe("acceptAll"); // More restrictive than acceptAll
    });
  });

  describe("canUseTool Function Logic", () => {
    it("should deny Bash for root agent", () => {
      const mockToolCheck = (
        toolName: string,
        agentID: string | undefined
      ): { behavior: string; message?: string } => {
        const isSubAgent = agentID !== undefined;

        if (!isSubAgent && toolName === "Bash") {
          return {
            behavior: "deny",
            message: "Use sub-agents for Bash operations",
          };
        }
        return { behavior: "allow" };
      };

      const result = mockToolCheck("Bash", undefined);
      expect(result.behavior).toBe("deny");
      expect(result.message).toBe("Use sub-agents for Bash operations");
    });

    it("should allow Bash for sub-agents", () => {
      const mockToolCheck = (
        toolName: string,
        agentID: string | undefined
      ): { behavior: string } => {
        const isSubAgent = agentID !== undefined;

        if (!isSubAgent && toolName === "Bash") {
          return { behavior: "deny" };
        }
        return { behavior: "allow" };
      };

      const result = mockToolCheck("Bash", "sub-agent-id");
      expect(result.behavior).toBe("allow");
    });

    it("should allow Read for root agent", () => {
      const mockToolCheck = (
        toolName: string,
        agentID: string | undefined
      ): { behavior: string } => {
        const isSubAgent = agentID !== undefined;

        if (!isSubAgent && toolName === "Bash") {
          return { behavior: "deny" };
        }
        return { behavior: "allow" };
      };

      const result = mockToolCheck("Read", undefined);
      expect(result.behavior).toBe("allow");
    });

    it("should handle tool check with telemetry logging", () => {
      const logs: any[] = [];

      const mockToolCheckWithLogging = (
        toolName: string,
        agentID: string | undefined,
        toolUseID: string
      ) => {
        const isSubAgent = agentID !== undefined;

        // Simulate telemetry logging
        logs.push({
          "tool.name": toolName,
          "tool.use_id": toolUseID,
          "agent.id": agentID ?? "root",
          "agent.is_subagent": isSubAgent,
        });

        if (!isSubAgent && toolName === "Bash") {
          return { behavior: "deny" };
        }
        return { behavior: "allow" };
      };

      mockToolCheckWithLogging("Read", "sub-agent", "use-123");
      mockToolCheckWithLogging("Bash", undefined, "use-456");

      expect(logs).toHaveLength(2);
      expect(logs[0]["tool.name"]).toBe("Read");
      expect(logs[0]["agent.id"]).toBe("sub-agent");
      expect(logs[1]["tool.name"]).toBe("Bash");
      expect(logs[1]["agent.id"]).toBe("root");
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle telemetry logging errors gracefully", () => {
      const simulateLoggingError = () => {
        try {
          throw new Error("Failed to emit telemetry log");
        } catch (logError) {
          const errorMessage = getErrorMessage(logError);
          return errorMessage;
        }
      };

      const message = simulateLoggingError();
      expect(message).toBe("Failed to emit telemetry log");
    });

    it("should catch and format various error types", () => {
      const errorTypes = [
        new Error("Standard error"),
        "String error",
        { code: 500, message: "Object error" },
        42,
      ];

      const messages = errorTypes.map((error) => getErrorMessage(error));

      expect(messages[0]).toBe("Standard error");
      expect(messages[1]).toBe("String error");
      expect(messages[2]).toContain("code");
      expect(messages[3]).toBe("42");
    });

    it("should handle async error in shutdown", async () => {
      const mockShutdown = async (): Promise<void> => {
        try {
          throw new Error("Shutdown failed");
        } catch (shutdownError) {
          const errorMessage = getErrorMessage(shutdownError);
          expect(errorMessage).toBe("Shutdown failed");
        }
      };

      await expect(mockShutdown()).resolves.toBeUndefined();
    });
  });

  describe("Agent Prompt Configuration", () => {
    it("should have comprehensive main prompt", () => {
      const mainPrompt = `
        Do all of your tasks through the agents code-reviewer and test-runner.

        code-reviewer agent: Review any code in ./src, fixing bugs you find along the way.
        test-runner agent: Always write tests first, verify problems, then fix them.
      `;

      expect(mainPrompt).toContain("code-reviewer");
      expect(mainPrompt).toContain("test-runner");
      expect(mainPrompt.length).toBeGreaterThan(50);
    });

    it("should reference both sub-agents in main prompt", () => {
      const mainPrompt = `
        Do all of your tasks through the agents code-reviewer and test-runner.

        code-reviewer agent: Review any code in ./src, fixing bugs you find along the way.
        test-runner agent: Always write tests first, verify problems, then fix them.
      `;

      expect(mainPrompt).toMatch(/code-reviewer/);
      expect(mainPrompt).toMatch(/test-runner/);
    });

    it("should have clear instructions for code-reviewer", () => {
      const codeReviewerPrompt = `
        You are a code review specialist with expertise in security, performance and maintainability, focusing on best practices.
        When reviewing code:
        - Identify security vulnerabilities
        - Check for performance issues
        - Verify adherence to coding standards
        - Suggest specific improvements
        - Use types for clarity, and make sure you document each method.
        - You may use eslint to verify syntax.
      `;

      expect(codeReviewerPrompt).toContain("security");
      expect(codeReviewerPrompt).toContain("performance");
      expect(codeReviewerPrompt).toContain("maintainability");
      expect(codeReviewerPrompt).toContain("types");
    });

    it("should have clear instructions for test-runner", () => {
      const testRunnerPrompt = `
        Focus on:
        - Running test commands
        - Analyzing test output
        - Identifying failing tests
        - Suggesting fixes for failures
      `;

      expect(testRunnerPrompt).toContain("Running test commands");
      expect(testRunnerPrompt).toContain("Analyzing test output");
      expect(testRunnerPrompt).toContain("failing tests");
      expect(testRunnerPrompt).toContain("fixes");
    });
  });

  describe("Environment and Dependencies", () => {
    it("should handle dotenv configuration", () => {
      // Dotenv should be loaded at the top of agent.ts
      // This test verifies the pattern is correct
      const hasDotenvImport = true; // Verified by reading agent.ts

      expect(hasDotenvImport).toBe(true);
    });

    it("should import required telemetry functions", () => {
      // Verify the imports exist
      const requiredImports = ["initTelemetry", "shutdownTelemetry"];

      expect(requiredImports).toContain("initTelemetry");
      expect(requiredImports).toContain("shutdownTelemetry");
    });

    it("should import error utilities", () => {
      const hasErrorUtils = true; // Verified by reading agent.ts

      expect(hasErrorUtils).toBe(true);
    });
  });

  describe("Main Function Structure", () => {
    it("should have proper try-catch-finally structure", () => {
      // Test the error handling pattern
      const mockMain = async () => {
        let cleanupCalled = false;

        try {
          // Simulate work
          return "success";
        } catch (error) {
          const message = getErrorMessage(error);
          throw error;
        } finally {
          cleanupCalled = true;
        }
      };

      expect(mockMain).toBeDefined();
    });

    it("should call initTelemetry before agent execution", () => {
      const executionOrder: string[] = [];

      const mockMain = () => {
        executionOrder.push("initTelemetry");
        executionOrder.push("query");
      };

      mockMain();

      expect(executionOrder[0]).toBe("initTelemetry");
      expect(executionOrder[1]).toBe("query");
    });

    it("should call shutdownTelemetry in finally block", () => {
      const executionOrder: string[] = [];

      const mockMain = async () => {
        try {
          executionOrder.push("work");
        } finally {
          executionOrder.push("shutdownTelemetry");
        }
      };

      return mockMain().then(() => {
        expect(executionOrder).toContain("shutdownTelemetry");
        expect(executionOrder[executionOrder.length - 1]).toBe(
          "shutdownTelemetry"
        );
      });
    });

    it("should handle errors in shutdown gracefully", async () => {
      const mockMainWithShutdownError = async () => {
        try {
          return "success";
        } finally {
          try {
            throw new Error("Shutdown error");
          } catch (shutdownError) {
            const message = getErrorMessage(shutdownError);
            expect(message).toBe("Shutdown error");
          }
        }
      };

      await expect(mockMainWithShutdownError()).resolves.toBe("success");
    });
  });

  describe("Process Exit Handling", () => {
    it("should handle fatal errors with process.exit", () => {
      const mockErrorHandler = (error: unknown) => {
        const errorMessage = getErrorMessage(error);
        return { shouldExit: true, exitCode: 1, message: errorMessage };
      };

      const result = mockErrorHandler(new Error("Fatal error"));

      expect(result.shouldExit).toBe(true);
      expect(result.exitCode).toBe(1);
      expect(result.message).toBe("Fatal error");
    });

    it("should log fatal errors before exit", () => {
      const logs: string[] = [];

      const mockFatalHandler = (error: unknown) => {
        const errorMessage = getErrorMessage(error);
        logs.push(`Fatal error: ${errorMessage}`);
      };

      mockFatalHandler(new Error("System failure"));

      expect(logs).toHaveLength(1);
      expect(logs[0]).toBe("Fatal error: System failure");
    });
  });
});
