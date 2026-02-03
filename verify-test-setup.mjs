#!/usr/bin/env node

/**
 * Verification script to check test setup and provide pre-run analysis
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function analyzeTestFiles() {
  console.log("========================================");
  console.log("Test Setup Verification");
  console.log("========================================\n");

  try {
    // Read test directory
    const testDir = join(__dirname, "test");
    const files = await readdir(testDir);
    const testFiles = files.filter((f) => f.endsWith(".test.ts"));

    console.log(`Found ${testFiles.length} test files:\n`);

    let totalTests = 0;
    const testStats = [];

    for (const file of testFiles.sort()) {
      const filePath = join(testDir, file);
      const content = await readFile(filePath, "utf-8");

      // Count test cases (it blocks)
      const itMatches = content.match(/\bit\(/g);
      const testCount = itMatches ? itMatches.length : 0;
      totalTests += testCount;

      // Count describe blocks
      const describeMatches = content.match(/\bdescribe\(/g);
      const describeCount = describeMatches ? describeMatches.length : 0;

      testStats.push({
        file,
        tests: testCount,
        describes: describeCount,
      });

      console.log(
        `  ${file.padEnd(45)} ${testCount.toString().padStart(3)} tests, ${describeCount} describe blocks`
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log(`Total test cases: ${totalTests}`);
    console.log("=".repeat(80));

    // Check for source files
    console.log("\nSource files to test:");
    const srcDir = join(__dirname, "src");
    const srcFiles = await readdir(srcDir);
    const sourceFiles = srcFiles.filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".test.ts")
    );

    for (const file of sourceFiles.sort()) {
      console.log(`  ✓ ${file}`);
    }

    // Check package.json test script
    console.log("\nTest configuration:");
    const packageJson = JSON.parse(
      await readFile(join(__dirname, "package.json"), "utf-8")
    );
    console.log(`  Test command: ${packageJson.scripts.test}`);
    console.log(`  Test framework: vitest`);

    console.log("\n" + "=".repeat(80));
    console.log("Test setup verified successfully!");
    console.log("=".repeat(80));
    console.log("\nReady to run tests with: npm test");
    console.log("");
  } catch (error) {
    console.error("Error during verification:", error.message);
    process.exit(1);
  }
}

analyzeTestFiles();
