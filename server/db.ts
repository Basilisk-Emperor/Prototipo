import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, books, chapters, translations, InsertBook, InsertChapter, InsertTranslation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listBooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(books).limit(50);
}

export async function getBookById(bookId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getChaptersByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chapters).where(eq(chapters.bookId, bookId)).orderBy(chapters.chapterNumber);
}

export async function getChapterById(chapterId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chapters).where(eq(chapters.id, chapterId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTranslationsByChapterId(chapterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(translations).where(eq(translations.chapterId, chapterId));
}

export async function getTranslationByChapterAndType(chapterId: number, translationType: 'official' | 'ai', language: string = 'pt-BR') {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(translations)
    .where(
      and(
        eq(translations.chapterId, chapterId),
        eq(translations.translationType, translationType),
        eq(translations.language, language)
      )
    )
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertBook(book: InsertBook) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(books).values(book);
  return result;
}

export async function insertChapter(chapter: InsertChapter) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(chapters).values(chapter);
  return result;
}

export async function insertTranslation(translation: InsertTranslation) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(translations).values(translation);
  return result;
}
