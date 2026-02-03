#!/usr/bin/env node

/**
 * Test execution script
 * Runs all test files and reports results
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = [
  'test/complete-integration.test.ts',
  'test/utils.test.ts',
  'test/errorUtils.test.ts',
  'test/telemetry.test.ts',
];

console.log('========================================');
console.log('Running Complete Test Suite');
console.log('========================================\n');

// Build first
console.log('Building TypeScript files...\n');
const build = spawn('npm', ['run', 'build'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error(`Build failed with code ${code}`);
    process.exit(1);
  }

  console.log('\nRunning tests...\n');

  // Run tests
  const test = spawn('npm', ['test', '--', ...testFiles, '--run'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });

  test.on('close', (testCode) => {
    console.log('\n========================================');
    console.log('Test Execution Complete');
    console.log('========================================');
    process.exit(testCode);
  });
});
