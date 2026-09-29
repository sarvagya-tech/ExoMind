"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Download, BookOpen, Share2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportViewer({ artifact }) {
  const isGenerating =
    artifact?.status === "PENDING" || artifact?.status === "PROCESSING";

  const [copied, setCopied] = React.useState(false);

  let rawMarkdown = "";
  if (typeof artifact?.content === "string") {
    rawMarkdown = artifact.content;
  } else if (artifact?.content?.report) {
    rawMarkdown = artifact.content.report;
  } else if (artifact?.content?.summary) {
    rawMarkdown = artifact.content.summary;
  } else if (artifact?.content?.markdown) {
    rawMarkdown = artifact.content.markdown;
  } else if (artifact?.content?.takeaways) {
    const list = Array.isArray(artifact.content.takeaways)
      ? artifact.content.takeaways
      : [artifact.content.takeaways];
    rawMarkdown = `## Key Takeaways\n\n${list
      .map((t, idx) => `${idx + 1}. ${t}`)
      .join("\n\n")}`;
  } else if (artifact?.content?.items) {
    rawMarkdown = `## Key Highlights\n\n${artifact.content.items
      .map((t, idx) => `${idx + 1}. ${t}`)
      .join("\n\n")}`;
  } else if (artifact?.content) {
    rawMarkdown = JSON.stringify(artifact.content, null, 2);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(artifact?.title || "report")
      .toLowerCase()
      .replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isGenerating && !rawMarkdown) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 animate-pulse">
          <FileText className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Synthesizing study document...
        </p>
        <p className="text-xs text-muted-foreground">
          Generating detailed analysis, structured takeaways, and executive insights.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Synthesized Document
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1 text-xs cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1 text-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .md</span>
          </Button>
        </div>
      </div>

      {/* Rendered Markdown Body */}
      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed rounded-2xl border border-border bg-card/50 p-6 shadow-xs">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {rawMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
