import { quizzes, quizResults, type Quiz, type InsertQuiz, type QuizResult, type InsertQuizResult } from "@shared/schema";

export interface IStorage {
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResult(id: number): Promise<QuizResult | undefined>;
}

export class MemStorage implements IStorage {
  private quizzes: Map<number, Quiz>;
  private quizResults: Map<number, QuizResult>;
  private currentQuizId: number;
  private currentResultId: number;

  constructor() {
    this.quizzes = new Map();
    this.quizResults = new Map();
    this.currentQuizId = 1;
    this.currentResultId = 1;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const newQuiz = {
      id,
      topic: quiz.topic,
      questions: quiz.questions as {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }[]
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async saveQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const id = this.currentResultId++;
    const newResult = { ...result, id };
    this.quizResults.set(id, newResult);
    return newResult;
  }

  async getQuizResult(id: number): Promise<QuizResult | undefined> {
    return this.quizResults.get(id);
  }
}

export const storage = new MemStorage();