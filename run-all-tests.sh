#!/bin/bash

# Script to run all tests and capture output
# This runs the complete test suite and saves results

cd /Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts

echo "========================================="
echo "Running Complete Test Suite"
echo "========================================="
echo ""

# Run tests with verbose output
npm test 2>&1

echo ""
echo "========================================="
echo "Test run completed"
echo "========================================="
