#!/bin/bash

# Run tests and capture output
echo "===== Running Test Suite ====="
echo ""

# Build TypeScript first
echo "Building TypeScript..."
npm run build

# Run tests
echo ""
echo "Running tests..."
npm test

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "===== Test Run Complete ====="
echo "Exit code: $TEST_EXIT_CODE"

exit $TEST_EXIT_CODE
