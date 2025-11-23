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
        aspect-square
        flex items-center justify-center
        max-w-10 max-h-10
        bg-primary text-primary-foreground
        rounded-md font-mono font-bold
        overflow-hidden
        [container-type:size]
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
      style={{ flexBasis: basis }}
      data-testid={`letter-tile-${index}`}
    >
      <div className="text-[8cqmin] leading-none select-none">
        {letter}
      </div>
    </div>
  );
}
