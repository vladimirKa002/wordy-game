import { useState } from "react";
import { Download, Upload, Trash2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/delete-dialog";
import type { SourceWord, FoundWord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WordSettingsDialogProps {
  sourceWord: SourceWord;
  foundWords: FoundWord[];
  onDeleteWord: (id: string) => void;
  onImportWords: (words: FoundWord[]) => void;
}

export function WordSettingsDialog({
  sourceWord,
  foundWords,
  onDeleteWord,
  onImportWords,
}: WordSettingsDialogProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const exportData = {
      sourceWord: sourceWord.word,
      foundWords: foundWords.map(w => w.word),
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wordy-${sourceWord.word.toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Экспортировано",
      description: `Слова для "${sourceWord.word}" экспортированы`,
    });

    setSettingsOpen(false);
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

        // Validate the import data
        if (!Array.isArray(data.foundWords) || !data.sourceWord) {
          toast({
            variant: "warning",
            title: "Ошибка импорта",
            description: "Некорректный формат файла",
          });
          return;
        }

        // Verify source word matches
        if (data.sourceWord.toUpperCase() !== sourceWord.word.toUpperCase()) {
          toast({
            variant: "warning",
            title: "Ошибка импорта",
            description: `Исходное слово в файле (${data.sourceWord}) не совпадает с текущим (${sourceWord.word})`,
          });
          return;
        }

        // Import the words
        const newWords = data.foundWords
          .filter((word: string) => !foundWords.some(fw => fw.word.toUpperCase() === word.toUpperCase()))
          .map((word: string) => ({
            id: crypto.randomUUID(),
            sourceWordId: sourceWord.id,
            word: word.toUpperCase(),
            foundAt: Date.now(),
          }));

        if (newWords.length === 0) {
          toast({
            title: "Нет новых слов",
            description: "Все слова из файла уже добавлены",
          });
          setSettingsOpen(false);
          return;
        }

        onImportWords(newWords);

        toast({
          title: "Импортировано",
          description: `Добавлено ${newWords.length} новых слов для "${sourceWord.word}"`,
        });

        setSettingsOpen(false);
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

  const handleDelete = () => {
    onDeleteWord(sourceWord.id);
    setSettingsOpen(false);
  };

  return (
    <>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" data-testid="button-word-settings">
            <Settings className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Настройки слова "{sourceWord.word}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            {/* Export Button */}
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              data-testid="button-export-words"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Экспортировать</div>
                <div className="text-xs text-muted-foreground">
                  {foundWords.length} слов
                </div>
              </div>
            </Button>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              data-testid="button-import-words"
            >
              <Upload className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Импортировать</div>
                <div className="text-xs text-muted-foreground">
                  Загрузить из JSON файла
                </div>
              </div>
            </Button>

            {/* Delete Button */}
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 text-warning hover:text-warning"
              data-testid="button-delete-word-settings"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Удалить слово</div>
                <div className="text-xs text-muted-foreground">
                  Удалить все данные этого слова
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        dialogOpen={deleteDialogOpen}
        setDialogOpen={setDeleteDialogOpen}
        title="Удалить исходное слово"
        description={`Вы уверены, что хотите удалить слово "${sourceWord.word}" и все найденные слова? Это действие невозможно отменить.`}
        onCancel={() => {}}
        onConfirm={handleDelete}
      />
    </>
  );
}
