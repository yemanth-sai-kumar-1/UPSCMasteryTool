import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleCheck, Home } from "lucide-react";

export default function Results() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const score = parseInt(params.get("score") || "0");
  const total = parseInt(params.get("total") || "0");
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CircleCheck className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold">Quiz Completed!</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">
              {score} / {total}
            </p>
            <p className="text-lg text-muted-foreground">
              You scored {percentage}%
            </p>
          </div>

          <div className="pt-6 border-t space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Start New Topic
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
