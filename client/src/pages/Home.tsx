import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: Date;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: books, isLoading, error } = trpc.library.books.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-900">Biblioteca Virtual</h1>
          </div>
          <p className="mt-2 text-gray-600">Explore e leia histórias incríveis</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando livros...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-700">Erro ao carregar livros. Tente novamente.</p>
          </div>
        ) : !books || books.length === 0 ? (
          <div className="rounded-lg bg-blue-50 p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-blue-300" />
            <p className="mt-4 text-gray-600">Nenhum livro disponível no momento.</p>
            <p className="mt-2 text-sm text-gray-500">Volte em breve para mais conteúdo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book: Book) => (
              <Card
                key={book.id}
                className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:border-blue-300"
              >
                {/* Book Cover */}
                <div className="relative h-48 bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="h-12 w-12 text-blue-400" />
                      <span className="text-xs text-blue-600 font-medium">Sem capa</span>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <CardHeader className="flex-1">
                  <CardTitle className="line-clamp-2 text-lg text-blue-900">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    por {book.author}
                  </CardDescription>
                </CardHeader>

                {/* Description */}
                <CardContent className="flex-1">
                  {book.description && (
                    <p className="line-clamp-3 text-sm text-gray-700">
                      {book.description}
                    </p>
                  )}
                </CardContent>

                {/* Action Button */}
                <div className="border-t border-gray-100 p-4">
                  <Button
                    onClick={() => setLocation(`/book/${book.id}/chapter/1`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Ler Agora
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
