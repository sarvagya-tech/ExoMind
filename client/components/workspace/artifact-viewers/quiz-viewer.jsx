"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function QuizViewer({ artifact }) {
  const isGenerating =
    artifact?.status === "PENDING" || artifact?.status === "PROCESSING";

  const rawQuiz =
    artifact?.content?.quiz ||
    artifact?.content?.questions ||
    (Array.isArray(artifact?.content) ? artifact?.content : []);

  const quizQuestions = React.useMemo(() => {
    return rawQuiz.map((q) => {
      let correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : 0;
      if (typeof q.answer === "string") {
        const charCode = q.answer.trim().toUpperCase().charCodeAt(0) - 65;
        if (charCode >= 0 && charCode < (q.options?.length || 4)) {
          correctIdx = charCode;
        }
      }
      return {
        question: q.question || q.prompt || "Question",
        options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: correctIdx,
        explanation: q.explanation || q.rationale || "Based on the uploaded source material.",
      };
    });
  }, [rawQuiz]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState({});
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Reset if artifact changes
  React.useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  }, [artifact?.id]);

  if (isGenerating && quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 animate-pulse">
          <HelpCircle className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Generating multiple-choice quiz questions...
        </p>
        <p className="text-xs text-muted-foreground">
          Creating knowledge checks, answer keys, and pedagogical explanations.
        </p>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No quiz questions found in this artifact.
      </div>
    );
  }

  const currentQ = quizQuestions[currentIndex] || quizQuestions[0];
  const selectedOption = selectedAnswers[currentIndex];
  const isAnswered = selectedOption !== undefined;

  const handleSelectOption = (index) => {
    if (isAnswered) return;

    const newAnswers = { ...selectedAnswers, [currentIndex]: index };
    setSelectedAnswers(newAnswers);

    // If last question answered, show celebration
    if (Object.keys(newAnswers).length === quizQuestions.length) {
      setTimeout(() => {
        setIsCompleted(true);
        triggerConfetti();
      }, 700);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  const correctCount = Object.entries(selectedAnswers).reduce(
    (count, [qIdx, ansIdx]) =>
      ansIdx === quizQuestions[qIdx]?.correctIndex ? count + 1 : count,
    0
  );

  const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 px-4 max-w-md mx-auto animate-in zoom-in-95 duration-200">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Quiz Completed!</h3>
          <p className="text-xs text-muted-foreground mt-1">
            You answered {correctCount} out of {quizQuestions.length} questions correctly.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Accuracy Score</span>
            <span className={scorePercentage >= 70 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
              {scorePercentage}%
            </span>
          </div>
          <Progress value={scorePercentage} max={100} className="h-2 w-full" />
        </div>

        <Button
          onClick={handleReset}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" /> Retake Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full max-w-lg mx-auto p-2">
      {/* Header & Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          Question {currentIndex + 1} of {quizQuestions.length}
        </span>
        <Badge variant="outline" className="text-[10px]">
          Score: {correctCount} / {Object.keys(selectedAnswers).length}
        </Badge>
      </div>

      <Progress
        value={((currentIndex + 1) / quizQuestions.length) * 100}
        max={100}
        className="h-1.5 w-full"
      />

      {/* Question Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">
          {currentQ.question}
        </p>

        {/* Options List */}
        <div className="space-y-2 pt-1">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrect = currentQ.correctIndex === optIdx;

            let optionStyle =
              "border-border bg-background hover:bg-muted/50 hover:border-border/90 cursor-pointer";
            if (isAnswered) {
              if (isCorrect) {
                optionStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
              } else if (isSelected) {
                optionStyle = "border-destructive/50 bg-destructive/10 text-destructive font-semibold";
              } else {
                optionStyle = "opacity-50 border-border bg-background cursor-not-allowed";
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                disabled={isAnswered}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-xs sm:text-sm text-left transition-all ${optionStyle}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/80 text-[11px] font-mono font-medium">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    {isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {isAnswered && currentQ.explanation && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-foreground leading-relaxed animate-in fade-in duration-200">
            <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Explanation:
            </span>
            {currentQ.explanation}
          </div>
        )}
      </div>

      {/* Next Question Navigation */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="text-xs h-8 cursor-pointer"
        >
          Previous
        </Button>

        {isAnswered && currentIndex < quizQuestions.length - 1 && (
          <Button
            size="sm"
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="text-xs h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Next Question <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
