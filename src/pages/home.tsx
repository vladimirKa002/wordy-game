import { useState } from "react";
import { Link } from "wouter";
import { Plus, Upload, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LocalStorage } from "@/lib/storage";
import { calculateWordEfficiency } from "@/lib/wordEfficiency";
import type { SourceWord, FoundWord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [sourceWords, setSourceWords] = useState<SourceWord[]>(() => LocalStorage.getSourceWords());
  const [newWord, setNewWord] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  const handleAddWord = () => {
    const trimmed = newWord.trim().toUpperCase();
    
    if (trimmed.length < 5) {
      toast({
        variant: "warning",
        title: "Слово слишком короткое",
        description: "Исходное слово должно содержать минимум 5 букв",
      });
      return;
    }

    if (trimmed.length > 20) {
      toast({
        variant: "warning",
        title: "Слово слишком длинное",
        description: "Исходное слово должно содержать максимум 20 букв",
      });
      return;
    }

    if (!/^[А-ЯЁ]+$/i.test(trimmed)) {
      toast({
        variant: "warning",
        title: "Недопустимые символы",
        description: "Слово должно содержать только русские буквы",
      });
      return;
    }

    const word = LocalStorage.addSourceWord({ word: trimmed });
    setSourceWords([...sourceWords, word]);
    setNewWord("");
    setDialogOpen(false);
    toast({
      title: "Исходное слово добавлено!",
      description: `"${trimmed}" готово к игре`,
    });
  };

  const processImportData = async (data: unknown) => {
    // Validate the import data
    if (!Array.isArray((data as any)?.foundWords) || !(data as any)?.sourceWord) {
      toast({
        variant: "warning",
        title: "Ошибка импорта",
        description: "Некорректный формат файла",
      });
      return;
    }

    const sourceWordUpper = ((data as any).sourceWord as string).toUpperCase();

    // Check if source word already exists
    let targetWord = sourceWords.find(w => w.word === sourceWordUpper);
    
    if (!targetWord) {
      // Create new source word
      targetWord = LocalStorage.addSourceWord({ word: sourceWordUpper });
      setSourceWords([...sourceWords, targetWord]);
      
      toast({
        title: "Исходное слово создано",
        description: `Создано слово "${sourceWordUpper}"`,
      });
    }

    // Import the words
    const existingWords = LocalStorage.getFoundWords(targetWord.id);
    const newWords: FoundWord[] = (data as any).foundWords
      .filter((word: string) => !existingWords.some(fw => fw.word.toUpperCase() === word.toUpperCase()))
      .map((word: string) => ({
        id: crypto.randomUUID(),
        sourceWordId: targetWord.id,
        word: word.toUpperCase(),
        foundAt: Date.now(),
      }));

    if (newWords.length === 0) {
      toast({
        title: "Нет новых слов",
        description: "Все слова из файла уже добавлены",
      });
      return;
    }

    LocalStorage.addFoundWords(newWords);

    toast({
      title: "Импортировано",
      description: `Добавлено ${newWords.length} слов для "${sourceWordUpper}"`,
    });
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await processImportData(data);
      } catch (error) {
        toast({
          variant: "warning",
          title: "Ошибка импорта",
          description: "Не удалось прочитать файл",
        });
      }
    };

    input.click();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      await processImportData(data);
    } catch (error) {
      toast({
        variant: "warning",
        title: "Ошибка",
        description: "Не удалось прочитать буфер обмена. Убедитесь, что скопирован корректный JSON.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8 gap-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Поиск слов</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Найдите слова из исходного слова
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" data-testid="button-add-word">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить исходное слово</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="word">Исходное слово</Label>
                  <Input
                    id="word"
                    data-testid="input-source-word"
                    placeholder="Введите слово (5-20 букв)"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddWord();
                      }
                    }}
                    className="text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    {newWord.length}/20 символов
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setNewWord("");
                    }}
                    data-testid="button-cancel"
                  >
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleAddWord}
                    data-testid="button-save-word"
                  >
                    Добавить слово
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline"
                  data-testid="button-import-menu"
                  title="Импортировать слова"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Из файла JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePasteFromClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Из буфера обмена
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {sourceWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Нет исходных слов</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Добавьте исходное слово, чтобы начать поиск слов
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-word">
              <Plus className="w-4 h-4 mr-2" />
              Добавить первое слово
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-0">
            {sourceWords.map((sourceWord) => {
              const foundWords = LocalStorage.getFoundWords(sourceWord.id);
              const wordCount = foundWords.length;
              const metrics = calculateWordEfficiency(sourceWord.word, foundWords);
              
              return (
              <Card 
                key={sourceWord.id}
                className="hover-elevate active-elevate-2 transition-all cursor-pointer group"
                data-testid={`card-source-${sourceWord.id}`}
              >
                <Link href={`/game/${sourceWord.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
                    <h3 className="text-xl font-semibold tracking-wide font-mono">
                      {sourceWord.word}
                    </h3>
                    <Badge variant="secondary" data-testid={`badge-count-${sourceWord.id}`}>
                      {wordCount} {wordCount === 1 ? 'слово' : wordCount > 1 && wordCount < 5 ? 'слова' : 'слов'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-start justify-start gap-2">
                      <p className="text-sm text-muted-foreground">
                        {sourceWord.word.length} {sourceWord.word.length === 1 ? 'буква' : sourceWord.word.length > 1 && sourceWord.word.length < 5 ? 'буквы' : 'букв'} • Добавлено {new Date(sourceWord.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                      <div className="flex items-start justify-start gap-2">
                        <Badge variant="outline" title="K1" className="font-mono">
                          {metrics.k1.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" title="K2" className="font-mono">
                          {metrics.k2.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
