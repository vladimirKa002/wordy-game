import { useState } from "react";
import type { FoundWord } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/delete-dialog";

interface FoundWordsListProps {
  words: FoundWord[];
  deleteHandler: (id: string, word: string) => void;
}

export function FoundWordsList({ words, deleteHandler: deleteHandler }: FoundWordsListProps) {
  const [dialogWord, setDialogWord] = useState<[string, string]>();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {words.map((word) => (
        <Badge
          key={word.id}
          variant="secondary"
          onClick={() => {
            setDialogOpen(true);
            setDialogWord([word.id, word.word]);
          }}
          className="justify-center py-2 text-base font-medium cursor-pointer"
          data-testid={`found-word-${word.word}`}
        >
          <span className="pointer-events-none">
            {word.word}
            {word.word.length >= 6 && (
              <sup className="ml-0.5 text-xs font-normal">{word.word.length}</sup>
            )}
          </span>
        </Badge>
      ))}

      <DeleteDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        title="Удалить"
        description={`Вы уверены, что хотите удалить слово "${dialogWord?.[1]}"?`}
        onCancel={()=>{}}
        onConfirm={() => deleteHandler(dialogWord![0], dialogWord![1])}
      />
    </div>
  );
}
