export function calculateAverage(numbers): number {
  var total = 0;

  for (const num of numbers) {
    total += num;
  }

  return total / numbers.length;
}

export function getUserName(user) {
  return user.name.toUpperCase();
}
