"use client";

import * as React from "react";
import {
  Sparkles,
  FileText,
  ListChecks,
  Layers,
  HelpCircle,
  Network,
  BookOpen,
  Trash2,
  Eye,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ARTIFACT_DEFINITIONS } from "@/lib/constants";
import { FlashcardViewer } from "@/components/workspace/artifact-viewers/flashcard-viewer";
import { QuizViewer } from "@/components/workspace/artifact-viewers/quiz-viewer";
import { MindmapViewer } from "@/components/workspace/artifact-viewers/mindmap-viewer";
import { ReportViewer } from "@/components/workspace/artifact-viewers/report-viewer";
import {
  useArtifacts,
  useCreateArtifact,
  useDeleteArtifact,
} from "@/hooks/use-artifacts";

export function ArtifactsPanel({ workspaceId, selectedSourceIds }) {
  const { data: artifacts = [], isLoading } = useArtifacts(workspaceId);
  const createArtifact = useCreateArtifact(workspaceId);
  const deleteArtifact = useDeleteArtifact(workspaceId);

  const [activeArtifact, setActiveArtifact] = React.useState(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const handleGenerate = (type) => {
    createArtifact.mutate(
      {
        type,
        sourceIds: selectedSourceIds,
      },
      {
        onSuccess: (newArt) => {
          setActiveArtifact(newArt);
          setViewerOpen(true);
        },
      }
    );
  };

  const openViewer = (artifact) => {
    setActiveArtifact(artifact);
    setViewerOpen(true);
  };

  const getArtifactIcon = (type) => {
    switch (type) {
      case "SUMMARY":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "TAKEAWAYS":
        return <ListChecks className="h-4 w-4 text-emerald-500" />;
      case "FLASHCARDS":
        return <Layers className="h-4 w-4 text-purple-500" />;
      case "QUIZ":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      case "MINDMAP":
        return <Network className="h-4 w-4 text-rose-500" />;
      case "REPORT":
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  const renderArtifactContent = (artifact) => {
    if (!artifact) return null;
    switch (artifact.type) {
      case "FLASHCARDS":
        return <FlashcardViewer artifact={artifact} />;
      case "QUIZ":
        return <QuizViewer artifact={artifact} />;
      case "MINDMAP":
        return <MindmapViewer artifact={artifact} />;
      default:
        return <ReportViewer artifact={artifact} />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border p-3 px-4 bg-muted/20">
        <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Studio
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">
          {artifacts.length} created
        </span>
      </div>

      <ScrollArea className="flex-1 p-3 space-y-4">
        {/* Compact Quick Generation Grid */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">
            Create Tools
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            {ARTIFACT_DEFINITIONS.map((def) => {
              const isGenerating =
                createArtifact.isPending &&
                createArtifact.variables?.type === def.type;

              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => handleGenerate(def.type)}
                  disabled={createArtifact.isPending}
                  className="group flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 p-2 text-left transition-all hover:border-primary/40 hover:bg-card active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${def.bgColor} ${def.color}`}>
                    {getArtifactIcon(def.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {def.title.replace("Executive ", "").replace("Study ", "").replace("Interactive ", "")}
                    </p>
                    {isGenerating ? (
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold animate-pulse">
                        Creating...
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground truncate block">
                        Generate
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Artifacts List */}
        <div className="space-y-1.5 pt-3 border-t border-border/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">
            Artifacts
          </span>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 animate-pulse mb-1" />
              Loading...
            </div>
          ) : artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center rounded-xl border border-dashed border-border/70 p-3">
              <Layers className="h-5 w-5 text-muted-foreground/40 mb-1" />
              <p className="text-[11px] text-muted-foreground">
                No artifacts created yet
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {artifacts.map((art) => (
                <div
                  key={art.id}
                  onClick={() => openViewer(art)}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 p-2 text-xs transition-all hover:border-primary/30 hover:bg-card cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                      {getArtifactIcon(art.type)}
                    </div>
                    <span className="font-medium text-foreground truncate text-xs">
                      {art.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewer(art);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${art.title}"?`)) {
                          deleteArtifact.mutate(art.id);
                        }
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Artifact Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted border border-border">
                {activeArtifact && getArtifactIcon(activeArtifact.type)}
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {activeArtifact?.title || "Artifact Viewer"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Generated from selected notebook sources.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-3">
            {renderArtifactContent(activeArtifact)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
