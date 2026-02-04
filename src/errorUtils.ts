/**
 * Safely extracts an error message from an unknown error type.
 *
 * This utility function handles various error types that can be thrown in JavaScript/TypeScript,
 * including Error instances, strings, numbers, and other objects.
 *
 * For objects, it attempts to provide detailed information:
 * 1. Error instances return their message property
 * 2. Objects with custom toString() methods use that (e.g., Date, RegExp)
 * 3. Plain objects are serialized with JSON.stringify
 * 4. Circular references fall back to String()
 *
 * @param error - The error object of unknown type
 * @returns A string representation of the error message
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error("Something went wrong");
 * } catch (error) {
 *   console.log(getErrorMessage(error)); // "Something went wrong"
 * }
 * ```
 *
 * @example
 * ```typescript
 * try {
 *   throw "String error";
 * } catch (error) {
 *   console.log(getErrorMessage(error)); // "String error"
 * }
 * ```
 *
 * @example
 * ```typescript
 * try {
 *   throw { code: 500, message: "Server error" };
 * } catch (error) {
 *   console.log(getErrorMessage(error)); // '{"code":500,"message":"Server error"}'
 * }
 * ```
 */
/**
 * Strips ANSI escape codes and control characters from a string.
 * Removes color codes (e.g., [32m, [39m), tabs, and other non-printable characters.
 *
 * @param text - The string to clean
 * @returns The cleaned string without ANSI codes or control characters
 */
export function stripAnsiCodes(text: string): string {
  return text
    // Remove ANSI escape sequences (colors, cursor movement, etc.)
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
    // Remove standalone escape characters
    .replace(/\x1b/g, "")
    // Remove tabs and replace with single space
    .replace(/\t/g, " ")
    // Remove other control characters (0x00-0x1F except newlines/carriage returns)
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, "")
    // Collapse multiple spaces into one
    .replace(/ {2,}/g, " ")
    .trim();
}

export function getErrorMessage(error: unknown): string {
  // Handle Error instances - always return the message property
  if (error instanceof Error) {
    return error.message;
  }

  // Handle primitive types
  if (typeof error === "string") {
    return error;
  }

  // Handle null and undefined explicitly
  if (error === null || error === undefined) {
    return String(error);
  }

  // Handle arrays specially - use their native toString() for simple comma-separated values
  if (Array.isArray(error)) {
    return String(error);
  }

  // Handle objects with custom toString (e.g., Date, RegExp, custom objects)
  if (typeof error === "object") {
    // Check for RegExp specifically (JSON.stringify returns {})
    if (error instanceof RegExp) {
      return String(error);
    }

    // Check if the object has a custom toString method
    // This includes both prototype-level and instance-level custom toString
    const errorObj = error as Record<string, unknown>;
    const hasCustomToString =
      typeof errorObj.toString === "function" &&
      errorObj.toString !== Object.prototype.toString;

    if (hasCustomToString) {
      try {
        const result = String(error);
        // Only use custom toString if it doesn't return the default "[object ...]" format
        if (result && !result.match(/^\[object .+\]$/)) {
          return result;
        }
      } catch {
        // Fall through to JSON.stringify if toString fails
      }
    }

    // Try JSON.stringify for plain objects
    try {
      return JSON.stringify(error);
    } catch {
      // JSON.stringify failed (likely circular reference), fall back to String()
      return String(error);
    }
  }

  // Default: use String() for any other types (symbols, functions, etc.)
  return String(error);
}
