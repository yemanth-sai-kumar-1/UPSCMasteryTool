import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flashcardSets = pgTable("flashcard_sets", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  flashcards: jsonb("flashcards").$type<{
    front: string;
    back: string;
  }[]>().notNull(),
  mcqs: jsonb("mcqs").$type<{
    question: string;
    options: string[];
    correctAnswer: number;
  }[]>().notNull(),
});

export const insertFlashcardSetSchema = createInsertSchema(flashcardSets);
export type InsertFlashcardSet = z.infer<typeof insertFlashcardSetSchema>;
export type FlashcardSet = typeof flashcardSets.$inferSelect;

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  setId: integer("set_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults);
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;
