#!/bin/bash
set -e

echo "Building TypeScript files..."
npm run build

echo ""
echo "Running comprehensive test suite..."
npm test -- test/complete-integration.test.ts test/utils.test.ts test/errorUtils.test.ts test/telemetry.test.ts --run
