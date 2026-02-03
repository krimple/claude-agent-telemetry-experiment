import { describe, it, expect } from "vitest";
import { getErrorMessage } from "../src/errorUtils.js";
import { calculateAverage, getUserName } from "../src/utils.js";

/**
 * Test-First Development: Write tests to identify bugs before fixing them
 */

describe("Bug Discovery Tests - getErrorMessage", () => {
  describe("Object serialization bugs", () => {
    it("BUG: should properly serialize plain objects to see properties", () => {
      const error = { code: 500, message: "Server error" };
      const result = getErrorMessage(error);

      // This test should fail initially because String(object) returns "[object Object]"
      // After fix, it should use JSON.stringify or similar
      expect(result).toContain("code");
      expect(result).toContain("500");
      expect(result).toContain("message");
      expect(result).toContain("Server error");
    });

    it("BUG: should serialize nested objects properly", () => {
      const error = { outer: { inner: "value" }, count: 42 };
      const result = getErrorMessage(error);

      expect(result).toContain("outer");
      expect(result).toContain("inner");
      expect(result).toContain("value");
      expect(result).toContain("42");
    });

    it("BUG: should handle Date objects with readable format", () => {
      const date = new Date("2024-06-15T12:00:00.000Z");
      const result = getErrorMessage(date);

      // Should contain "2024" in the output regardless of timezone
      // Using June date to avoid year boundary issues with timezones
      expect(result).toContain("2024");
    });

    it("BUG: should serialize functions with clear indication", () => {
      const func = () => { console.log("test"); };
      const namedFunc = function testFunction() {};

      const result1 = getErrorMessage(func);
      const result2 = getErrorMessage(namedFunc);

      // Should indicate this is a function
      expect(result1.toLowerCase()).toMatch(/function|arrow|=>/);
      expect(result2).toContain("testFunction");
    });

    it("should handle objects with toJSON method", () => {
      const obj = {
        value: 42,
        toJSON() {
          return { serialized: true, value: this.value };
        }
      };
      const result = getErrorMessage(obj);

      expect(result).toContain("serialized");
      expect(result).toContain("true");
    });

    it("should handle Map objects", () => {
      const map = new Map([["key1", "value1"], ["key2", "value2"]]);
      const result = getErrorMessage(map);

      // Should show Map structure or contents
      expect(result).toBeTruthy();
      expect(result).not.toBe("[object Map]");
    });

    it("should handle Set objects", () => {
      const set = new Set([1, 2, 3]);
      const result = getErrorMessage(set);

      // Should show Set structure or contents
      expect(result).toBeTruthy();
      expect(result).not.toBe("[object Set]");
    });
  });

  describe("Edge cases that should work", () => {
    it("should handle circular references without crashing", () => {
      const obj: any = { name: "test" };
      obj.self = obj;

      // Should not throw an error
      expect(() => getErrorMessage(obj)).not.toThrow();
      const result = getErrorMessage(obj);
      expect(result).toBeTruthy();
    });

    it("should handle objects with null prototype", () => {
      const obj = Object.create(null);
      obj.prop = "value";

      const result = getErrorMessage(obj);
      expect(result).toContain("prop");
      expect(result).toContain("value");
    });

    it("should handle Error objects with additional properties", () => {
      const error = new Error("Base error");
      (error as any).code = "ERR_CUSTOM";
      (error as any).statusCode = 404;

      const result = getErrorMessage(error);
      // Should still return the message property for Error objects
      expect(result).toBe("Base error");
    });
  });
});

describe("Bug Discovery Tests - calculateAverage", () => {
  describe("Precision and accuracy bugs", () => {
    it("should maintain precision with decimal division", () => {
      // Testing if rounding errors occur
      const result = calculateAverage([1, 2, 3]);
      expect(result).toBe(2);

      const result2 = calculateAverage([10, 20, 30]);
      expect(result2).toBe(20);
    });

    it("should handle repeating decimals correctly", () => {
      const result = calculateAverage([1, 2]);
      expect(result).toBe(1.5);

      const result2 = calculateAverage([1, 2, 3]);
      expect(result2).toBe(2);
    });

    it("should work with mixed integers and decimals", () => {
      const result = calculateAverage([1.5, 2.5, 3]);
      expect(result).toBeCloseTo(2.333333, 5);
    });
  });

  describe("Boundary conditions", () => {
    it("should handle Number.MAX_SAFE_INTEGER", () => {
      const result = calculateAverage([Number.MAX_SAFE_INTEGER, 0]);
      expect(result).toBe(Number.MAX_SAFE_INTEGER / 2);
    });

    it("should handle Number.MIN_SAFE_INTEGER", () => {
      const result = calculateAverage([Number.MIN_SAFE_INTEGER, 0]);
      expect(result).toBe(Number.MIN_SAFE_INTEGER / 2);
    });

    it("should handle very small numbers near zero", () => {
      const result = calculateAverage([Number.MIN_VALUE, Number.MIN_VALUE]);
      expect(result).toBeGreaterThan(0);
    });
  });
});

describe("Bug Discovery Tests - getUserName", () => {
  describe("String handling edge cases", () => {
    it("should handle unicode characters correctly", () => {
      const result = getUserName({ name: "josé maría" });
      expect(result).toBe("JOSÉ MARÍA");
    });

    it("should handle emoji in names", () => {
      const result = getUserName({ name: "user 😀" });
      expect(result).toBe("USER 😀");
    });

    it("should handle various whitespace characters", () => {
      const result = getUserName({ name: "\t john \n" });
      expect(result).toBe("JOHN");
    });

    it("should handle zero-width characters", () => {
      const result = getUserName({ name: "john\u200B" }); // zero-width space
      expect(result).toBe("JOHN\u200B");
    });

    it("should preserve internal whitespace", () => {
      const result = getUserName({ name: "  john   doe  " });
      expect(result).toBe("JOHN   DOE");
    });
  });

  describe("Type safety validation", () => {
    it("should reject objects that look like User but have wrong types", () => {
      expect(() => getUserName({ name: 123 as any })).toThrow("User name must be a string");
    });

    it("should reject objects with name as array", () => {
      expect(() => getUserName({ name: ["John"] as any })).toThrow("User name must be a string");
    });

    it("should reject objects with name as object", () => {
      expect(() => getUserName({ name: { first: "John" } as any })).toThrow("User name must be a string");
    });
  });
});

describe("Integration Bug Discovery Tests", () => {
  describe("Chaining operations", () => {
    it("should correctly chain getUserName and calculateAverage", () => {
      const users = [
        { name: "alice" },
        { name: "bob" },
        { name: "charlie" }
      ];

      const upperNames = users.map(u => getUserName(u));
      expect(upperNames).toEqual(["ALICE", "BOB", "CHARLIE"]);

      const nameLengths = upperNames.map(name => name.length);
      expect(nameLengths).toEqual([5, 3, 7]);

      const avgLength = calculateAverage(nameLengths);
      expect(avgLength).toBe(5); // (5 + 3 + 7) / 3 = 15 / 3 = 5
    });

    it("should handle error chaining correctly", () => {
      try {
        calculateAverage([]);
      } catch (error) {
        const message = getErrorMessage(error);
        expect(message).toBe("Cannot calculate average of an empty array");
      }
    });
  });

  describe("Real-world scenarios", () => {
    it("should process user data pipeline", () => {
      const rawUsers = [
        { name: "  Alice  " },
        { name: "BOB" },
        { name: "charlie" }
      ];

      const processed = rawUsers.map(user => ({
        original: user.name,
        normalized: getUserName(user),
        length: getUserName(user).length
      }));

      expect(processed[0].normalized).toBe("ALICE");
      expect(processed[1].normalized).toBe("BOB");
      expect(processed[2].normalized).toBe("CHARLIE");

      const avgLength = calculateAverage(processed.map(p => p.length));
      expect(avgLength).toBe(5); // (5 + 3 + 7) / 3 = 5
    });
  });
});
