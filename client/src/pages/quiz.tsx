import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz } from "@shared/schema";
import { Check } from "lucide-react";

export default function Quiz({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    answer: number;
    isCorrect: boolean;
  }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<number | undefined>();
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

  const handleAnswer = (selected: number) => {
    if (showExplanation) return;

    setCurrentSelection(selected);
    const isCorrect = selected === currentQ.correctAnswer;

    setSelectedAnswers([...selectedAnswers, { answer: selected, isCorrect }]);
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    setCurrentSelection(undefined);
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const score = selectedAnswers.filter(a => a.isCorrect).length;

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

      navigate(`/results/${params.id}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-4 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Topic: {quiz.topic}</p>
              <h2 className="text-2xl font-semibold leading-tight text-foreground">
                {currentQ.question}
              </h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid gap-4">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showExplanation}
                  className={`
                    w-full p-4 text-left rounded-lg transition-all duration-200
                    border-2 relative overflow-hidden group
                    ${currentSelection === index 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }
                    ${showExplanation ? 'cursor-default' : 'cursor-pointer'}
                    disabled:opacity-70
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex items-center justify-center w-6 h-6 rounded-full shrink-0
                      border-2 transition-colors
                      ${currentSelection === index 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 group-hover:border-primary/50'
                      }
                    `}>
                      {currentSelection === index && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-base font-medium">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-8 rounded-lg bg-blue-50 border border-blue-100">
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-blue-900">Explanation</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <Button 
                    onClick={handleNext} 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {currentQuestion === quiz.questions.length - 1 ? 
                      "See Results" : "Next Question"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}