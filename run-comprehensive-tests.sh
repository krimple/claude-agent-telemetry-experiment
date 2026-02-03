#!/bin/bash

# Run comprehensive test suite
echo "==================================="
echo "Running Comprehensive Test Suite"
echo "==================================="
echo ""

# Build the project first
echo "Building project..."
npm run build

# Run all tests
echo ""
echo "Running all tests..."
npm test -- --reporter=verbose

echo ""
echo "==================================="
echo "Test suite completed"
echo "==================================="
