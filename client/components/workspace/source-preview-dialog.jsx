"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Globe,
  Video,
  FileCode,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  BookOpen,
  Code,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export function SourcePreviewDialog({ source, open, onOpenChange }) {
  const [copied, setCopied] = React.useState(false);
  const [copiedChunks, setCopiedChunks] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("markdown");
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);

  const content = source?.content || "";
  const metadata = source?.metadata || {};

  // Extract chunks from metadata or synthesize on the fly (unconditionally called)
  const chunks = React.useMemo(() => {
    if (!source) return [];

    if (Array.isArray(metadata.chunks) && metadata.chunks.length > 0) {
      return metadata.chunks;
    }

    if (Array.isArray(source.chunks) && source.chunks.length > 0) {
      return source.chunks;
    }

    // Split content into clean chunks if not already stored
    if (content) {
      const parts = content.split(/---|\n\n## Page \d+/).filter((p) => p.trim());
      if (parts.length > 0) {
        return parts.map((part, idx) => ({
          id: `chk_${source.id?.slice(-6) || "idx"}_${idx}`,
          index: idx,
          content: part.trim(),
          tokenCount: Math.ceil(part.trim().length / 4),
          metadata: { page: idx + 1 },
        }));
      }
    }

    return [];
  }, [source, metadata, content]);

  // Clean up audio playback on unmount (unconditionally called)
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!source) return null;

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyChunksJson = () => {
    navigator.clipboard.writeText(JSON.stringify(chunks, null, 2));
    setCopiedChunks(true);
    setTimeout(() => setCopiedChunks(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(source.title || "source").toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Text-to-Speech
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeechText = content
      .replace(/[#*`_~\[\]()>-]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 3000)
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col font-mono p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                {getSourceIcon(source.type)}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold truncate">
                  {source.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {source.type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    Added {formatDate(source.createdAt)}
                  </span>
                  {metadata.pageCount && (
                    <span className="text-[11px] text-muted-foreground">
                      • {metadata.pageCount} pages
                    </span>
                  )}
                  {chunks.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Layers className="h-2.5 w-2.5 text-primary" /> {chunks.length} chunks
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {source.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(source.url, "_blank")}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Link</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleSpeech}
                className={`h-8 w-8 rounded-full ${
                  isPlayingAudio ? "text-primary bg-primary/10 animate-pulse" : "text-muted-foreground"
                }`}
                title={isPlayingAudio ? "Stop Reading" : "Read Aloud"}
              >
                {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1 text-xs cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadMarkdown}
                className="h-8 gap-1 text-xs cursor-pointer"
                title="Download Markdown (.md)"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">.md</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Multi-Tab Source Viewer */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 mt-2">
          <div className="flex items-center justify-between pb-2">
            <TabsList className="h-8">
              <TabsTrigger value="markdown" className="text-xs gap-1.5 px-3">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                <span>Formatted Markdown</span>
              </TabsTrigger>
              <TabsTrigger value="chunks" className="text-xs gap-1.5 px-3">
                <Layers className="h-3.5 w-3.5 text-purple-500" />
                <span>Vector Chunks ({chunks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs gap-1.5 px-3">
                <Code className="h-3.5 w-3.5 text-emerald-500" />
                <span>Raw Text</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === "chunks" && (
              <button
                onClick={handleCopyChunksJson}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                {copiedChunks ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copiedChunks ? "JSON Copied" : "Copy Chunks JSON"}</span>
              </button>
            )}
          </div>

          {/* TAB 1: RENDERED MARKDOWN VIEW */}
          <TabsContent value="markdown" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-[55vh] pr-3">
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed rounded-2xl border border-border bg-card/60 p-5 shadow-2xs">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No text content available for this source.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* TAB 2: VECTOR CHUNKS INSPECTOR */}
          <TabsContent value="chunks" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-[55vh] pr-3">
              {chunks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-6">
                  <Layers className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground">No chunks available yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Chunks will appear once embedding synthesis completes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chunks.map((chk, idx) => (
                    <div
                      key={chk.id || idx}
                      className="rounded-xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs transition-all hover:border-primary/40"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-foreground text-xs font-mono">
                            Chunk ID: {chk.id || `chunk-${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                          {chk.metadata?.page && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                              Page {chk.metadata.page}
                            </Badge>
                          )}
                          <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            ~{chk.tokenCount || Math.ceil((chk.content?.length || 0) / 4)} tokens
                          </span>
                          <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {chk.content?.length || 0} chars
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3 text-xs text-foreground font-sans leading-relaxed border border-border/40 whitespace-pre-wrap">
                        {chk.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* TAB 3: RAW TEXT VIEW */}
          <TabsContent value="raw" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-[55vh] pr-3">
              <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed select-text">
                  {content || "No raw text available."}
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
