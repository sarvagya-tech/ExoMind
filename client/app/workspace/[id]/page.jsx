"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SourcesPanel } from "@/components/workspace/sources-panel";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { ArtifactsPanel } from "@/components/workspace/artifacts-panel";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspaces";
import { useSources } from "@/hooks/use-sources";

export default function WorkspaceStudioPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.id;

  const { data: workspace, isLoading: wsLoading, isError } = useWorkspace(workspaceId);
  const { data: sources = [] } = useSources(workspaceId);

  // Selected source IDs for RAG context
  const [selectedSourceIds, setSelectedSourceIds] = React.useState([]);

  // Drawer / Side Panel Toggles (On-demand opening)
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [studioOpen, setStudioOpen] = React.useState(false);

  // Automatically select all sources on initial load if none selected
  React.useEffect(() => {
    if (sources.length > 0 && selectedSourceIds.length === 0) {
      setSelectedSourceIds(sources.map((s) => s.id));
    }
  }, [sources, selectedSourceIds.length]);

  if (wsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-mono">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Sparkles className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm font-medium">Opening Notebook Studio...</p>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-mono p-4">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm rounded-2xl border border-border p-6 bg-card">
          <p className="text-base font-semibold text-foreground">Notebook Not Found</p>
          <p className="text-xs text-muted-foreground">
            The notebook you are looking for does not exist or has been removed.
          </p>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 bg-primary text-primary-foreground mt-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background font-mono relative">
      {/* Persistent / Collapsible Sidebar */}
      <Sidebar
        currentWorkspace={workspace}
        activeSection="chat"
        sourcesOpen={sourcesOpen}
        onToggleSources={() => setSourcesOpen(!sourcesOpen)}
        studioOpen={studioOpen}
        onToggleStudio={() => setStudioOpen(!studioOpen)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Control Bar */}
        <div className="border-b border-border bg-card/40 backdrop-blur-md px-4 sm:px-6 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {/* Left: Sources Trigger Button */}
            <Button
              variant={sourcesOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="gap-2 text-xs font-medium h-8"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Sources</span>
              <span className="rounded-full bg-muted/60 px-1.5 py-0.2 text-[10px] font-mono">
                {selectedSourceIds.length}/{sources.length}
              </span>
            </Button>

            {/* Center: Notebook info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium truncate px-2">
              <span className="text-base">{workspace.icon || "📓"}</span>
              <span className="text-foreground font-semibold truncate">{workspace.title}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline uppercase text-[10px]">{workspace.defaultmodel}</span>
            </div>

            {/* Right: Studio Trigger Button */}
            <Button
              variant={studioOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setStudioOpen(!studioOpen)}
              className="gap-2 text-xs font-medium h-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>Studio & Tools</span>
            </Button>
          </div>
        </div>

        {/* Main Workspace Area - Center Oriented */}
        <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full px-3 sm:px-6 py-3 relative gap-4">
          {/* Left: On-Demand Sources Drawer / Panel */}
          {sourcesOpen && (
            <>
              {/* Backdrop for mobile */}
              <div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setSourcesOpen(false)}
              />

              {/* Slide-out / Expanded Sources Container */}
              <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-card border-r border-border p-0 shadow-2xl lg:static lg:z-auto lg:h-full lg:rounded-2xl lg:border lg:shadow-xs transition-all duration-200 animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between p-3 border-b border-border lg:hidden">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Sources
                  </span>
                  <button
                    onClick={() => setSourcesOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-full overflow-hidden">
                  <SourcesPanel
                    workspaceId={workspaceId}
                    selectedSourceIds={selectedSourceIds}
                    onSelectionChange={setSelectedSourceIds}
                  />
                </div>
              </div>
            </>
          )}

          {/* Center: Expansive Open & Borderless Chat Section */}
          <div className="flex-1 h-full min-w-0 flex flex-col overflow-hidden">
            <ChatPanel
              workspaceId={workspaceId}
              selectedSourceIds={selectedSourceIds}
              defaultModel={workspace.defaultmodel}
            />
          </div>

          {/* Right: On-Demand Studio Drawer / Panel */}
          {studioOpen && (
            <>
              {/* Backdrop for mobile */}
              <div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setStudioOpen(false)}
              />

              {/* Slide-out / Expanded Studio Container */}
              <div className="fixed inset-y-0 right-0 z-50 w-88 max-w-[85vw] bg-card border-l border-border p-0 shadow-2xl lg:static lg:z-auto lg:h-full lg:rounded-2xl lg:border lg:shadow-xs transition-all duration-200 animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between p-3 border-b border-border lg:hidden">
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Studio
                  </span>
                  <button
                    onClick={() => setStudioOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-full overflow-hidden">
                  <ArtifactsPanel
                    workspaceId={workspaceId}
                    selectedSourceIds={selectedSourceIds}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
