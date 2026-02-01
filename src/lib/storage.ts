import type { SourceWord, FoundWord, InsertSourceWord, InsertFoundWord } from "@shared/schema";

const STORAGE_KEYS = {
  SOURCE_WORDS: 'wordGame_sourceWords',
  FOUND_WORDS: 'wordGame_foundWords',
} as const;

export class LocalStorage {
  // Source Words
  static getSourceWords(): SourceWord[] {
    const data = localStorage.getItem(STORAGE_KEYS.SOURCE_WORDS);
    return data ? JSON.parse(data) : [];
  }

  static addSourceWord(word: InsertSourceWord): SourceWord {
    const sourceWords = this.getSourceWords();
    const newWord: SourceWord = {
      ...word,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    sourceWords.push(newWord);
    localStorage.setItem(STORAGE_KEYS.SOURCE_WORDS, JSON.stringify(sourceWords));
    return newWord;
  }

  static deleteSourceWord(id: string): void {
    const sourceWords = this.getSourceWords().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.SOURCE_WORDS, JSON.stringify(sourceWords));
    
    // Also delete all found words for this source word
    const foundWords = this.getFoundWords().filter(w => w.sourceWordId !== id);
    localStorage.setItem(STORAGE_KEYS.FOUND_WORDS, JSON.stringify(foundWords));
  }

  // Found Words
  static getFoundWords(sourceWordId?: string): FoundWord[] {
    const data = localStorage.getItem(STORAGE_KEYS.FOUND_WORDS);
    const allWords: FoundWord[] = data ? JSON.parse(data) : [];
    return sourceWordId 
      ? allWords.filter(w => w.sourceWordId === sourceWordId)
      : allWords;
  }

  static addFoundWord(word: InsertFoundWord): FoundWord {
    const foundWords = this.getFoundWords();
    const newWord: FoundWord = {
      ...word,
      id: crypto.randomUUID(),
      foundAt: Date.now(),
    };
    foundWords.push(newWord);
    localStorage.setItem(STORAGE_KEYS.FOUND_WORDS, JSON.stringify(foundWords));
    return newWord;
  }

  static hasFoundWord(sourceWordId: string, word: string): boolean {
    const foundWords = this.getFoundWords(sourceWordId);
    return foundWords.some(w => w.word.toLowerCase() === word.toLowerCase());
  }

  static deleteFoundWord(id: string): void {
    const foundWords = this.getFoundWords().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOUND_WORDS, JSON.stringify(foundWords));
  }
}

// Word validation utilities
export const validateWord = (word: string, sourceWord: string): { valid: boolean; error?: string; extraLetters?: string } => {
  const normalizedWord = word.toLowerCase().trim();
  const normalizedSource = sourceWord.toLowerCase();

  if (normalizedWord.length < 2) {
    return { valid: false, error: "Слово должно содержать минимум 2 буквы" };
  }

  // Check if all letters in the word exist in the source word
  const sourceLetters = normalizedSource.split('');
  const wordLetters = normalizedWord.split('');
  const usedLetters: string[] = [];

  for (const letter of wordLetters) {
    const indexInSource = sourceLetters.indexOf(letter);
    if (indexInSource === -1) {
      // Find extra letters for better error message
      const extraLetters = wordLetters
        .filter(l => !normalizedSource.includes(l) && !usedLetters.includes(l))
        .join(', ')
        .toUpperCase();
      
      return { 
        valid: false, 
        error: `Слово содержит лишние буквы: ${extraLetters}`,
        extraLetters
      };
    }
    // Remove the used letter to prevent reusing the same letter instance
    sourceLetters.splice(indexInSource, 1);
    usedLetters.push(letter);
  }

  return { valid: true };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
