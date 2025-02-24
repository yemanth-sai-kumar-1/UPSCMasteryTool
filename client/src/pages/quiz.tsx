import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz } from "@shared/schema";

export default function Quiz({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    answer: number;
    isCorrect: boolean;
  }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [, navigate] = useLocation();

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${params.id}`],
  });

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Progress value={undefined} className="w-full max-w-md" />
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const currentQ = quiz.questions[currentQuestion];

  const handleAnswer = async (selectedOption: string) => {
    const selected = parseInt(selectedOption);
    const isCorrect = selected === currentQ.correctAnswer;

    setSelectedAnswers([...selectedAnswers, { answer: selected, isCorrect }]);
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final score
      const score = selectedAnswers.filter(a => a.isCorrect).length;

      // Save result
      await apiRequest("POST", "/api/quiz-results", {
        quizId: parseInt(params.id),
        score,
        totalQuestions: quiz.questions.length,
        answers: selectedAnswers.map((ans, idx) => ({
          questionIndex: idx,
          selectedAnswer: ans.answer,
          isCorrect: ans.isCorrect
        }))
      });

      // Navigate to results
      navigate(`/results/${params.id}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Progress value={progress} className="w-full" />

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </h2>
            <p className="text-sm text-muted-foreground">Topic: {quiz.topic}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{currentQ.question}</p>

            <RadioGroup
              onValueChange={handleAnswer}
              className="space-y-4"
              disabled={showExplanation}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>

            {showExplanation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Explanation:</h3>
                <p>{currentQ.explanation}</p>
                <Button 
                  onClick={handleNext} 
                  className="mt-4"
                >
                  {currentQuestion === quiz.questions.length - 1 ? 
                    "See Results" : "Next Question"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}