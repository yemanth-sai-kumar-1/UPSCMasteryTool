type FlashcardResponse = {
  flashcards: { front: string; back: string }[];
  mcqs: { question: string; options: string[]; correctAnswer: number }[];
};

export async function generateContent(topic: string): Promise<FlashcardResponse> {
  // This would be replaced with actual Gemini API integration
  // For now returning mock data
  return {
    flashcards: [
      {
        front: "What is UPSC?",
        back: "Union Public Service Commission - India's central recruiting agency"
      },
      {
        front: "When was UPSC established?",
        back: "1926 under British rule, later given constitutional status in 1950"
      }
    ],
    mcqs: [
      {
        question: "Which Article of Indian Constitution deals with UPSC?",
        options: ["Article 315", "Article 320", "Article 324", "Article 330"],
        correctAnswer: 0
      }
    ]
  };
}
