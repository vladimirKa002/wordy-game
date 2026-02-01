import type { FoundWord } from "@shared/schema";

// Fibonacci numbers for word length coefficients
const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

// Maximum source word length
const MAX_WORD_LENGTH = 20;

interface WordEfficiencyMetrics {
  totalWords: number;
  sourceWordLength: number;
  k1: number; // Words per letter (without length weighting)
  weightedSum: number; // Sum of words * fibonacci coefficients
  k2: number; // Weighted words per letter
  efficiency: number; // k2 / k1 efficiency coefficient
  breakdown: {
    length: number;
    count: number;
    coefficient: number;
  }[];
}

/**
 * Calculate word efficiency metrics based on the Russian formula.
 *
 * Formula breakdown:
 * K1 = Total found words / Source word length
 *
 * K2 = (Weighted sum based on found word lengths) / Source word length
 *      where weights are Fibonacci numbers mapped to word length differences
 *
 * Efficiency = K2 / K1
 *
 * The Fibonacci coefficients are applied based on how much shorter found words are
 * compared to the source word. Words that are N-2 letters long get the highest
 * coefficient (233), decreasing down to N-13 letters with coefficient 1.
 */
export function calculateWordEfficiency(
  sourceWord: string,
  foundWords: FoundWord[]
): WordEfficiencyMetrics {
  const W = foundWords.length; // Total found words
  const N = sourceWord.length; // Source word length

  // K1: Simple ratio of words to letters
  const k1 = N > 0 ? W / N : 0;

  // Calculate weighted sum using Fibonacci coefficients
  let weightedSum = 0;
  const breakdown: WordEfficiencyMetrics["breakdown"] = [];

  // Group found words by length
  const wordsByLength = new Map<number, number>();
  for (const found of foundWords) {
    const length = found.word.length;
    wordsByLength.set(length, (wordsByLength.get(length) || 0) + 1);
  }

  // Apply Fibonacci coefficients based on word length difference
  // n can range from N-2 down to 2 (minimum word length)
  for (let wordLength = 2; wordLength < N; wordLength++) {
    const count = wordsByLength.get(wordLength) || 0;

    // Calculate the difference from source word length
    const difference = N - wordLength;

    // Map difference to Fibonacci coefficient
    // difference = 2 (N-2) -> coefficient = 233 (index 11)
    // difference = 3 (N-3) -> coefficient = 144 (index 10)
    // ... and so on
    let coefficient = 0;
    const fibIndex = 11 - (difference - 2);

    if (fibIndex >= 0 && fibIndex < FIBONACCI_SEQUENCE.length) {
      coefficient = FIBONACCI_SEQUENCE[fibIndex];
    }

    if (count > 0) {
      weightedSum += count * coefficient;
      breakdown.push({
        length: wordLength,
        count,
        coefficient,
      });
    }
  }

  // K2: Weighted words per letter
  const k2 = N > 0 ? weightedSum / N : 0;

  // Efficiency: k2 / k1
  const efficiency = k1 > 0 ? k2 / k1 : 0;

  return {
    totalWords: W,
    sourceWordLength: N,
    k1: Math.round(k1 * 100) / 100, // Round to 2 decimals
    weightedSum,
    k2: Math.round(k2 * 100) / 100, // Round to 2 decimals
    efficiency: Math.round(efficiency * 100) / 100, // Round to 2 decimals
    breakdown,
  };
}

/**
 * Get a simplified efficiency score for display on tiles.
 * This returns the raw efficiency value rounded to 1 decimal place.
 */
export function getEfficiencyScore(
  sourceWord: string,
  foundWords: FoundWord[]
): number {
  const metrics = calculateWordEfficiency(sourceWord, foundWords);
  // Return the efficiency metric directly, rounded to 1 decimal
  return Math.round(metrics.efficiency * 10) / 10;
}
