import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Flashcards({ params }: { params: { id: string } }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [, navigate] = useLocation();

  const { data: flashcardSet, isLoading } = useQuery({
    queryKey: ["/api/flashcard-sets", params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Progress value={undefined} />
          <p className="text-center text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!flashcardSet) return null;

  const progress = ((currentCard + 1) / flashcardSet.flashcards.length) * 100;

  const handleNext = () => {
    if (currentCard < flashcardSet.flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    } else {
      navigate(`/quiz/${params.id}`);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-2xl space-y-6">
        <Progress value={progress} className="w-full" />
        
        <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCard}-${flipped}`}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              exit={{ rotateY: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute w-full h-full preserve-3d cursor-pointer"
              onClick={() => setFlipped(!flipped)}
            >
              <Card className={`absolute w-full h-full ${flipped ? 'backface-hidden' : ''}`}>
                <CardContent className="flex items-center justify-center h-full p-6">
                  <p className="text-xl text-center">
                    {flashcardSet.flashcards[currentCard].front}
                  </p>
                </CardContent>
              </Card>
              
              <Card className={`absolute w-full h-full rotate-y-180 ${!flipped ? 'backface-hidden' : ''}`}>
                <CardContent className="flex items-center justify-center h-full p-6">
                  <p className="text-xl text-center">
                    {flashcardSet.flashcards[currentCard].back}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCard === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentCard + 1} / {flashcardSet.flashcards.length}
          </span>
          
          <Button onClick={handleNext}>
            {currentCard === flashcardSet.flashcards.length - 1 ? (
              "Start Quiz"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
