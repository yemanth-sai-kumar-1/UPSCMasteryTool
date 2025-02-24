import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  questions: jsonb("questions").$type<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[]>().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes);
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").$type<{
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }[]>().notNull(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults);
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;