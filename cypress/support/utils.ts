/**
 * Generates a random alphanumeric string.
 * @returns {string} A random unique identifier.
 */
export function generateUid() {
  return Math.random().toString(36).substring(7);
}
