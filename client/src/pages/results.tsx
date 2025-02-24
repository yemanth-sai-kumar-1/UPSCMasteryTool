import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Home, RotateCcw } from "lucide-react";
import type { Quiz, QuizResult } from "@shared/schema";

export default function Results({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();

  const { data: quiz, isLoading: quizLoading } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${params.id}`],
  });

  const { data: result, isLoading: resultLoading } = useQuery<QuizResult>({
    queryKey: [`/api/quiz-results/${params.id}`],
  });

  if (quizLoading || resultLoading || !quiz || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Progress value={undefined} className="w-full max-w-md" />
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Quiz Results</h1>
            <p className="text-muted-foreground">Topic: {quiz.topic}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">
                {result.score} / {result.totalQuestions}
              </p>
              <Progress value={percentage} className="w-full" />
              <p className="text-lg text-muted-foreground">
                You scored {percentage}%
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Detailed Review</h2>
              {result.answers.map((answer, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                    <div className="space-y-2 flex-grow">
                      <p className="font-medium">{quiz.questions[index].question}</p>
                      <p className="text-sm">
                        Your answer: {quiz.questions[index].options[answer.selectedAnswer]}
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-sm text-green-600">
                          Correct answer: {quiz.questions[index].options[quiz.questions[index].correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        {quiz.questions[index].explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                New Topic
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate(`/quiz/${params.id}`)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}