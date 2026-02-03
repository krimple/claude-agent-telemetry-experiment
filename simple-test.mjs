#!/usr/bin/env node

/**
 * Simple test executor
 */

import { execSync } from 'child_process';

console.log('========================================');
console.log('Building and Testing');
console.log('========================================\n');

try {
  // Build
  console.log('Step 1: Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\nStep 2: Running complete integration tests...');
  execSync('npm test -- test/complete-integration.test.ts --run', { stdio: 'inherit' });

  console.log('\nStep 3: Running utils tests...');
  execSync('npm test -- test/utils.test.ts --run', { stdio: 'inherit' });

  console.log('\nStep 4: Running errorUtils tests...');
  execSync('npm test -- test/errorUtils.test.ts --run', { stdio: 'inherit' });

  console.log('\nStep 5: Running telemetry tests...');
  execSync('npm test -- test/telemetry.test.ts --run', { stdio: 'inherit' });

  console.log('\n========================================');
  console.log('All Tests Passed!');
  console.log('========================================');
} catch (error) {
  console.error('\n========================================');
  console.error('Tests Failed!');
  console.error('========================================');
  process.exit(1);
}
