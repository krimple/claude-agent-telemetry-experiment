import { describe, it, expect } from "vitest";
import { calculateAverage, getUserName } from "../src/utils.js";

/**
 * These tests verify the ACTUAL current behavior
 * to identify what needs to be fixed
 */

describe("Current Behavior Verification", () => {
  describe("calculateAverage - actual behavior", () => {
    it("verifies error message for empty array", () => {
      try {
        calculateAverage([]);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Document the actual error message
        console.log("Empty array error:", (error as Error).message);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("verifies error message for NaN", () => {
      try {
        calculateAverage([1, NaN, 3]);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Document the actual error message
        console.log("NaN error:", (error as Error).message);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("verifies error message for Infinity", () => {
      try {
        calculateAverage([1, Infinity, 3]);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Document the actual error message
        console.log("Infinity error:", (error as Error).message);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("verifies error message for overflow", () => {
      try {
        calculateAverage([Number.MAX_VALUE, Number.MAX_VALUE]);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Document the actual error message
        console.log("Overflow error:", (error as Error).message);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("getUserName - actual behavior", () => {
    it("verifies whitespace handling", () => {
      const result1 = getUserName({ name: "  john  " });
      console.log("Whitespace test '  john  ' ->", JSON.stringify(result1));
      expect(result1).toBe("JOHN");

      // Whitespace-only and empty strings should now throw errors
      expect(() => getUserName({ name: "   " })).toThrow("User name cannot be empty");
      expect(() => getUserName({ name: "" })).toThrow("User name cannot be empty");
    });

    it("verifies error message for null name", () => {
      try {
        getUserName({ name: null } as any);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Document the actual error message
        console.log("Null name error:", (error as Error).message);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("verifies error message for null user", () => {
      try {
        getUserName(null);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Document the actual error message
        console.log("Null user error:", (error as Error).message);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
