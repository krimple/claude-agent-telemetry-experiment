import { describe, it, expect } from "vitest";
import { getErrorMessage } from "../src/errorUtils.js";

/**
 * Comprehensive tests for error handling utility functions.
 */
describe("getErrorMessage", () => {
  it("should extract message from Error instances", () => {
    const error = new Error("Test error");
    expect(getErrorMessage(error)).toBe("Test error");
  });

  it("should handle TypeError instances", () => {
    const error = new TypeError("Type mismatch");
    expect(getErrorMessage(error)).toBe("Type mismatch");
  });

  it("should handle RangeError instances", () => {
    const error = new RangeError("Out of range");
    expect(getErrorMessage(error)).toBe("Out of range");
  });

  it("should handle string errors", () => {
    expect(getErrorMessage("String error")).toBe("String error");
  });

  it("should handle empty string errors", () => {
    expect(getErrorMessage("")).toBe("");
  });

  it("should handle number errors", () => {
    expect(getErrorMessage(123)).toBe("123");
    expect(getErrorMessage(0)).toBe("0");
    expect(getErrorMessage(-456)).toBe("-456");
  });

  it("should handle null", () => {
    expect(getErrorMessage(null)).toBe("null");
  });

  it("should handle undefined", () => {
    expect(getErrorMessage(undefined)).toBe("undefined");
  });

  it("should handle boolean errors", () => {
    expect(getErrorMessage(true)).toBe("true");
    expect(getErrorMessage(false)).toBe("false");
  });

  it("should handle object errors", () => {
    const error = { code: 500, message: "Server error" };
    const result = getErrorMessage(error);
    expect(result).toContain("code");
    expect(result).toContain("500");
  });

  it("should handle array errors", () => {
    const error = [1, 2, 3];
    expect(getErrorMessage(error)).toBe("1,2,3");
  });

  it("should handle symbol errors", () => {
    const symbol = Symbol("test");
    const result = getErrorMessage(symbol);
    expect(result).toContain("Symbol(test)");
  });
});
