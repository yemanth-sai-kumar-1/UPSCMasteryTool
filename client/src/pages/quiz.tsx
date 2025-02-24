import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import type { FlashcardSet } from "@shared/schema";

export default function Quiz({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [, navigate] = useLocation();

  const { data: flashcardSet, isLoading } = useQuery<FlashcardSet>({
    queryKey: [`/api/flashcard-sets/${params.id}`],
  });

  if (isLoading || !flashcardSet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Progress value={undefined} className="w-full max-w-md" />
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / flashcardSet.mcqs.length) * 100;
  const currentMcq = flashcardSet.mcqs[currentQuestion];

  const handleAnswer = async (selectedOption: string) => {
    const selected = parseInt(selectedOption);
    const newAnswers = [...selectedAnswers, selected];
    setSelectedAnswers(newAnswers);

    if (currentQuestion < flashcardSet.mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correctAnswers = flashcardSet.mcqs.reduce((score, mcq, index) => {
        return score + (newAnswers[index] === mcq.correctAnswer ? 1 : 0);
      }, 0);

      // Save result
      await apiRequest("POST", "/api/quiz-results", {
        setId: parseInt(params.id),
        score: correctAnswers,
        totalQuestions: flashcardSet.mcqs.length,
      });

      // Navigate to results
      navigate(`/results/${params.id}?score=${correctAnswers}&total=${flashcardSet.mcqs.length}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Progress value={progress} className="w-full" />

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Question {currentQuestion + 1} of {flashcardSet.mcqs.length}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{currentMcq.question}</p>

            <RadioGroup
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {currentMcq.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}