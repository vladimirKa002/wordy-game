import { useState, useEffect, type DragEvent } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Shuffle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LocalStorage, validateWord, shuffleArray } from "@/lib/storage";
import type { SourceWord, FoundWord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { LetterTile } from "@/components/letter-tile";
import { FoundWordsList } from "@/components/found-words-list";

export default function Game() {
  const [, params] = useRoute("/game/:id");
  const sourceWordId = params?.id;
  const { toast } = useToast();

  const [sourceWord, setSourceWord] = useState<SourceWord | null>(null);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [letterArrangement, setLetterArrangement] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (!sourceWordId) return;
    
    const words = LocalStorage.getSourceWords();
    const word = words.find(w => w.id === sourceWordId);
    
    if (word) {
      setSourceWord(word);
      setLetterArrangement(word.word.split(''));
      const found = LocalStorage.getFoundWords(sourceWordId);
      setFoundWords(found);
    }
  }, [sourceWordId]);

  const handleShuffle = () => {
    setLetterArrangement(shuffleArray(letterArrangement));
  };

  const handleAddWord = () => {
    if (!sourceWord) return;
    
    const trimmed = inputWord.trim().toUpperCase();
    
    if (trimmed.length === 0) return;

    // Check if already found
    if (LocalStorage.hasFoundWord(sourceWord.id, trimmed)) {
      toast({
        variant: "destructive",
        title: "Уже найдено",
        description: `Вы уже нашли "${trimmed}"`,
      });
      setInputWord("");
      return;
    }

    // Validate word
    const validation = validateWord(trimmed, sourceWord.word);
    
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Недопустимое слово",
        description: validation.error,
      });
      return;
    }

    // Add the word
    const newWord = LocalStorage.addFoundWord({
      sourceWordId: sourceWord.id,
      word: trimmed,
    });

    setFoundWords([...foundWords, newWord]);
    setInputWord("");
    
    toast({
      title: "Слово найдено!",
      description: `"${trimmed}" добавлено в список`,
    });

    // Switch to the tab for this word's first letter
    const firstLetter = trimmed[0];
    setActiveTab(firstLetter);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newArrangement = [...letterArrangement];
    const draggedLetter = newArrangement[draggedIndex];
    newArrangement.splice(draggedIndex, 1);
    newArrangement.splice(index, 0, draggedLetter);
    
    setLetterArrangement(newArrangement);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getUniqueLettersFromSource = (): string[] => {
    if (!sourceWord) return [];
    const letters = new Set(sourceWord.word.split(''));
    return Array.from(letters).sort();
  };

  const getWordsByLetter = (letter: string): FoundWord[] => {
    return [...foundWords]
      .filter(w => w.word[0] === letter)
      .sort((a, b) => a.word.localeCompare(b.word));
  };

  if (!sourceWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Исходное слово не найдено</h2>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к списку
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const uniqueLetters = getUniqueLettersFromSource();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold font-mono tracking-wider" data-testid="text-source-word">
              {sourceWord.word}
            </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Letter Manipulation Bar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Буквы
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShuffle}
                  data-testid="button-shuffle"
                >
                  <Shuffle className="w-3 h-3 mr-1.5" />
                  Перемешать
                </Button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {letterArrangement.map((letter, index) => (
                  <LetterTile
                    key={`${letter}-${index}`}
                    letter={letter}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedIndex === index}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Word Input */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Добавить новое слово
              </h2>
              <div className="flex gap-2">
                <Input
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddWord();
                    }
                  }}
                  placeholder="Введите слово..."
                  className="text-lg font-medium"
                  data-testid="input-word"
                />
                <Button 
                  onClick={handleAddWord}
                  disabled={inputWord.trim().length === 0}
                  data-testid="button-add-word"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Found Words with Tabs */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Найденные слова
                </h2>
                <Badge variant="secondary" data-testid="badge-total-words">
                  {foundWords.length} всего
                </Badge>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-transparent p-0">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid="tab-all"
                  >
                    Все ({foundWords.length})
                  </TabsTrigger>
                  {uniqueLetters.map((letter) => (
                    <TabsTrigger
                      key={letter}
                      value={letter}
                      className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      data-testid={`tab-${letter}`}
                    >
                      {letter} ({getWordsByLetter(letter).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  {foundWords.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Слова ещё не найдены. Начните искать слова!
                      </p>
                    </div>
                  ) : (
                    <FoundWordsList
                      words={[...foundWords].sort((a, b) => a.word.localeCompare(b.word))}
                    />
                  )}
                </TabsContent>
                
                {uniqueLetters.map((letter) => (
                  <TabsContent key={letter} value={letter} className="mt-4">
                    {getWordsByLetter(letter).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">
                          Нет слов на букву {letter}
                        </p>
                      </div>
                    ) : (
                      <FoundWordsList words={getWordsByLetter(letter)} />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
