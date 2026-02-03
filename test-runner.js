#!/usr/bin/env node

/**
 * Simple test runner script to execute tests and capture results
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("===== Starting Test Execution =====\n");

// First build the project
console.log("Step 1: Building TypeScript...");
const buildProcess = spawn("npm", ["run", "build"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true,
});

buildProcess.on("close", (buildCode) => {
  console.log(`\nBuild process exited with code ${buildCode}\n`);

  if (buildCode !== 0) {
    console.error("Build failed. Skipping tests.");
    process.exit(buildCode);
  }

  // Run tests
  console.log("Step 2: Running tests...");
  const testProcess = spawn("npm", ["test"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  testProcess.on("close", (testCode) => {
    console.log(`\n\n===== Test Execution Complete =====`);
    console.log(`Exit code: ${testCode}`);

    if (testCode !== 0) {
      console.log("\nTests failed. Review the output above for details.");
    } else {
      console.log("\nAll tests passed!");
    }

    process.exit(testCode);
  });
});
