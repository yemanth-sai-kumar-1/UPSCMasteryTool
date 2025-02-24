import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PROMPT_TEMPLATE = `Create a comprehensive quiz for UPSC exam preparation on the topic: {topic}

Please generate 15 multiple choice questions with:
1. Clear, detailed questions
2. 4 options per question
3. The correct answer (as an index 0-3)
4. A detailed explanation of why the answer is correct

Format the response exactly as a JSON object with this structure:
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

export async function generateQuiz(topic: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = PROMPT_TEMPLATE.replace("{topic}", topic);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const content = JSON.parse(text);

    if (!content.questions || !Array.isArray(content.questions)) {
      throw new Error("Invalid response format from Gemini API");
    }

    return content;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}