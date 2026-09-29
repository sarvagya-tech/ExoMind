"use client";

import * as React from "react";
import {
  FileText,
  Globe,
  Video,
  FileCode,
  Plus,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddSourceDialog } from "@/components/workspace/add-source-dialog";
import { SourcePreviewDialog } from "@/components/workspace/source-preview-dialog";
import { useSources, useDeleteSource, useBulkDeleteSources } from "@/hooks/use-sources";

export function SourcesPanel({
  workspaceId,
  selectedSourceIds,
  onSelectionChange,
}) {
  const { data: sources = [], isLoading } = useSources(workspaceId);
  const deleteSource = useDeleteSource(workspaceId);
  const bulkDeleteSources = useBulkDeleteSources(workspaceId);

  const [addSourceOpen, setAddSourceOpen] = React.useState(false);
  const [previewSource, setPreviewSource] = React.useState(null);
  const [search, setSearch] = React.useState("");

  const filteredSources = sources.filter((s) =>
    (s.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const allSelected =
    sources.length > 0 && selectedSourceIds.length === sources.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sources.map((s) => s.id));
    }
  };

  const toggleSourceSelection = (sourceId) => {
    if (selectedSourceIds.includes(sourceId)) {
      onSelectionChange(selectedSourceIds.filter((id) => id !== sourceId));
    } else {
      onSelectionChange([...selectedSourceIds, sourceId]);
    }
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
      case "WEBSITE":
        return <Globe className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "YOUTUBE":
        return <Video className="h-4 w-4 text-red-500 shrink-0" />;
      default:
        return <FileCode className="h-4 w-4 text-purple-500 shrink-0" />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border p-2.5 px-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
            Sources
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {selectedSourceIds.length}/{sources.length}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => setAddSourceOpen(true)}
          className="h-7 px-2.5 gap-1 text-xs bg-primary text-primary-foreground font-medium"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </Button>
      </div>

      {/* Search & Select All */}
      <div className="p-2.5 border-b border-border/60 space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 text-xs bg-card"
          />
        </div>

        {sources.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1 hover:text-foreground font-medium cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="h-3 w-3 text-primary" />
              ) : (
                <Square className="h-3 w-3" />
              )}
              <span>{allSelected ? "Deselect" : "Select all"}</span>
            </button>

            {selectedSourceIds.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${selectedSourceIds.length} source(s)?`)) {
                    bulkDeleteSources.mutate(selectedSourceIds);
                    onSelectionChange([]);
                  }
                }}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-2.5 w-2.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1 p-2.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs">
            <Clock className="h-4 w-4 animate-pulse mb-1" />
            Loading...
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-border/70 p-3">
            <FolderOpen className="h-6 w-6 text-muted-foreground/40 mb-1" />
            <p className="text-[11px] text-muted-foreground">No sources added</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddSourceOpen(true)}
              className="mt-2 h-6 text-[11px] px-2 gap-1"
            >
              <Plus className="h-2.5 w-2.5" /> Add
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredSources.map((source) => {
              const isSelected = selectedSourceIds.includes(source.id);
              return (
                <div
                  key={source.id}
                  className={`group flex items-center gap-2 rounded-xl border p-2 text-xs transition-all ${
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSourceSelection(source.id)}
                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Square className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <div
                    onClick={() => setPreviewSource(source)}
                    className="flex-1 min-w-0 cursor-pointer flex items-center gap-1.5"
                  >
                    {getSourceIcon(source.type)}
                    <span className="font-medium text-foreground truncate text-xs">
                      {source.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewSource(source)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                      title="View"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${source.title}"?`)) {
                          deleteSource.mutate(source.id);
                        }
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Add Source Modal */}
      <AddSourceDialog
        workspaceId={workspaceId}
        open={addSourceOpen}
        onOpenChange={setAddSourceOpen}
      />

      {/* Preview Dialog */}
      <SourcePreviewDialog
        source={previewSource}
        open={!!previewSource}
        onOpenChange={(open) => !open && setPreviewSource(null)}
      />
    </div>
  );
}
