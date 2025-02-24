import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API with our key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// This is our prompt template that instructs Gemini how to generate the content
const PROMPT_TEMPLATE = `Create educational content for UPSC exam preparation on the topic: {topic}

Please provide:
1. 10 detailed flashcards with clear front (question) and back (answer) content
2. 5 multiple choice questions with 4 options each

Format the response exactly as a JSON object with this structure:
{
  "flashcards": [
    { "front": "question", "back": "detailed answer" }
  ],
  "mcqs": [
    { 
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0 // index of correct option
    }
  ]
}`;

export async function generateContent(topic: string) {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate the prompt by replacing the topic placeholder
    const prompt = PROMPT_TEMPLATE.replace("{topic}", topic);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const content = JSON.parse(text);

    // Validate the response structure
    if (!content.flashcards || !content.mcqs) {
      throw new Error("Invalid response format from Gemini API");
    }

    return content;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
