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
