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
        <Button variant="ghost" size="icon" title="Показать статистику эффективности">
          <BarChart3 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Статистика эффективности для "{sourceWord}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Найдено слов</div>
              <div className="text-3xl font-bold">{metrics.totalWords}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Букв в исходном</div>
              <div className="text-3xl font-bold">{metrics.sourceWordLength}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1 break-words">Эффективность</div>
              <div className="text-3xl font-bold">{metrics.efficiency.toFixed(2)}</div>
            </div>
          </div>

          {/* Formula Explanation */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
            <div>
              <div className="text-sm font-mono text-muted-foreground mb-1">K1 (базовый коэффициент):</div>
              <div className="text-lg font-mono">{metrics.totalWords} ÷ {metrics.sourceWordLength} = {metrics.k1.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Количество найденных слов, приходящихся на одну букву исходного слова
              </p>
            </div>
            
            <div>
              <div className="text-sm font-mono text-muted-foreground mb-1">K2 (взвешенный коэффициент):</div>
              <div className="text-lg font-mono">{metrics.weightedSum} ÷ {metrics.sourceWordLength} = {metrics.k2.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Взвешенная сумма слов (с коэффициентами Фибоначчи) деленная на длину исходного слова
              </p>
            </div>

            <div>
              <div className="text-sm font-mono text-muted-foreground mb-1">Эффективность (К2 ÷ К1):</div>
              <div className="text-lg font-mono">{metrics.k2.toFixed(2)} ÷ {metrics.k1.toFixed(2)} = {metrics.efficiency.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Коэффициент эффективности для данного исходного слова
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          {metrics.breakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Разбор по длинам слов:</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Длина слова</TableHead>
                      <TableHead className="text-center">Кол-во слов</TableHead>
                      <TableHead className="text-center">Коэффициент Фибоначчи</TableHead>
                      <TableHead className="text-center">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.breakdown.map((row) => (
                      <TableRow key={row.length}>
                        <TableCell className="text-center font-mono">{row.length}</TableCell>
                        <TableCell className="text-center font-mono">{row.count}</TableCell>
                        <TableCell className="text-center font-mono">{row.coefficient}</TableCell>
                        <TableCell className="text-center font-mono font-semibold">
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
          <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-xs text-muted-foreground">
            <p>
              Коэффициенты Фибоначчи применяются на основе разницы между длиной исходного слова и найденным словом.
              Более длинные найденные слова получают более высокие коэффициенты: N-2 букв → 233, N-3 букв → 144, и т.д.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
