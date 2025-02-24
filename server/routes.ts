import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertFlashcardSetSchema, insertQuizResultSchema } from "@shared/schema";
import { generateContent } from "./gemini";

export async function registerRoutes(app: Express) {
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

  return createServer(app);
}
