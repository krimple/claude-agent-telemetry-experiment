# Quick Start Guide: Testing Questionable Code

## TL;DR

```bash
# Run all tests
npm test -- test/bad-utils.test.ts test/reviewed-utils.test.ts

# Result: 89 tests pass
```

## What Was Done

1. **Found** questionable code in `./questionable-code/bad-utils.ts`
2. **Wrote tests** to identify all problems (39 tests)
3. **Fixed** the code in `./reviewed-code/bad-utils.ts`
4. **Wrote tests** to verify fixes (50 tests)
5. **All 89 tests pass**

## File Locations

### Source Code
- **Buggy code:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/questionable-code/bad-utils.ts`
- **Fixed code:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/reviewed-code/bad-utils.ts`

### Test Files
- **Problem tests:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/test/bad-utils.test.ts`
- **Fix tests:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/test/reviewed-utils.test.ts`

### Documentation
- **Final Report:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/FINAL-TEST-REPORT.md`
- **Problems vs Fixes:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/test/PROBLEMS-VS-FIXES.md`
- **Test Summary:** `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/test/TEST-SUMMARY.md`

## Problems Found

### `calculateAverage()` - 4 Problems
1. Missing type annotations (implicit 'any')
2. Returns NaN for empty arrays instead of throwing error
3. No input validation (accepts strings, NaN, null, etc.)
4. Uses outdated 'var' instead of 'let'

### `getUserName()` - 4 Problems
5. Missing type annotations and interface
6. No null/undefined checks (crashes)
7. No property validation (crashes)
8. No interface definition

## Test Commands

### View Problems in Action
```bash
npm test -- test/bad-utils.test.ts
```
Shows 39 tests documenting all the bugs

### Verify Fixes Work
```bash
npm test -- test/reviewed-utils.test.ts
```
Shows 50 tests confirming fixes

### Run Everything
```bash
npm test -- test/bad-utils.test.ts test/reviewed-utils.test.ts
```
Shows all 89 tests passing

### Build Project
```bash
npm run build
```
Compiles TypeScript with no errors

## Code Comparison

### Before (Buggy)
```typescript
// questionable-code/bad-utils.ts

export function calculateAverage(numbers): number {
  var total = 0;
  for (const num of numbers) {
    total += num;
  }
  return total / numbers.length;  // Returns NaN for empty array
}

export function getUserName(user) {
  return user.name.toUpperCase();  // Crashes if user or name is null
}
```

### After (Fixed)
```typescript
// reviewed-code/bad-utils.ts

export function calculateAverage(numbers: number[]): number {
  if (!Array.isArray(numbers)) {
    throw new TypeError('Input must be an array');
  }

  if (numbers.length === 0) {
    throw new Error('Cannot calculate average of an empty array');
  }

  let total = 0;

  for (const num of numbers) {
    if (typeof num !== 'number' || !isFinite(num)) {
      throw new TypeError(`Invalid number in array: ${num}`);
    }
    total += num;
  }

  return total / numbers.length;
}

interface User {
  name?: string;
}

export function getUserName(user: User | null | undefined): string {
  if (!user) {
    throw new Error('User object is required');
  }

  if (typeof user.name !== 'string' || !user.name) {
    throw new Error('User must have a valid name property');
  }

  return user.name.toUpperCase();
}
```

## Test Statistics

- **Total Tests:** 89
- **Passing:** 89 (100%)
- **Test Files:** 2
- **Happy Path Tests:** 19
- **Edge Case Tests:** 21
- **Error Handling Tests:** 20
- **Code Quality Tests:** 15
- **Type Safety Tests:** 14

## Key Improvements

1. **Type Safety:** All parameters now have explicit types
2. **Input Validation:** Comprehensive checks for invalid inputs
3. **Error Messages:** Clear, descriptive error messages
4. **Defensive Programming:** Guards against all edge cases
5. **Modern JavaScript:** Uses 'let', 'const', proper type checking
6. **Documentation:** Interface definitions clarify API contracts

## Next Steps

1. Review the FINAL-TEST-REPORT.md for detailed analysis
2. Run the tests to see results firsthand
3. Compare the questionable and reviewed code side by side
4. Study the test files to understand the problems and fixes

## Success Criteria

- All 89 tests pass
- TypeScript compiles without errors
- Code follows modern best practices
- Comprehensive error handling
- Clear documentation

**Status: All criteria met!**
