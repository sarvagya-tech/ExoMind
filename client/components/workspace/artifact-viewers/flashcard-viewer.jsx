"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function FlashcardViewer({ artifact }) {
  const flashcards = artifact?.content?.flashcards || [];

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [masteredIndices, setMasteredIndices] = React.useState(new Set());
  const [showHint, setShowHint] = React.useState(false);

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No flashcards generated yet.
      </div>
    );
  }

  const currentCard = flashcards[currentIndex] || flashcards[0];
  const isMastered = masteredIndices.has(currentIndex);

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleMastery = () => {
    setMasteredIndices((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-lg mx-auto p-2">
      {/* Progress & Header */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-[10px]">
            {masteredIndices.size} Mastered
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {flashcards.length - masteredIndices.size} Remaining
          </Badge>
        </div>
      </div>

      <Progress value={currentIndex + 1} max={flashcards.length} className="h-1.5" />

      {/* 3D Flip Card Container */}
      <div
        className="w-full h-72 cursor-pointer perspective-1000 select-none group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full rounded-2xl border border-border bg-card p-6 shadow-md transition-transform duration-500 transform-style-3d flex flex-col justify-between ${
            isFlipped ? "rotate-y-180 bg-muted/30" : "hover:border-purple-500/50"
          }`}
        >
          {/* Front Side */}
          <div className="flex flex-col justify-between h-full backface-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Question / Concept
              </span>
              {isMastered && (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              )}
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-snug">
                {currentCard.front}
              </p>
              {currentCard.hint && showHint && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 italic animate-in fade-in">
                  💡 Hint: {currentCard.hint}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
              {currentCard.hint ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="hover:text-amber-500 transition-colors flex items-center gap-1"
                >
                  <Lightbulb className="h-3 w-3" />
                  <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
                </button>
              ) : (
                <span />
              )}
              <span className="flex items-center gap-1">
                <RotateCw className="h-3 w-3" /> Click to flip
              </span>
            </div>
          </div>

          {/* Back Side (Answer) */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden rotate-y-180 bg-card rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verified Answer
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Card {currentIndex + 1}
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-[11px] text-muted-foreground pt-2 border-t border-border/50">
              Click to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between w-full pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          className="gap-1 text-xs h-8"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant={isMastered ? "secondary" : "outline"}
            size="sm"
            onClick={toggleMastery}
            className={`gap-1.5 text-xs h-8 ${
              isMastered
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : ""
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{isMastered ? "Mastered" : "Mark Mastered"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFlipped(!isFlipped)}
            title="Flip Card"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="gap-1 text-xs h-8"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
