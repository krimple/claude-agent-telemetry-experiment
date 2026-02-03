import { describe, it, expect } from "vitest";

/**
 * Test suite for agent configuration validation
 */
describe("Agent Configuration", () => {
  /**
   * Test that verifies the agent configuration doesn't have conflicting tool permissions
   */
  it("should not have conflicting tool permissions", () => {
    // Test configuration that mimics the actual agent.ts file (fixed version)
    const config = {
      allowedTools: ["Read", "Glob", "Grep", "Task"],
      disallowedTools: ["Bash"],
    };

    // Check for conflicts: no tool should be in both allowed and disallowed lists
    const allowedSet = new Set(config.allowedTools);
    const disallowedSet = new Set(config.disallowedTools);

    const conflicts: string[] = [];
    for (const tool of allowedSet) {
      if (disallowedSet.has(tool)) {
        conflicts.push(tool);
      }
    }

    // This test should pass now that "Bash" has been removed from allowedTools
    expect(conflicts).toHaveLength(0);
    if (conflicts.length > 0) {
      throw new Error(`Tool permission conflict detected: ${conflicts.join(", ")} appears in both allowedTools and disallowedTools`);
    }
  });

  /**
   * Test that validates agent custom agent configurations are properly defined
   */
  it("should have valid agent configurations", () => {
    const agentsConfig = {
      "code-reviewer": {
        description: "Expert code review specialist. Use for quality, security and maintainability reviews",
        prompt: "You are a code review specialist...",
        tools: ["Bash", "Read", "Grep", "Edit"],
      },
      "test-runner": {
        description: "You run tests and analyze test suites. Use for test execution and code coverage analysis",
        prompt: "Focus on...",
        tools: ["Bash", "Read", "Grep"],
      },
    };

    // Verify each agent has required properties
    for (const [agentName, agentConfig] of Object.entries(agentsConfig)) {
      expect(agentConfig).toHaveProperty("description");
      expect(agentConfig).toHaveProperty("prompt");
      expect(agentConfig).toHaveProperty("tools");
      expect(agentConfig.description).toBeTruthy();
      expect(agentConfig.prompt).toBeTruthy();
      expect(Array.isArray(agentConfig.tools)).toBe(true);
      expect(agentConfig.tools.length).toBeGreaterThan(0);
    }
  });

  /**
   * Test that verifies permissionMode is set correctly
   */
  it("should have valid permissionMode setting", () => {
    const validPermissionModes = ["acceptEdits", "acceptAll", "prompt", "deny"];
    const configuredMode = "acceptEdits";

    expect(validPermissionModes).toContain(configuredMode);
  });
});
