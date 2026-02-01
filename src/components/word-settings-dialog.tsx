import { useState } from "react";
import { Download, Upload, Copy, Trash2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const generateExportJSON = () => {
    const exportData = {
      sourceWord: sourceWord.word,
      foundWords: foundWords.map(w => w.word),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const handleExport = () => {
    try {
      const jsonString = generateExportJSON();
      
      // Add UTF-8 BOM for proper encoding in all browsers/apps
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `wordy-${sourceWord.word.toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after download starts
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Экспортировано",
        description: `Слова для "${sourceWord.word}" экспортированы`,
      });

      // Close dialog with a small delay to allow dropdown to close naturally
      setTimeout(() => {
        setSettingsOpen(false);
      }, 50);
    } catch (error) {
      toast({
        variant: "warning",
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать файл",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const jsonString = generateExportJSON();
      await navigator.clipboard.writeText(jsonString);
      
      toast({
        title: "Скопировано",
        description: "JSON скопирован в буфер обмена",
      });
      
      setSettingsOpen(false);
    } catch (error) {
      toast({
        variant: "warning",
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена",
      });
    }
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

    // Verify source word matches
    if ((data as any).sourceWord.toUpperCase() !== sourceWord.word.toUpperCase()) {
      toast({
        variant: "warning",
        title: "Ошибка импорта",
        description: `Исходное слово в файле (${(data as any).sourceWord}) не совпадает с текущим (${sourceWord.word})`,
      });
      return;
    }

    // Import the words
    const newWords: FoundWord[] = (data as any).foundWords
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  data-testid="button-export-menu"
                >
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Экспортировать</div>
                    <div className="text-xs text-muted-foreground">
                      {foundWords.length} слов
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Скачать JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  data-testid="button-import-menu"
                >
                  <Upload className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Импортировать</div>
                    <div className="text-xs text-muted-foreground">
                      Загрузить JSON
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
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

            {/* Delete Button */}
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 text-destructive hover:text-destructive"
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
