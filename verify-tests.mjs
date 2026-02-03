#!/usr/bin/env node

/**
 * Test verification script
 * This script verifies that the test suite can be loaded and lists all test files
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function findTestFiles(dir, files = []) {
  const entries = await readdir(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await findTestFiles(fullPath, files);
    } else if (entry.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Test File Discovery Report');
  console.log('='.repeat(60));
  console.log();

  const srcTestFiles = await findTestFiles(join(__dirname, 'src'));
  const testTestFiles = await findTestFiles(join(__dirname, 'test'));

  console.log('Test files in src/:');
  srcTestFiles.forEach(file => {
    console.log(`  - ${file.replace(__dirname, '.')}`);
  });
  console.log();

  console.log('Test files in test/:');
  testTestFiles.forEach(file => {
    console.log(`  - ${file.replace(__dirname, '.')}`);
  });
  console.log();

  console.log(`Total test files: ${srcTestFiles.length + testTestFiles.length}`);
  console.log();
  console.log('='.repeat(60));
  console.log('To run tests, execute: npm test');
  console.log('='.repeat(60));
}

main().catch(console.error);
