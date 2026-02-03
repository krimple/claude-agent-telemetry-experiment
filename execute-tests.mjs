#!/usr/bin/env node

/**
 * Test execution script
 * Builds the project and runs all tests
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("\n" + "=".repeat(70));
console.log("  TEST EXECUTION - Build and Test All Modules");
console.log("=".repeat(70) + "\n");

// Step 1: Build
console.log("STEP 1: Building TypeScript");
console.log("-".repeat(70));

try {
  execSync("npm run build", {
    cwd: __dirname,
    encoding: "utf-8",
    stdio: "inherit",
  });
  console.log("\n✓ Build successful\n");
} catch (error) {
  console.error("\n✗ Build failed!");
  console.error("Error:", error.message);
  process.exit(1);
}

// Step 2: Run Tests
console.log("STEP 2: Running Test Suite");
console.log("-".repeat(70));

try {
  execSync("npm test -- --reporter=verbose", {
    cwd: __dirname,
    encoding: "utf-8",
    stdio: "inherit",
  });
  console.log("\n" + "=".repeat(70));
  console.log("  ✓ ALL TESTS PASSED!");
  console.log("=".repeat(70) + "\n");
  process.exit(0);
} catch (error) {
  console.log("\n" + "=".repeat(70));
  console.log("  ✗ SOME TESTS FAILED");
  console.log("=".repeat(70));
  console.log("\nReview the test output above to see which tests failed.");
  console.log("Check FIXES-APPLIED.md for information about fixes already applied.\n");
  process.exit(1);
}
