import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  text = text.replace(/```(json|JSON)?\n/g, '').replace(/```/g, '');
  // Remove any leading/trailing whitespace
  text = text.trim();
  return text;
}

export async function generateQuiz(topic: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = PROMPT_TEMPLATE.replace("{topic}", topic);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text before parsing
    const cleanedText = cleanJsonResponse(text);

    try {
      const content = JSON.parse(cleanedText);

      if (!content.questions || !Array.isArray(content.questions)) {
        throw new Error("Invalid response format: missing questions array");
      }

      // Validate each question has the required fields
      content.questions.forEach((q: any, index: number) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 
            || typeof q.correctAnswer !== 'number' || !q.explanation) {
          throw new Error(`Invalid question format at index ${index}`);
        }
      });

      return content;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Cleaned Text:", cleanedText);
      throw new Error("Failed to parse Gemini API response");
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}