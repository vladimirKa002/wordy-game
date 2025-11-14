import { z } from "zod";

// Source word schema - the main word from which players find smaller words
export const sourceWordSchema = z.object({
  id: z.string(),
  word: z.string().min(5).max(20),
  createdAt: z.number(),
});

export type SourceWord = z.infer<typeof sourceWordSchema>;

export const insertSourceWordSchema = sourceWordSchema.omit({ id: true, createdAt: true });
export type InsertSourceWord = z.infer<typeof insertSourceWordSchema>;

// Found word schema - words that players have discovered
export const foundWordSchema = z.object({
  id: z.string(),
  sourceWordId: z.string(),
  word: z.string().min(2),
  foundAt: z.number(),
});

export type FoundWord = z.infer<typeof foundWordSchema>;

export const insertFoundWordSchema = foundWordSchema.omit({ id: true, foundAt: true });
export type InsertFoundWord = z.infer<typeof insertFoundWordSchema>;

// Game state for a specific source word
export interface GameState {
  sourceWord: SourceWord;
  foundWords: FoundWord[];
  letterArrangement: string[]; // Current arrangement of letters
}
