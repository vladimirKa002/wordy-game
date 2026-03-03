import type { FoundWord } from "@shared/schema";

// Fibonacci numbers for word length coefficients
const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

// Maximum source word length
const MAX_WORD_LENGTH = 20;

// Scrabble-style scoring for Russian letters (Эрудит)
const RUSSIAN_LETTER_SCORES: Record<string, number> = {
  А: 1, Е: 1, И: 1, О: 1,
  В: 2, К: 2, Л: 2, М: 2, Н: 2, П: 2, Р: 2, С: 2, Т: 2,
  Б: 3, Г: 3, Д: 3, Ё: 3, Й: 3, У: 3, Я: 3,
  Ж: 5, З: 5, Х: 5, Ч: 5, Ь: 5, Ы: 5,
  Ф: 10, Ц: 10, Ш: 10, Щ: 10, Ю: 10, Э: 10,
  Ъ: 15,
};

// Scrabble-style scoring for English letters
const ENGLISH_LETTER_SCORES: Record<string, number> = {
  A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1,
  D: 2, G: 2,
  B: 3, C: 3, M: 3, P: 3,
  F: 4, H: 4, V: 4, W: 4, Y: 4,
  K: 5,
  J: 8, X: 8,
  Q: 10, Z: 10,
};

interface WordEfficiencyMetrics {
  totalWords: number;
  sourceWordLength: number;
  k1: number; // Words per letter (without length weighting)
  weightedSum: number; // Sum of words * fibonacci coefficients
  k2: number; // Weighted words per letter (K2 = weightedSum / sourceWordLength)
  efficiency: number; // k2 / k1 efficiency coefficient
  scrabbleScore: number; // Total Scrabble-style score of all found words
  normalizedScrabbleScore: number; // Scrabble score divided by source word weight
  sourceWordWeight: number; // Total weight of source word letters
  breakdown: {
    length: number;
    count: number;
    coefficient: number;
  }[];
  scrabbleBreakdown: {
    word: string;
    score: number;
  }[];
}

/**
 * Calculate Scrabble-style score for a single word.
 * Detects language (Russian or English) based on characters.
 */
function calculateWordScore(word: string): number {
  let score = 0;
  for (const letter of word) {
    const upperLetter = letter.toUpperCase();
    if (RUSSIAN_LETTER_SCORES[upperLetter]) {
      score += RUSSIAN_LETTER_SCORES[upperLetter];
    } else if (ENGLISH_LETTER_SCORES[upperLetter]) {
      score += ENGLISH_LETTER_SCORES[upperLetter];
    }
  }
  return score;
}

/**
 * Calculate the total weight of a word based on letter values.
 * Used to normalize Scrabble scores.
 */
function calculateWordWeight(word: string): number {
  let weight = 0;
  for (const letter of word) {
    const upperLetter = letter.toUpperCase();
    if (RUSSIAN_LETTER_SCORES[upperLetter]) {
      weight += RUSSIAN_LETTER_SCORES[upperLetter];
    } else if (ENGLISH_LETTER_SCORES[upperLetter]) {
      weight += ENGLISH_LETTER_SCORES[upperLetter];
    }
  }
  return weight;
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

  // Apply Fibonacci coefficients based on word length
  // Word length 2 -> coefficient 1 (Fibonacci[0])
  // Word length 3 -> coefficient 2 (Fibonacci[1])
  // Word length 4 -> coefficient 3 (Fibonacci[2])
  // Word length 5 -> coefficient 5 (Fibonacci[3])
  // Word length 6 -> coefficient 8 (Fibonacci[4])
  // ... and so on
  for (let wordLength = 2; wordLength < N; wordLength++) {
    const count = wordsByLength.get(wordLength) || 0;

    // Map word length directly to Fibonacci index
    const fibIndex = wordLength - 2;
    let coefficient = 0;

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

  // Calculate source word weight
  const sourceWordWeight = calculateWordWeight(sourceWord);

  // Calculate total Scrabble score
  let scrabbleScore = 0;
  const scrabbleBreakdown: WordEfficiencyMetrics["scrabbleBreakdown"] = [];
  
  for (const found of foundWords) {
    const wordScore = calculateWordScore(found.word);
    scrabbleScore += wordScore;
    scrabbleBreakdown.push({
      word: found.word,
      score: wordScore,
    });
  }

  // Sort breakdown by score (descending)
  scrabbleBreakdown.sort((a, b) => b.score - a.score);

  // Normalize Scrabble score by source word weight
  const normalizedScrabbleScore = sourceWordWeight > 0 
    ? Math.round((scrabbleScore / sourceWordWeight) * 100) / 100
    : 0;

  return {
    totalWords: W,
    sourceWordLength: N,
    k1: Math.round(k1 * 100) / 100, // Round to 2 decimals
    weightedSum,
    k2: Math.round(k2 * 100) / 100, // Round to 2 decimals
    efficiency: Math.round(efficiency * 100) / 100, // Round to 2 decimals
    scrabbleScore,
    normalizedScrabbleScore,
    sourceWordWeight,
    breakdown,
    scrabbleBreakdown,
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
