import { describe, it, expect } from "vitest";
import { calculateAverage, getUserName } from "../questionable-code/bad-utils.js";

describe("bad-utils.ts - calculateAverage", () => {
  describe("Happy path scenarios", () => {
    it("should calculate average of positive numbers", () => {
      const result = calculateAverage([1, 2, 3, 4, 5]);
      expect(result).toBe(3);
    });

    it("should calculate average of negative numbers", () => {
      const result = calculateAverage([-1, -2, -3, -4, -5]);
      expect(result).toBe(-3);
    });

    it("should calculate average of mixed positive and negative numbers", () => {
      const result = calculateAverage([-10, 10, -5, 5]);
      expect(result).toBe(0);
    });

    it("should handle single number array", () => {
      const result = calculateAverage([42]);
      expect(result).toBe(42);
    });

    it("should handle decimal numbers", () => {
      const result = calculateAverage([1.5, 2.5, 3.5]);
      expect(result).toBe(2.5);
    });
  });

  describe("Edge cases and error scenarios", () => {
    it("should handle empty array without crashing (PROBLEM: returns NaN)", () => {
      // BUG: Division by zero (0/0) returns NaN instead of throwing error or handling gracefully
      const result = calculateAverage([]);
      expect(result).toBe(NaN); // Documents the current buggy behavior
    });

    it("should handle array with zero", () => {
      const result = calculateAverage([0, 0, 0]);
      expect(result).toBe(0);
    });

    it("should handle very large numbers", () => {
      const result = calculateAverage([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]);
      expect(result).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should handle very small numbers", () => {
      const result = calculateAverage([0.0000001, 0.0000002, 0.0000003]);
      expect(result).toBeCloseTo(0.0000002, 7);
    });

    // Type safety issue tests - these document TypeScript problems
    it("PROBLEM: accepts non-array input without type error at runtime", () => {
      // BUG: Missing type annotation allows any type
      // This would cause runtime error when trying to iterate
      expect(() => {
        calculateAverage(null as any);
      }).toThrow();
    });

    it("PROBLEM: accepts array with non-numeric values", () => {
      // BUG: Missing type annotation allows array of any type
      // String numbers get converted to numbers in the += operation ("1" + "2" + "3" = "123", then "0123" / 3 ≈ 41)
      const result = calculateAverage(["1", "2", "3"] as any);
      expect(result).toBe(41); // 0 + "1" = "01", "01" + "2" = "012", "012" + "3" = "0123", then "0123" / 3 ≈ 41
    });

    it("PROBLEM: accepts array with NaN values", () => {
      const result = calculateAverage([1, NaN, 3]);
      expect(result).toBe(NaN); // NaN propagates through calculation
    });

    it("PROBLEM: accepts array with undefined values", () => {
      const result = calculateAverage([1, undefined, 3] as any);
      expect(result).toBe(NaN); // undefined causes NaN
    });

    it("PROBLEM: accepts array with null values", () => {
      const result = calculateAverage([1, null, 3] as any);
      expect(result).toBe(4 / 3); // null is treated as 0
    });
  });

  describe("Code quality issues", () => {
    it("documents use of 'var' instead of 'const' or 'let'", () => {
      // PROBLEM: The code uses 'var' which has function scope instead of block scope
      // This is an outdated practice and can lead to scoping bugs
      // Expected: Should use 'let' for mutable variables or 'const' where possible
    });

    it("documents missing type annotations", () => {
      // PROBLEM: Parameter 'numbers' has no type annotation (implicit 'any')
      // PROBLEM: Return type is specified but parameter is not
      // Expected: Should have type annotation like 'numbers: number[]'
    });
  });
});

describe("bad-utils.ts - getUserName", () => {
  describe("Happy path scenarios", () => {
    it("should return uppercase user name", () => {
      const user = { name: "john doe" };
      const result = getUserName(user);
      expect(result).toBe("JOHN DOE");
    });

    it("should handle already uppercase names", () => {
      const user = { name: "JANE SMITH" };
      const result = getUserName(user);
      expect(result).toBe("JANE SMITH");
    });

    it("should handle mixed case names", () => {
      const user = { name: "MiXeD CaSe" };
      const result = getUserName(user);
      expect(result).toBe("MIXED CASE");
    });

    it("should handle single character names", () => {
      const user = { name: "a" };
      const result = getUserName(user);
      expect(result).toBe("A");
    });

    it("should handle names with special characters", () => {
      const user = { name: "jean-pierre o'malley" };
      const result = getUserName(user);
      expect(result).toBe("JEAN-PIERRE O'MALLEY");
    });

    it("should handle names with numbers", () => {
      const user = { name: "user123" };
      const result = getUserName(user);
      expect(result).toBe("USER123");
    });
  });

  describe("Edge cases and error scenarios", () => {
    it("PROBLEM: should crash when user is null", () => {
      // BUG: No null check, will throw TypeError
      expect(() => {
        getUserName(null);
      }).toThrow(TypeError);
    });

    it("PROBLEM: should crash when user is undefined", () => {
      // BUG: No undefined check, will throw TypeError
      expect(() => {
        getUserName(undefined);
      }).toThrow(TypeError);
    });

    it("PROBLEM: should crash when user.name is null", () => {
      // BUG: No null check on user.name
      const user = { name: null };
      expect(() => {
        getUserName(user);
      }).toThrow(TypeError);
    });

    it("PROBLEM: should crash when user.name is undefined", () => {
      // BUG: No check for undefined name property
      const user = { name: undefined };
      expect(() => {
        getUserName(user);
      }).toThrow(TypeError);
    });

    it("PROBLEM: should crash when user object has no name property", () => {
      // BUG: No check for missing name property
      const user = {} as any;
      expect(() => {
        getUserName(user);
      }).toThrow(TypeError);
    });

    it("should handle empty string name", () => {
      const user = { name: "" };
      const result = getUserName(user);
      expect(result).toBe("");
    });

    it("PROBLEM: accepts non-string name values", () => {
      // BUG: Missing type annotation allows any type for name
      const user = { name: 123 as any };
      expect(() => {
        getUserName(user);
      }).toThrow(TypeError); // toUpperCase is not a function on number
    });

    it("PROBLEM: accepts non-object user parameter", () => {
      // BUG: Missing type annotation allows any type
      expect(() => {
        getUserName("not an object" as any);
      }).toThrow(TypeError);
    });

    it("should handle names with only whitespace", () => {
      const user = { name: "   " };
      const result = getUserName(user);
      expect(result).toBe("   ");
    });

    it("should handle unicode characters", () => {
      const user = { name: "café" };
      const result = getUserName(user);
      expect(result).toBe("CAFÉ");
    });

    it("should handle emoji in names", () => {
      const user = { name: "user😀" };
      const result = getUserName(user);
      expect(result).toBe("USER😀");
    });
  });

  describe("Code quality issues", () => {
    it("documents missing type annotations", () => {
      // PROBLEM: Parameter 'user' has no type annotation (implicit 'any')
      // PROBLEM: No return type annotation
      // Expected: Should have type like 'user: { name: string }' or an interface
    });

    it("documents lack of null/undefined checks", () => {
      // PROBLEM: Function assumes user and user.name always exist
      // PROBLEM: No defensive programming or error handling
      // Expected: Should validate input before accessing properties
    });

    it("documents assumption about user object shape", () => {
      // PROBLEM: No interface or type definition for user object
      // PROBLEM: Function assumes 'name' property exists and is a string
      // Expected: Should define User interface/type
    });
  });
});

describe("bad-utils.ts - Overall code quality issues", () => {
  it("documents TypeScript strict mode violations", () => {
    // PROBLEM: With strict TypeScript enabled, these functions should fail compilation
    // - Missing parameter type annotations (implicit 'any')
    // - This violates the 'noImplicitAny' rule in strict mode
    // Expected: All parameters should have explicit type annotations
  });

  it("documents lack of input validation", () => {
    // PROBLEM: Neither function validates its inputs
    // PROBLEM: No error handling or graceful degradation
    // Expected: Functions should validate inputs and handle edge cases
  });

  it("documents lack of defensive programming", () => {
    // PROBLEM: Functions assume inputs are always valid
    // PROBLEM: No guards against null, undefined, or invalid types
    // Expected: Should implement defensive checks
  });
});
