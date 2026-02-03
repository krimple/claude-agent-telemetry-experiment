#!/usr/bin/env node

/**
 * Test suite runner
 * This script builds and runs all tests, capturing detailed output
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("=".repeat(60));
console.log("TEST SUITE EXECUTION");
console.log("=".repeat(60));
console.log("");

try {
  console.log("Phase 1: Building TypeScript");
  console.log("-".repeat(60));

  try {
    const buildOutput = execSync("npm run build", {
      cwd: __dirname,
      encoding: "utf-8",
      stdio: "inherit"
    });
    console.log("✓ Build completed successfully\n");
  } catch (buildError) {
    console.error("✗ Build failed");
    console.error(buildError.message);
    process.exit(1);
  }

  console.log("Phase 2: Running Tests");
  console.log("-".repeat(60));

  try {
    const testOutput = execSync("npm test", {
      cwd: __dirname,
      encoding: "utf-8",
      stdio: "inherit"
    });
    console.log("\n✓ All tests passed!\n");
  } catch (testError) {
    console.error("\n✗ Some tests failed\n");
    console.log("=".repeat(60));
    console.log("TEST FAILURES DETECTED");
    console.log("=".repeat(60));
    process.exit(1);
  }

} catch (error) {
  console.error("\nUnexpected error:", error.message);
  process.exit(1);
}

console.log("=".repeat(60));
console.log("TEST EXECUTION COMPLETE");
console.log("=".repeat(60));
