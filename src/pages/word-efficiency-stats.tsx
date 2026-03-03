import { useRoute, Link } from "wouter";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocalStorage } from "@/lib/storage";
import { calculateWordEfficiency } from "@/lib/wordEfficiency";
import type { SourceWord, FoundWord } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WordEfficiencyStats() {
  const [, params] = useRoute("/game/:id/stats");
  const sourceWordId = params?.id;

  const [sourceWord, setSourceWord] = useState<SourceWord | null>(null);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);

  useEffect(() => {
    if (!sourceWordId) return;

    const words = LocalStorage.getSourceWords();
    const word = words.find(w => w.id === sourceWordId);

    if (word) {
      setSourceWord(word);
      const found = LocalStorage.getFoundWords(sourceWordId);
      setFoundWords(found);
    }
  }, [sourceWordId]);

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

  const metrics = calculateWordEfficiency(sourceWord.word, foundWords);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href={`/game/${sourceWord.id}`}>
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold font-mono tracking-wider" data-testid="text-source-word">
              {sourceWord.word}
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-2 py-3 sm:px-4 sm:py-6 space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Найдено слов</div>
                <div className="text-3xl font-bold">{metrics.totalWords}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Букв в исходном</div>
                <div className="text-3xl font-bold">{metrics.sourceWordLength}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Эффективность</div>
                <div className="text-3xl font-bold">{metrics.efficiency.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Formula Explanation */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">Расчёты коэффициентов</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-2">K1 (базовый коэффициент):</div>
                  <div className="text-sm sm:text-lg font-mono bg-background p-2 rounded">{metrics.totalWords} ÷ {metrics.sourceWordLength} = {metrics.k1.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Количество найденных слов, приходящихся на одну букву исходного слова
                  </p>
                </div>
                
                <div>
                  <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-2">K2 (взвешенный коэффициент):</div>
                  <div className="text-sm sm:text-lg font-mono bg-background p-2 rounded">{metrics.weightedSum} ÷ {metrics.sourceWordLength} = {metrics.k2.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Взвешенная сумма слов (с коэффициентами Фибоначчи) деленная на длину исходного слова
                  </p>
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-2">Эффективность (К2 ÷ К1):</div>
                  <div className="text-sm sm:text-lg font-mono bg-background p-2 rounded">{metrics.k2.toFixed(2)} ÷ {metrics.k1.toFixed(2)} = {metrics.efficiency.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Коэффициент эффективности для данного исходного слова
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Table */}
          {metrics.breakdown.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-4">Разбор по длинам слов:</h3>
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
              </CardContent>
            </Card>
          )}

          {/* Scrabble Score Section */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">Рейтинг Scrabble</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center border-l-4 border-green-600 dark:border-green-400 pl-4">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Сумма очков</div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">{metrics.scrabbleScore}</div>
                  <p className="text-xs text-muted-foreground mt-1">без нормализации</p>
                </div>
                <div className="text-center border-l-4 border-green-500 dark:border-green-300 pl-4">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Нормализованный рейтинг</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.normalizedScrabbleScore.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">сумма ÷ вес исходного</p>
                </div>
              </div>
              
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded text-xs font-mono">
                <p className="break-words">{metrics.scrabbleScore} ÷ {metrics.sourceWordWeight} = {metrics.normalizedScrabbleScore.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Нормализация учитывает сложность исходного слова. Слово из разных букв - выше нормализованный рейтинг.
                </p>
              </div>

              {metrics.scrabbleBreakdown.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">Очки по словам:</p>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 sm:px-3 py-2">Слово</TableHead>
                          <TableHead className="text-right px-2 sm:px-3 py-2">Очки</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.scrabbleBreakdown.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono px-2 sm:px-3 py-2">{row.word}</TableCell>
                            <TableCell className="font-mono text-right px-2 sm:px-3 py-2 font-semibold">{row.score}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Letter Scores Reference */}
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-4">Таблица очков (Русский/English):</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-semibold mb-1">1 очко:</p>
                  <p className="break-words text-muted-foreground">А Е И О / A E I O U L N S T R</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">2 очка:</p>
                  <p className="break-words text-muted-foreground">В К Л М Н П Р С Т / D G</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">3 очка:</p>
                  <p className="break-words text-muted-foreground">Б Г Д Ё Й У Я / B C M P</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">5 очков:</p>
                  <p className="break-words text-muted-foreground">Ж З Х Ч Ь Ы / F H V W Y K</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">10 очков:</p>
                  <p className="break-words text-muted-foreground">Ф Ц Ш Щ Ю Э / J X Q Z</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">15 очков:</p>
                  <p className="break-words text-muted-foreground">Ъ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="p-4 text-xs text-muted-foreground space-y-3">
              <div>
                <p className="font-semibold text-xs mb-1">Коэффициенты Фибоначчи:</p>
                <p className="break-words">
                  Применяются на основе длины найденного слова: 2 буквы → 1, 3 буквы → 2, 4 буквы → 3, 5 букв → 5, 8 букв → 13, и т.д.
                </p>
              </div>
              <div>
                <p className="font-semibold text-xs mb-1">Нормализация очков:</p>
                <p className="break-words">
                  Scrabble рейтинг делится на вес исходного слова (сумма очков его букв) для справедливого сравнения разных слов.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
