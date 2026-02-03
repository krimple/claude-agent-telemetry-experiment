#!/bin/bash

# Run complete test suite with detailed output
echo "========================================="
echo "Running Complete Test Suite"
echo "========================================="
echo ""

# Run the integration tests
echo "Running integration tests..."
npm test -- test/complete-integration.test.ts --reporter=verbose

# Run existing test files
echo ""
echo "Running utils tests..."
npm test -- test/utils.test.ts --reporter=verbose

echo ""
echo "Running errorUtils tests..."
npm test -- test/errorUtils.test.ts --reporter=verbose

echo ""
echo "Running telemetry tests..."
npm test -- test/telemetry.test.ts --reporter=verbose

echo ""
echo "========================================="
echo "Test Suite Complete"
echo "========================================="
