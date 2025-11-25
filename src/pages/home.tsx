import { useState } from "react";
import { Link } from "wouter";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/delete-dialog";
import { LocalStorage } from "@/lib/storage";
import type { SourceWord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [sourceWords, setSourceWords] = useState<SourceWord[]>(() => LocalStorage.getSourceWords());
  const [newWord, setNewWord] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogWord, setDeleteDialogWord] = useState<[string, string]>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const handleAddWord = () => {
    const trimmed = newWord.trim().toUpperCase();
    
    if (trimmed.length < 5) {
      toast({
        variant: "destructive",
        title: "Слово слишком короткое",
        description: "Исходное слово должно содержать минимум 5 букв",
      });
      return;
    }

    if (trimmed.length > 20) {
      toast({
        variant: "destructive",
        title: "Слово слишком длинное",
        description: "Исходное слово должно содержать максимум 20 букв",
      });
      return;
    }

    if (!/^[А-ЯЁ]+$/i.test(trimmed)) {
      toast({
        variant: "destructive",
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

  const handleDelete = (id: string, word: string) => {
    LocalStorage.deleteSourceWord(id);
    setSourceWords(sourceWords.filter(w => w.id !== id));
    toast({
      title: "Удалено",
      description: `"${word}" было удалено`,
    });
  };

  const getFoundWordCount = (sourceWordId: string) => {
    return LocalStorage.getFoundWords(sourceWordId).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Поиск слов</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Найдите слова из исходного слова
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="default" data-testid="button-add-word">
                <Plus className="w-4 h-4 mr-2" />
                Добавить
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
            {sourceWords.map((sourceWord) => (
              <Card 
                key={sourceWord.id}
                className="hover-elevate active-elevate-2 transition-all cursor-pointer group"
                data-testid={`card-source-${sourceWord.id}`}
              >
                <Link href={`/game/${sourceWord.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold tracking-wide font-mono">
                        {sourceWord.word}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" data-testid={`badge-count-${sourceWord.id}`}>
                        {getFoundWordCount(sourceWord.id)} {getFoundWordCount(sourceWord.id) === 1 ? 'слово' : getFoundWordCount(sourceWord.id) > 1 && getFoundWordCount(sourceWord.id) < 5 ? 'слова' : 'слов'}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteDialogOpen(true);
                          setDeleteDialogWord([sourceWord.id, sourceWord.word]);
                        }}
                        data-testid={`button-delete-${sourceWord.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {sourceWord.word.length} {sourceWord.word.length === 1 ? 'буква' : sourceWord.word.length > 1 && sourceWord.word.length < 5 ? 'буквы' : 'букв'} • Добавлено {new Date(sourceWord.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
            <DeleteDialog
              dialogOpen={deleteDialogOpen}
              setDialogOpen={setDeleteDialogOpen}
              title="Удалить"
              description={`Вы уверены, что хотите удалить слово "${deleteDialogWord?.[1]}"?`}
              onConfirm={() => handleDelete(deleteDialogWord![0], deleteDialogWord![1])}
              onCancel={()=>{}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
