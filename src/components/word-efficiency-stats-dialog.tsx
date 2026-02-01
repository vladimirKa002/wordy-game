import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { calculateWordEfficiency } from "@/lib/wordEfficiency";
import type { FoundWord } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WordEfficiencyStatsDialogProps {
  sourceWord: string;
  foundWords: FoundWord[];
}

export function WordEfficiencyStatsDialog({ sourceWord, foundWords }: WordEfficiencyStatsDialogProps) {
  const metrics = calculateWordEfficiency(sourceWord, foundWords);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BarChart3 className="w-5 h-5" />
          Расшифровка
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Статистика эффективности для "{sourceWord}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-x-hidden">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-muted p-2 sm:p-4 rounded-lg min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 break-words">Найдено слов</div>
              <div className="text-2xl sm:text-3xl font-bold">{metrics.totalWords}</div>
            </div>
            <div className="bg-muted p-2 sm:p-4 rounded-lg min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 break-words">Букв в исходном</div>
              <div className="text-2xl sm:text-3xl font-bold">{metrics.sourceWordLength}</div>
            </div>
            <div className="bg-muted p-2 sm:p-4 rounded-lg min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 break-words">Эффективность</div>
              <div className="text-2xl sm:text-3xl font-bold">{metrics.efficiency.toFixed(2)}</div>
            </div>
          </div>

          {/* Formula Explanation */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 sm:p-4 rounded-lg space-y-3 text-xs sm:text-sm">
            <div>
              <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-1 break-words">K1 (базовый коэффициент):</div>
              <div className="text-sm sm:text-lg font-mono overflow-x-hidden break-words">{metrics.totalWords} ÷ {metrics.sourceWordLength} = {metrics.k1.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Количество найденных слов, приходящихся на одну букву исходного слова
              </p>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-1 break-words">K2 (взвешенный коэффициент):</div>
              <div className="text-sm sm:text-lg font-mono overflow-x-hidden break-words">{metrics.weightedSum} ÷ {metrics.sourceWordLength} = {metrics.k2.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Взвешенная сумма слов (с коэффициентами Фибоначчи) деленная на длину исходного слова
              </p>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-1 break-words">Эффективность (К2 ÷ К1):</div>
              <div className="text-sm sm:text-lg font-mono overflow-x-hidden break-words">{metrics.k2.toFixed(2)} ÷ {metrics.k1.toFixed(2)} = {metrics.efficiency.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Коэффициент эффективности для данного исходного слова
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          {metrics.breakdown.length > 0 && (
            <div className="overflow-x-hidden">
              <h3 className="text-xs sm:text-sm font-semibold mb-3">Разбор по длинам слов:</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center px-1 sm:px-4">Длина</TableHead>
                      <TableHead className="text-center px-1 sm:px-4">Кол-во</TableHead>
                      <TableHead className="text-center px-1 sm:px-4">Коэф.</TableHead>
                      <TableHead className="text-center px-1 sm:px-4">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.breakdown.map((row) => (
                      <TableRow key={row.length}>
                        <TableCell className="text-center font-mono px-1 sm:px-4">{row.length}</TableCell>
                        <TableCell className="text-center font-mono px-1 sm:px-4">{row.count}</TableCell>
                        <TableCell className="text-center font-mono px-1 sm:px-4">{row.coefficient}</TableCell>
                        <TableCell className="text-center font-mono font-semibold px-1 sm:px-4">
                          {row.count} × {row.coefficient} = {row.count * row.coefficient}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-yellow-50 dark:bg-yellow-950 p-2 sm:p-3 rounded-lg text-xs text-muted-foreground">
            <p className="break-words">
              Коэффициенты Фибоначчи применяются на основе разницы между длиной исходного слова и найденным словом.
              Более длинные найденные слова получают более высокие коэффициенты: N-2 букв → 233, N-3 букв → 144, и т.д.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
