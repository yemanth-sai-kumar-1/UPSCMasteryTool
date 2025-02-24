import { flashcardSets, quizResults, type FlashcardSet, type InsertFlashcardSet, type QuizResult, type InsertQuizResult } from "@shared/schema";

export interface IStorage {
  createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet>;
  getFlashcardSet(id: number): Promise<FlashcardSet | undefined>;
  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
}

export class MemStorage implements IStorage {
  private flashcardSets: Map<number, FlashcardSet>;
  private quizResults: Map<number, QuizResult>;
  private currentSetId: number;
  private currentResultId: number;

  constructor() {
    this.flashcardSets = new Map();
    this.quizResults = new Map();
    this.currentSetId = 1;
    this.currentResultId = 1;
  }

  async createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet> {
    const id = this.currentSetId++;
    const newSet = {
      id,
      topic: set.topic,
      flashcards: set.flashcards as { front: string; back: string; }[],
      mcqs: set.mcqs as { question: string; options: string[]; correctAnswer: number; }[]
    };
    this.flashcardSets.set(id, newSet);
    return newSet;
  }

  async getFlashcardSet(id: number): Promise<FlashcardSet | undefined> {
    return this.flashcardSets.get(id);
  }

  async saveQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const id = this.currentResultId++;
    const newResult: QuizResult = { ...result, id };
    this.quizResults.set(id, newResult);
    return newResult;
  }
}

export const storage = new MemStorage();