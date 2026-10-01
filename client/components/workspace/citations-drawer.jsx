"use client";

import * as React from "react";
import { BookOpen, ExternalLink, X, Quote, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CitationsDrawer({ citation, open, onOpenChange }) {
  if (!citation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Quote className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold truncate">
                {citation.sourceTitle || "Source Reference"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                {citation.sourceType && (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {citation.sourceType}
                  </Badge>
                )}
                {citation.page && (
                  <span className="text-xs text-muted-foreground">
                    Page {citation.page}
                  </span>
                )}
              </div>
              <DialogDescription className="sr-only">
                Citation details and grounded document excerpt
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-3 space-y-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs sm:text-sm text-foreground leading-relaxed italic">
            &ldquo;{citation.excerpt || "Exact reference excerpt from indexed chunks."}&rdquo;
          </div>

          {citation.url && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(citation.url, "_blank")}
                className="w-full gap-1.5 text-xs font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Visit Source Webpage</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
