/**
 * Represents a user object with required name property.
 */
export interface User {
  name: string;
}

/**
 * Calculates the arithmetic mean (average) of an array of numbers.
 *
 * @param numbers - Array of numbers to average
 * @returns The calculated average
 * @throws {Error} If input is not an array
 * @throws {Error} If array is empty
 * @throws {Error} If array contains NaN or Infinity
 * @throws {Error} If calculation results in overflow
 * @throws {Error} If array contains non-numeric values
 *
 * @example
 * calculateAverage([1, 2, 3, 4, 5]); // Returns 3
 *
 * @example
 * calculateAverage([10, 20]); // Returns 15
 */
export function calculateAverage(numbers: number[]): number {
  // Validate input is an array
  if (!Array.isArray(numbers)) {
    throw new Error("Input must be an array");
  }

  // Validate array is not empty
  if (numbers.length === 0) {
    throw new Error("Cannot calculate average of an empty array");
  }

  let total = 0;

  // Validate all elements and accumulate sum
  for (const num of numbers) {
    // Check for invalid numeric values
    if (typeof num !== "number") {
      throw new Error("All elements must be numbers");
    }
    if (isNaN(num)) {
      throw new Error("Cannot calculate average of array containing NaN");
    }
    if (!isFinite(num)) {
      throw new Error("Cannot calculate average of array containing Infinity");
    }
    total += num;
  }

  // Additional safety check for overflow
  if (!isFinite(total)) {
    throw new Error("Overflow occurred during calculation - numbers are too large");
  }

  return total / numbers.length;
}

/**
 * Extracts and formats a user's name in uppercase.
 *
 * @param user - User object containing a name property
 * @returns The user's name trimmed and converted to uppercase
 * @throws {Error} If user is null or undefined
 * @throws {Error} If user.name is missing, null, or undefined
 * @throws {Error} If user.name is not a string
 * @throws {Error} If user.name is empty or only whitespace
 *
 * @example
 * getUserName({ name: "  John Doe  " }); // Returns "JOHN DOE"
 *
 * @example
 * getUserName({ name: "alice" }); // Returns "ALICE"
 */
export function getUserName(user: User | null | undefined): string {
  // Validate user object exists
  if (user === null || user === undefined) {
    throw new Error("User cannot be null or undefined");
  }

  // Validate name property exists
  if (!("name" in user) || user.name === null || user.name === undefined) {
    throw new Error("User must have a name property");
  }

  // Validate name is a string
  if (typeof user.name !== "string") {
    throw new Error("User name must be a string");
  }

  // Trim and validate not empty
  const trimmedName = user.name.trim();
  if (trimmedName === "") {
    throw new Error("User name cannot be empty");
  }

  return trimmedName.toUpperCase();
}
