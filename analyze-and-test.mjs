#!/usr/bin/env node

/**
 * Analyze test files and run test suite
 */

import { execSync } from "child_process";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("\n" + "=".repeat(70));
console.log("  TEST SUITE ANALYSIS AND EXECUTION");
console.log("=".repeat(70) + "\n");

// Find all test files
function findTestFiles(dir, basePath = "") {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = basePath ? join(basePath, item) : item;

    if (statSync(fullPath).isDirectory()) {
      if (item !== "node_modules" && item !== "dist") {
        files.push(...findTestFiles(fullPath, relativePath));
      }
    } else if (item.endsWith(".test.ts")) {
      files.push(relativePath);
    }
  }

  return files;
}

console.log("STEP 1: Discovering Test Files");
console.log("-".repeat(70));

const testFiles = findTestFiles(__dirname);
console.log(`Found ${testFiles.length} test files:\n`);

const srcTests = testFiles.filter((f) => f.startsWith("src/"));
const testDirTests = testFiles.filter((f) => f.startsWith("test/"));

console.log("Tests in src/ directory:");
srcTests.forEach((f) => console.log(`  - ${f}`));

console.log("\nTests in test/ directory:");
testDirTests.forEach((f) => console.log(`  - ${f}`));

console.log("\n");

// Build
console.log("STEP 2: Building TypeScript");
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
  process.exit(1);
}

// Run Tests
console.log("STEP 3: Running All Tests");
console.log("-".repeat(70));

try {
  execSync("npm test", {
    cwd: __dirname,
    encoding: "utf-8",
    stdio: "inherit",
  });

  console.log("\n" + "=".repeat(70));
  console.log("  ✓ ALL TESTS PASSED!");
  console.log("=".repeat(70));
  console.log("\nTest files executed:");
  console.log(`  - ${testFiles.length} total test files`);
  console.log(`  - ${srcTests.length} from src/ directory`);
  console.log(`  - ${testDirTests.length} from test/ directory`);
  console.log("\n");
  process.exit(0);
} catch (error) {
  console.log("\n" + "=".repeat(70));
  console.log("  ✗ SOME TESTS FAILED");
  console.log("=".repeat(70));
  console.log("\nReview the output above to identify failures.");
  console.log("\nReferences:");
  console.log("  - See FIXES-APPLIED.md for already applied fixes");
  console.log("  - See ISSUES-IDENTIFIED.md for known issues");
  console.log("  - See TEST-FILES-SUMMARY.md for test organization");
  console.log("\n");
  process.exit(1);
}
