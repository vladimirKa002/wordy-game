import type { FoundWord } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface FoundWordsListProps {
  words: FoundWord[];
}

export function FoundWordsList({ words }: FoundWordsListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {words.map((word) => (
        <Badge
          key={word.id}
          variant="secondary"
          className="justify-center py-2 text-base font-medium"
          data-testid={`found-word-${word.word}`}
        >
          {word.word}
        </Badge>
      ))}
    </div>
  );
}
