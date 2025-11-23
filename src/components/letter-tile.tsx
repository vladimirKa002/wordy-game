import type { DragEvent } from "react";

interface LetterTileProps {
  letter: string;
  index: number;
  count: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function LetterTile({
  letter,
  index,
  count,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: LetterTileProps) {
  const basis = `${100 / count}%`;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`
        flex-1 basis-0           /* shrink tiles evenly */
        min-w-[1.8rem] min-h-[1.8rem]
        max-w-10 max-h-10
        aspect-square
        flex items-center justify-center
        bg-primary text-primary-foreground
        rounded-md font-mono font-bold
        text-[1.2em]             /* <= font scales with tile */
        cursor-grab active:cursor-grabbing
        transition-all select-none
        hover-elevate active-elevate-2
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
      style={{ flexBasis: basis }}
      data-testid={`letter-tile-${index}`}
    >
      {letter}
    </div>
  );
}
