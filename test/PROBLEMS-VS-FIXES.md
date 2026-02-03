# Problems vs Fixes: Quick Reference

## Summary
- **Questionable Code**: `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/questionable-code/bad-utils.ts`
- **Fixed Code**: `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/reviewed-code/bad-utils.ts`
- **Tests for Problems**: `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/test/bad-utils.test.ts` (39 tests)
- **Tests for Fixes**: `/Users/kenrimple/code/krimple/experiments/agent-sdk-experiments/sub-agent-bug-fixer-ts/test/reviewed-utils.test.ts` (50 tests)
- **Total Tests**: 89 tests, all passing

## calculateAverage() Function

### PROBLEM 1: Missing Type Annotations
```typescript
// BAD - questionable-code/bad-utils.ts
export function calculateAverage(numbers): number {
  // Parameter 'numbers' implicitly has an 'any' type
```

```typescript
// FIXED - reviewed-code/bad-utils.ts
export function calculateAverage(numbers: number[]): number {
  // Proper type annotation ensures type safety
```

**Test Coverage**: 4 tests verify type safety

---

### PROBLEM 2: No Empty Array Handling
```typescript
// BAD
export function calculateAverage(numbers): number {
  var total = 0;
  for (const num of numbers) {
    total += num;
  }
  return total / numbers.length; // Returns NaN for empty array (0/0)
}

// Input: []
// Output: NaN
```

```typescript
// FIXED
export function calculateAverage(numbers: number[]): number {
  if (!numbers || numbers.length === 0) {
    throw new Error('Cannot calculate average of empty array');
  }
  // ... rest of function
}

// Input: []
// Output: Error with clear message
```

**Test Coverage**: 3 tests verify empty array handling

---

### PROBLEM 3: No Input Validation
```typescript
// BAD - Accepts invalid values
calculateAverage([1, NaN, 3]);        // Returns NaN
calculateAverage([1, null, 3]);       // Returns 1.333... (null treated as 0)
calculateAverage([1, undefined, 3]);  // Returns NaN
calculateAverage(["1", "2", "3"]);    // Returns 41 (string concatenation bug)
```

```typescript
// FIXED - Validates each element
export function calculateAverage(numbers: number[]): number {
  // ... validation checks ...
  for (const num of numbers) {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new Error('Array must contain only valid numbers');
    }
    total += num;
  }
  // ...
}

// All invalid inputs now throw descriptive errors
```

**Test Coverage**: 10 tests verify input validation

---

### PROBLEM 4: Uses 'var' Instead of 'let'
```typescript
// BAD - Function scope
var total = 0;
```

```typescript
// FIXED - Block scope
let total = 0;
```

**Test Coverage**: 1 test verifies modern JavaScript practices

---

## getUserName() Function

### PROBLEM 1: Missing Type Annotations
```typescript
// BAD - questionable-code/bad-utils.ts
export function getUserName(user) {
  return user.name.toUpperCase();
  // Parameter 'user' implicitly has an 'any' type
}
```

```typescript
// FIXED - reviewed-code/bad-utils.ts
interface User {
  name?: string;
}

export function getUserName(user: User): string {
  // Proper type annotation with interface
  // ...
}
```

**Test Coverage**: 5 tests verify type safety and interface definition

---

### PROBLEM 2: No Null/Undefined Checks
```typescript
// BAD - Crashes on null/undefined
getUserName(null);      // TypeError: Cannot read property 'name' of null
getUserName(undefined); // TypeError: Cannot read property 'name' of undefined
```

```typescript
// FIXED - Validates user object
export function getUserName(user: User): string {
  if (!user) {
    throw new Error('User object is required');
  }
  // ... rest of validation
}

// Input: null
// Output: Error with clear message
```

**Test Coverage**: 6 tests verify null/undefined handling

---

### PROBLEM 3: No Property Validation
```typescript
// BAD - Crashes when name is missing or invalid
getUserName({ name: null });      // TypeError
getUserName({ name: undefined }); // TypeError
getUserName({});                  // TypeError
getUserName({ name: "" });        // Returns "" (may not be desired)
```

```typescript
// FIXED - Validates name property
export function getUserName(user: User): string {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!user.name) {
    throw new Error('User name is required');
  }
  return user.name.toUpperCase();
}

// All invalid name values now throw descriptive errors
```

**Test Coverage**: 9 tests verify property validation

---

### PROBLEM 4: No Interface Definition
```typescript
// BAD - No formal definition of User
export function getUserName(user) {
  // What should 'user' contain? Unknown!
}
```

```typescript
// FIXED - Clear interface definition
interface User {
  name?: string;
}

export function getUserName(user: User): string {
  // Now everyone knows what a User should look like
}
```

**Test Coverage**: 2 tests verify interface usage

---

## Overall Code Quality

### Before (Questionable Code)
- No type safety (implicit 'any' types)
- No input validation
- No error handling
- Crashes with cryptic errors
- Returns invalid results (NaN, wrong calculations)
- Uses outdated JavaScript practices ('var')
- No defensive programming

### After (Reviewed Code)
- Full type safety with TypeScript
- Comprehensive input validation
- Proper error handling with clear messages
- Gracefully handles all edge cases
- Modern JavaScript practices ('let', 'const')
- Defensive programming throughout
- Clear interfaces/types for documentation

### Test Coverage Summary
- **Happy path tests**: 19 tests
- **Edge case tests**: 21 tests
- **Error handling tests**: 20 tests
- **Code quality tests**: 15 tests
- **Type safety tests**: 14 tests

**TOTAL: 89 comprehensive tests, all passing**

---

## How to Verify

### 1. Run tests for questionable code (documents problems)
```bash
npm run test -- test/bad-utils.test.ts
```
Expected: 39 tests pass (documenting all the bugs)

### 2. Run tests for reviewed code (verifies fixes)
```bash
npm run test -- test/reviewed-utils.test.ts
```
Expected: 50 tests pass (verifying all fixes work)

### 3. Run all tests together
```bash
npm run test -- test/bad-utils.test.ts test/reviewed-utils.test.ts
```
Expected: 89 tests pass (complete verification)

---

## Key Takeaways

1. **Type Safety Matters**: TypeScript's type system caught all the implicit 'any' issues
2. **Validate Inputs**: Never trust that inputs are valid - always check
3. **Defensive Programming**: Check for null, undefined, and edge cases
4. **Clear Error Messages**: Help users understand what went wrong
5. **Modern Practices**: Use 'let'/'const', proper types, and interfaces
6. **Test Everything**: Comprehensive tests catch problems before production

The test-first approach successfully documented all problems and verified all fixes!
