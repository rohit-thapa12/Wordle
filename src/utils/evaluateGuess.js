/**
 * evaluateGuess.js — Core evaluation logic for the Wordle clone.
 *
 * Implements a **two-pass algorithm** to correctly handle duplicate letters:
 *
 * Pass 1 (Greens):
 *   Walk through every position. If the guessed letter matches the solution
 *   letter at the same index, mark it 'correct' (green) and "consume" that
 *   copy from the solution so it cannot match again.
 *
 * Pass 2 (Yellows / Grays):
 *   Walk through the remaining (non-green) positions. If the guessed letter
 *   still appears among the unconsumed solution letters, mark it 'present'
 *   (yellow) and consume one copy. Otherwise mark it 'absent' (gray).
 *
 * This two-pass approach is essential because a naive single-pass would
 * over-count yellows for letters that appear multiple times. For example:
 *   solution = "ABBEY", guess = "BOBBY"
 *   - B appears 2× in solution. Without two-pass, all three B's in BOBBY
 *     could get yellow, which is incorrect. With two-pass, only the matching
 *     copies are colored.
 *
 * @param {string} guess     – 5-letter uppercase guess string
 * @param {string} solution  – 5-letter uppercase solution string
 * @returns {string[]}       – Array of 5 statuses: 'correct' | 'present' | 'absent'
 */
export function evaluateGuess(guess, solution) {
  // Result array; will hold 'correct', 'present', or 'absent' for each position
  const result = Array(5).fill('absent');

  // Track which solution letters are still available for yellow matches.
  // We use an array copy so we can "null out" consumed letters.
  const solutionLetters = solution.split('');

  // ---- Pass 1: Mark greens (correct position) ----
  for (let i = 0; i < 5; i++) {
    if (guess[i] === solutionLetters[i]) {
      result[i] = 'correct';
      solutionLetters[i] = null; // consume this letter
    }
  }

  // ---- Pass 2: Mark yellows (present but wrong position) ----
  for (let i = 0; i < 5; i++) {
    // Skip positions already marked green
    if (result[i] === 'correct') continue;

    // Look for an unconsumed copy of this letter in the solution
    const matchIndex = solutionLetters.indexOf(guess[i]);
    if (matchIndex !== -1) {
      result[i] = 'present';
      solutionLetters[matchIndex] = null; // consume this copy
    }
    // Otherwise it stays 'absent' (the default)
  }

  return result;
}
