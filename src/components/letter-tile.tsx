import type { DragEvent } from "react";

interface LetterTileProps {
  letter: string;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function LetterTile({
  letter,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: LetterTileProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`
        min-w-12 w-12 h-12 flex items-center justify-center flex-shrink-0
        bg-primary text-primary-foreground
        rounded-md font-mono font-bold text-2xl
        cursor-grab active:cursor-grabbing
        transition-all select-none
        hover-elevate active-elevate-2
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
      data-testid={`letter-tile-${index}`}
    >
      {letter}
    </div>
  );
}
