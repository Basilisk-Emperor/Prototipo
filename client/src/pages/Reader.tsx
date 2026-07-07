import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Chapter {
  id: number;
  bookId: number;
  chapterNumber: number;
  title: string;
  originalContent: string;
  createdAt: Date;
}

interface Translation {
  id: number;
  chapterId: number;
  language: string;
  translationType: 'official' | 'ai';
  content: string;
  createdAt: Date;
}

export default function Reader() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/book/:bookId/chapter/:chapterId");
  const bookId = params?.bookId ? parseInt(params.bookId) : 0;
  const chapterId = params?.chapterId ? parseInt(params.chapterId) : 0;

  const [translationType, setTranslationType] = useState<'official' | 'ai'>('official');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Fetch book info
  const { data: book, isLoading: bookLoading } = trpc.library.books.getById.useQuery(
    { id: bookId },
    { enabled: bookId > 0 }
  );

  // Fetch all chapters for the book
  const { data: chapters, isLoading: chaptersLoading } = trpc.library.chapters.getByBookId.useQuery(
    { bookId },
    { enabled: bookId > 0 }
  );

  // Fetch current chapter
  const { data: currentChapter, isLoading: chapterLoading } = trpc.library.chapters.getById.useQuery(
    { id: chapterId },
    { enabled: chapterId > 0 }
  );

  // Fetch translation for current chapter
  const { data: translation, isLoading: translationLoading } = trpc.library.translations.getByChapterAndType.useQuery(
    { chapterId, translationType, language: 'pt-BR' },
    { enabled: chapterId > 0 }
  );

  // Update current chapter index when chapters load or chapterId changes
  useEffect(() => {
    if (chapters && chapterId > 0) {
      const index = chapters.findIndex((ch: Chapter) => ch.id === chapterId);
      if (index >= 0) {
        setCurrentChapterIndex(index);
      }
    }
  }, [chapters, chapterId]);

  const handlePreviousChapter = () => {
    if (chapters && currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      setLocation(`/book/${bookId}/chapter/${prevChapter.id}`);
    }
  };

  const handleNextChapter = () => {
    if (chapters && currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      setLocation(`/book/${bookId}/chapter/${nextChapter.id}`);
    }
  };

  if (!match) return null;

  const isLoading = bookLoading || chaptersLoading || chapterLoading;
  const canGoPrevious = chapters && currentChapterIndex > 0;
  const canGoNext = chapters && currentChapterIndex < chapters.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="text-blue-600 hover:bg-blue-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-blue-900">{book?.title}</h1>
                <p className="text-sm text-gray-600">{currentChapter?.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando capítulo...</span>
          </div>
        ) : !currentChapter ? (
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-700">Capítulo não encontrado.</p>
          </div>
        ) : (
          <>
            {/* Translation Selector */}
            <Card className="mb-6 p-4 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Modo de leitura:</span>
                <Tabs
                  value={translationType}
                  onValueChange={(value) => setTranslationType(value as 'official' | 'ai')}
                  className="w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-blue-100">
                    <TabsTrigger
                      value="official"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Oficial PT-BR
                    </TabsTrigger>
                    <TabsTrigger
                      value="ai"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Tradução IA
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>

            {/* Chapter Content */}
            <Card className="mb-8 p-8 bg-white border-blue-100">
              {translationLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    {translationType === 'ai' ? 'Gerando tradução por IA...' : 'Carregando tradução...'}
                  </span>
                </div>
              ) : !translation ? (
                <div className="rounded-lg bg-yellow-50 p-6 text-center">
                  <p className="text-yellow-700">
                    Tradução {translationType === 'official' ? 'oficial' : 'por IA'} não disponível.
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">{currentChapter.title}</h2>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {translation.content}
                  </div>
                </div>
              )}
            </Card>

            {/* Chapter Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={handlePreviousChapter}
                disabled={!canGoPrevious}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Capítulo Anterior
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p className="font-medium">
                  Capítulo {currentChapterIndex + 1} de {chapters?.length || 0}
                </p>
              </div>

              <Button
                onClick={handleNextChapter}
                disabled={!canGoNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                Próximo Capítulo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Chapter List */}
            <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Capítulos</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {chapters?.map((ch: Chapter, idx: number) => (
                  <Button
                    key={ch.id}
                    variant={ch.id === chapterId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation(`/book/${bookId}/chapter/${ch.id}`)}
                    className={
                      ch.id === chapterId
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-blue-200 hover:border-blue-400 text-blue-900"
                    }
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
