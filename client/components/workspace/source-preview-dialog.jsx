"use client";

import * as React from "react";
import {
  FileText,
  Globe,
  Video,
  FileCode,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";

export function SourcePreviewDialog({ source, open, onOpenChange }) {
  const [copied, setCopied] = React.useState(false);

  if (!source) return null;

  const handleCopy = () => {
    if (source.content) {
      navigator.clipboard.writeText(source.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "WEBSITE":
        return <Globe className="h-5 w-5 text-emerald-500" />;
      case "YOUTUBE":
        return <Video className="h-5 w-5 text-red-500" />;
      default:
        return <FileCode className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                {getSourceIcon(source.type)}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold truncate">
                  {source.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {source.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Added {formatDate(source.createdAt)}
                  </span>
                  {source.metadata?.pageCount && (
                    <span className="text-xs text-muted-foreground">
                      • {source.metadata.pageCount} pages
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {source.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(source.url, "_blank")}
                  className="h-8 gap-1 text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open Link</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <ScrollArea className="flex-1 my-3 pr-2">
          <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Extracted Source Content
            </div>
            <pre className="text-xs sm:text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {source.content || "No text content available for this source."}
            </pre>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
