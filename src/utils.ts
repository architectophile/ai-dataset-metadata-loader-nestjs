export const convertNumTo5Str = (input: number): string => {
  if (typeof input !== 'number' || input < 0 || input >= 100000) {
    throw new Error('Input must be a non-negative number less than 100000');
  }
  return String(input).padStart(5, '0');
};
