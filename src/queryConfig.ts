import type { PermissionResult } from "@anthropic-ai/claude-agent-sdk";

export const mainPrompt = `
Use the code-reviewer agent to review code in ./questionable-code, fix bugs, and write the corrected version to ./reviewed-code.
Use the test-runner agent to write tests first, verify problems, then fix them.
Use the documenter agent to document code in in-line documentation. Update the code in ./reviewed-code.
`;

export const canUseTool = async (
  toolName: string,
  input: unknown,
  options: { agentID?: string }
): Promise<PermissionResult> => {
  const { agentID } = options;
  const isSubAgent = agentID !== undefined;

  // this little gem - tell the top agent not to run any
  // tools - that's the job of the sub agents.
  if (!isSubAgent && toolName === "Bash") {
    return {
      behavior: "deny",
      message: "Use sub-agents for Bash operations",
    };
  }
  return { behavior: "allow", updatedInput: input as Record<string, unknown> };
};

export const allowedTools = ["Read", "Glob", "Grep", "Task"] as const;

export const permissionMode = "acceptEdits" as const;

export const agents = {
  "code-reviewer": {
    description:
      "Reviews code for bugs, security issues, and best practices. Does not write tests.",
    prompt: `Review code in ./questionable-code/ directory.
                Identify bugs, security issues, and code quality
                problems. Write the fixed version to
                the ./reviewed-code/ directory.

                Do not write tests.`,
    tools: ["Bash", "Read", "Write", "Grep", "Edit"] as string[],
  },
  documenter: {
    description: "Adds documentation comments to code.",
    prompt: `You an expert in writing
                        useful documentation, including examples.
                        Document the code that has been reviewed
                        in ./reviewed-code/ with useful jsdoc comments.
                        Also add a markdown documentation file describing
                        the goals and alternative options - add README- as
                        a prefix to the file name.
                `,
    tools: ["Bash", "Read", "Grep", "Edit", "Write"] as string[],
  },
  "test-runner": {
    description:
      "Writes and runs tests to verify code behavior. Does not review code.",
    prompt:
      "Write tests for code in ./reviewed-code to verify expected behavior. Run tests to identify problems. Fix issues based on test results. Do not write source code, just tests. Put tests in ./test/",
    tools: ["Bash", "Read", "Grep", "Edit", "Write"] as string[],
  },
};
