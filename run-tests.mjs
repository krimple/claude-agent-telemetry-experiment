#!/usr/bin/env node

/**
 * Test runner script
 * Executes the complete test suite and captures results
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("========================================");
console.log("Running Comprehensive Test Suite");
console.log("========================================");
console.log("");

const testProcess = spawn("npm", ["test"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true,
});

testProcess.on("close", (code) => {
  console.log("");
  console.log("========================================");
  console.log(`Test suite completed with exit code: ${code}`);
  console.log("========================================");
  process.exit(code);
});

testProcess.on("error", (error) => {
  console.error("Failed to run tests:", error);
  process.exit(1);
});
