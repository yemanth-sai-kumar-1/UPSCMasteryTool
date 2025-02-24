import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertQuizSchema, insertQuizResultSchema } from "@shared/schema";
import { generateQuiz } from "./gemini";

export async function registerRoutes(app: Express) {
  app.post("/api/quizzes", async (req, res) => {
    try {
      const topic = req.body.topic;

      // Generate quiz using Gemini
      const response = await generateQuiz(topic);

      const quiz = await storage.createQuiz({
        topic,
        questions: response.questions,
      });

      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const quiz = await storage.getQuiz(id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  });

  app.post("/api/flashcard-sets", async (req, res) => {
    try {
      const topic = req.body.topic;
      // Generate flashcards and MCQs using Gemini
      const response = await generateContent(topic);
      const flashcardSet = await storage.createFlashcardSet({
        topic,
        flashcards: response.flashcards,
        mcqs: response.mcqs,
      });
      res.json(flashcardSet);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate flashcards" });
    }
  });

  app.get("/api/flashcard-sets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const set = await storage.getFlashcardSet(id);

    if (!set) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    res.json(set);
  });

  app.post("/api/quiz-results", async (req, res) => {
    try {
      const result = insertQuizResultSchema.parse(req.body);
      const savedResult = await storage.saveQuizResult(result);
      res.json(savedResult);
    } catch (error) {
      res.status(400).json({ message: "Invalid quiz result data" });
    }
  });

  app.get("/api/quiz-results/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.getQuizResult(id);

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    res.json(result);
  });

  return createServer(app);
}