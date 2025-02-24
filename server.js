const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public')); // Serve static files from public directory

// In-Memory Storage
const quizzes = new Map();
const quizResults = new Map();
let currentQuizId = 1;
let currentResultId = 1;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT_TEMPLATE = `Create a comprehensive quiz for UPSC exam preparation on the topic: {topic}
Generate 15 multiple choice questions, returning ONLY the JSON data without any markdown formatting or backticks. The response should be exactly in this format:
{
  "questions": [
    {
      "question": "detailed question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "detailed explanation of why this answer is correct"
    }
  ]
}`;

function cleanJsonResponse(text) {
  text = text.replace(/```(json|JSON)?\n/g, '').replace(/```/g, '');
  return text.trim();
}

async function generateQuiz(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = PROMPT_TEMPLATE.replace("{topic}", topic);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = cleanJsonResponse(text);
    let content;
    try {
      content = JSON.parse(cleanedText);
      if (!content.questions || !Array.isArray(content.questions)) {
        throw new Error("Invalid response format: missing questions array");
      }
      content.questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 
            || typeof q.correctAnswer !== 'number' || !q.explanation) {
          throw new Error(`Invalid question format at index ${index}`);
        }
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Cleaned Text:", cleanedText);
      throw new Error("Failed to parse Gemini API response");
    }
    return content;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}

// API Routes
app.post('/api/quizzes', async (req, res) => {
  try {
    const topic = req.body.topic;
    const generatedQuiz = await generateQuiz(topic);
    const quiz = {
      id: currentQuizId++,
      topic,
      questions: generatedQuiz.questions
    };
    quizzes.set(quiz.id, quiz);
    res.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
});

app.get('/api/quizzes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quiz = quizzes.get(id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  res.json(quiz);
});

app.post('/api/quiz-results', (req, res) => {
  try {
    const result = {
      id: currentResultId++,
      quizId: req.body.quizId,
      score: req.body.score,
      totalQuestions: req.body.totalQuestions,
      answers: req.body.answers
    };
    quizResults.set(result.id, result);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: "Invalid quiz result data" });
  }
});

app.get('/api/quiz-results/:quizId', (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const result = Array.from(quizResults.values()).find(r => r.quizId === quizId);
  if (!result) {
    return res.status(404).json({ message: "Quiz result not found" });
  }
  res.json(result);
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});