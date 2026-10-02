"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  User,
  Copy,
  Check,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatMessage({ message, onCitationClick }) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role?.toUpperCase() === "USER";

  const contentText =
    typeof message.content === "string"
      ? message.content
      : message.content
        ? JSON.stringify(message.content)
        : "";

  const citationsList = React.useMemo(() => {
    if (Array.isArray(message.citations)) return message.citations;
    if (typeof message.citations === "string") {
      try {
        const parsed = JSON.parse(message.citations);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [message.citations]);

  const formattedTime = React.useMemo(() => {
    if (!message.createdAt) return "";
    try {
      const d = new Date(message.createdAt);
      return isNaN(d.getTime())
        ? ""
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [message.createdAt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex w-full gap-3 py-2 transition-colors ${isUser ? "justify-end" : "justify-start"
        }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs mt-1">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`group relative max-w-[88%] text-sm leading-relaxed ${isUser
            ? "bg-muted text-foreground px-4 py-2.5 rounded-3xl"
            : "flex-1 px-1 py-1 text-foreground"
          }`}
      >
        {/* Text */}
        {isUser ? (
          <p className="whitespace-pre-wrap">{contentText}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:leading-relaxed prose-pre:p-3 prose-pre:bg-muted/70 prose-pre:rounded-2xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contentText}
            </ReactMarkdown>
          </div>
        )}

        {/* Citations Chips for Assistant */}
        {!isUser && citationsList.length > 0 && (
          <div className="mt-3 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {citationsList.map((citation, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onCitationClick?.(citation)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-xs text-foreground transition-all hover:bg-muted hover:border-primary/40 text-left cursor-pointer"
                >
                  <span className="font-semibold font-mono text-[10px] text-primary">[{i + 1}]</span>
                  <span className="max-w-[140px] sm:max-w-[200px] truncate font-medium">
                    {citation.sourceTitle || "Source Document"}
                  </span>
                  {citation.page && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      p.{citation.page}
                    </span>
                  )}
                  {citation.chunkIndex !== undefined && (
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      #chunk {Number(citation.chunkIndex) + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Copy for Assistant */}
        {!isUser && (
          <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-muted-foreground font-mono">
              {formattedTime}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full"
              title="Copy"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-xl bg-muted text-muted-foreground mt-1">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
