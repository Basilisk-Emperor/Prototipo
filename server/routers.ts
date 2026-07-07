import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  library: router({
    books: router({
      list: publicProcedure.query(async () => {
        return db.listBooks();
      }),
      getById: publicProcedure.input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return { id: (val as Record<string, unknown>).id as number };
        }
        throw new Error("Invalid input");
      }).query(async ({ input }) => {
        return db.getBookById(input.id);
      }),
    }),
    chapters: router({
      getByBookId: publicProcedure.input((val: unknown) => {
        if (typeof val === "object" && val !== null && "bookId" in val) {
          return { bookId: (val as Record<string, unknown>).bookId as number };
        }
        throw new Error("Invalid input");
      }).query(async ({ input }) => {
        return db.getChaptersByBookId(input.bookId);
      }),
      getById: publicProcedure.input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return { id: (val as Record<string, unknown>).id as number };
        }
        throw new Error("Invalid input");
      }).query(async ({ input }) => {
        return db.getChapterById(input.id);
      }),
    }),
    translations: router({
      getByChapterId: publicProcedure.input((val: unknown) => {
        if (typeof val === "object" && val !== null && "chapterId" in val) {
          return { chapterId: (val as Record<string, unknown>).chapterId as number };
        }
        throw new Error("Invalid input");
      }).query(async ({ input }) => {
        return db.getTranslationsByChapterId(input.chapterId);
      }),
      getByChapterAndType: publicProcedure.input((val: unknown) => {
        if (typeof val === "object" && val !== null && "chapterId" in val && "translationType" in val) {
          const v = val as Record<string, unknown>;
          return { 
            chapterId: v.chapterId as number,
            translationType: v.translationType as 'official' | 'ai',
            language: (v.language as string) || 'pt-BR'
          };
        }
        throw new Error("Invalid input");
      }).query(async ({ input }) => {
        // Check if translation exists in database
        let translation = await db.getTranslationByChapterAndType(input.chapterId, input.translationType, input.language);
        
        // If AI translation is requested but not in DB, generate it
        if (input.translationType === 'ai' && !translation) {
          const chapter = await db.getChapterById(input.chapterId);
          if (!chapter) {
            throw new Error("Chapter not found");
          }
          
          // Generate AI translation using LLM
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a professional translator. Translate the following English text to Brazilian Portuguese (PT-BR). Maintain the original tone, style, and meaning. Preserve any special formatting or emphasis."
              },
              {
                role: "user",
                content: `Translate this text to Brazilian Portuguese:\n\n${chapter.originalContent}`
              }
            ]
          });
          
          const translatedContent = typeof response.choices[0]?.message.content === 'string' 
            ? response.choices[0].message.content 
            : "";
          
          // Save to database for future use
          if (translatedContent) {
            await db.insertTranslation({
              chapterId: input.chapterId,
              language: input.language,
              translationType: 'ai',
              content: translatedContent
            });
          }
          
          const savedTranslation = await db.getTranslationByChapterAndType(input.chapterId, 'ai', input.language);
          return savedTranslation || {
            id: 0,
            chapterId: input.chapterId,
            language: input.language,
            translationType: 'ai' as const,
            content: translatedContent,
            createdAt: new Date()
          };
        }
        
        return translation;
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
