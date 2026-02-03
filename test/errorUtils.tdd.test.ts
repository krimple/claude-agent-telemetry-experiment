import { describe, it, expect } from "vitest";
import { getErrorMessage } from "../src/errorUtils.js";

describe("getErrorMessage - TDD Tests", () => {
  describe("Error instances", () => {
    it("should extract message from standard Error", () => {
      const error = new Error("Something went wrong");
      expect(getErrorMessage(error)).toBe("Something went wrong");
    });

    it("should extract message from TypeError", () => {
      const error = new TypeError("Invalid type");
      expect(getErrorMessage(error)).toBe("Invalid type");
    });

    it("should extract message from RangeError", () => {
      const error = new RangeError("Out of range");
      expect(getErrorMessage(error)).toBe("Out of range");
    });

    it("should handle Error with empty message", () => {
      const error = new Error("");
      expect(getErrorMessage(error)).toBe("");
    });
  });

  describe("String errors", () => {
    it("should return string error as-is", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("should handle empty string", () => {
      expect(getErrorMessage("")).toBe("");
    });

    it("should handle multi-line string", () => {
      const multiLine = "Line 1\nLine 2\nLine 3";
      expect(getErrorMessage(multiLine)).toBe(multiLine);
    });
  });

  describe("Primitive types", () => {
    it("should convert number to string", () => {
      expect(getErrorMessage(42)).toBe("42");
    });

    it("should convert boolean to string", () => {
      expect(getErrorMessage(true)).toBe("true");
      expect(getErrorMessage(false)).toBe("false");
    });

    it("should handle null", () => {
      expect(getErrorMessage(null)).toBe("null");
    });

    it("should handle undefined", () => {
      expect(getErrorMessage(undefined)).toBe("undefined");
    });

    it("should handle NaN", () => {
      expect(getErrorMessage(NaN)).toBe("NaN");
    });

    it("should handle Infinity", () => {
      expect(getErrorMessage(Infinity)).toBe("Infinity");
    });
  });

  describe("Arrays", () => {
    it("should convert array to comma-separated string", () => {
      expect(getErrorMessage([1, 2, 3])).toBe("1,2,3");
    });

    it("should handle empty array", () => {
      expect(getErrorMessage([])).toBe("");
    });

    it("should handle array with mixed types", () => {
      expect(getErrorMessage([1, "two", true])).toBe("1,two,true");
    });

    it("should handle nested arrays", () => {
      expect(getErrorMessage([[1, 2], [3, 4]])).toBe("1,2,3,4");
    });
  });

  describe("Objects with custom toString", () => {
    it("should use Date toString", () => {
      const date = new Date("2023-06-15T12:00:00.000Z");
      const result = getErrorMessage(date);
      // Check that it contains the date string (should work in any timezone)
      expect(result).toMatch(/2023|Jun|June/);
    });

    it("should use RegExp toString", () => {
      const regex = /test/gi;
      expect(getErrorMessage(regex)).toBe("/test/gi");
    });

    it("should use custom toString method", () => {
      const obj = {
        toString() {
          return "Custom error message";
        },
      };
      expect(getErrorMessage(obj)).toBe("Custom error message");
    });

    it("should ignore toString that returns default format", () => {
      const obj = {
        value: 42,
        toString() {
          return "[object Object]";
        },
      };
      const result = getErrorMessage(obj);
      expect(result).toBe('{"value":42}');
    });
  });

  describe("Plain objects", () => {
    it("should JSON.stringify plain object", () => {
      const obj = { code: 500, message: "Server error" };
      expect(getErrorMessage(obj)).toBe('{"code":500,"message":"Server error"}');
    });

    it("should handle empty object", () => {
      expect(getErrorMessage({})).toBe("{}");
    });

    it("should handle nested objects", () => {
      const obj = { outer: { inner: "value" } };
      expect(getErrorMessage(obj)).toBe('{"outer":{"inner":"value"}}');
    });

    it("should handle object with undefined values", () => {
      const obj = { a: 1, b: undefined };
      expect(getErrorMessage(obj)).toBe('{"a":1}');
    });

    it("should handle object with null values", () => {
      const obj = { a: 1, b: null };
      expect(getErrorMessage(obj)).toBe('{"a":1,"b":null}');
    });
  });

  describe("Circular references", () => {
    it("should handle circular object reference", () => {
      const obj: any = { name: "test" };
      obj.self = obj;
      const result = getErrorMessage(obj);
      expect(result).toContain("[object Object]");
    });

    it("should handle circular array reference", () => {
      const arr: any[] = [1, 2];
      arr.push(arr);
      const result = getErrorMessage(arr);
      expect(typeof result).toBe("string");
    });
  });

  describe("Special types", () => {
    it("should handle Symbol", () => {
      const sym = Symbol("test");
      expect(getErrorMessage(sym)).toBe("Symbol(test)");
    });

    it("should handle Function", () => {
      const fn = function testFunc() {};
      const result = getErrorMessage(fn);
      expect(result).toContain("function");
    });

    it("should handle BigInt", () => {
      const bigInt = BigInt(12345);
      expect(getErrorMessage(bigInt)).toBe("12345");
    });
  });

  describe("Edge cases", () => {
    it("should handle object with toJSON method", () => {
      const obj = {
        value: 42,
        toJSON() {
          return { serialized: this.value };
        },
      };
      expect(getErrorMessage(obj)).toBe('{"serialized":42}');
    });

    it("should handle Error with additional properties", () => {
      const error = new Error("Base error") as any;
      error.code = "ERR_CUSTOM";
      error.statusCode = 500;
      // Should only return the message, not additional properties
      expect(getErrorMessage(error)).toBe("Base error");
    });

    it("should handle object with broken toString", () => {
      const obj = {
        toString() {
          throw new Error("toString failed");
        },
      };
      const result = getErrorMessage(obj);
      expect(result).toBe("{}");
    });
  });
});
