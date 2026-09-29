"use client";

import * as React from "react";
import { Brain, Plus, Trash2, Sparkles, Tag, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMemories, useCreateMemory, useDeleteMemory } from "@/hooks/use-memories";

export function MemoryDialog({ open, onOpenChange }) {
  const { data: memories = [], isLoading } = useMemories();
  const createMemory = useCreateMemory();
  const deleteMemory = useDeleteMemory();

  const [search, setSearch] = React.useState("");
  const [newMemoryText, setNewMemoryText] = React.useState("");
  const [category, setCategory] = React.useState("Preferences");
  const [isAdding, setIsAdding] = React.useState(false);

  const filteredMemories = memories.filter((m) =>
    (m.memory || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    createMemory.mutate(
      {
        memory: newMemoryText.trim(),
        categories: [category],
      },
      {
        onSuccess: () => {
          setNewMemoryText("");
          setIsAdding(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Mem0 Personal Memory Bank</DialogTitle>
              <DialogDescription>
                Persistent AI memory that learns your preferences and context across all notebooks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Action & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs sm:text-sm"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="gap-1.5 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{isAdding ? "Cancel" : "Add Memory"}</span>
          </Button>
        </div>

        {/* Add Memory Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Teach AI a fact or preference
              </span>
              <div className="flex gap-1.5">
                {["Preferences", "Goals", "Context", "Formatting"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                      category === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="e.g. Always format mathematical formulas using LaTeX. I am studying for an advanced machine learning qualification."
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              className="text-xs sm:text-sm min-h-[70px] bg-background"
              required
            />

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createMemory.isPending || !newMemoryText.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
              >
                {createMemory.isPending ? "Saving..." : "Save Memory"}
              </Button>
            </div>
          </form>
        )}

        {/* Memories List */}
        <div className="mt-2 max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <Brain className="h-6 w-6 animate-pulse mb-2 text-purple-500" />
              Loading memories...
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border p-6">
              <Brain className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">No memories found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                As you chat with your notebooks, the AI will automatically extract key preferences, or you can add them manually.
              </p>
            </div>
          ) : (
            filteredMemories.map((m) => (
              <div
                key={m.id}
                className="group relative flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3.5 text-xs sm:text-sm transition-all hover:border-purple-500/30 hover:shadow-xs"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-purple-500" />
                    {m.categories && m.categories.length > 0 && (
                      <Badge variant="purple" className="text-[10px] py-0 px-1.5">
                        {m.categories[0]}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : "Active"}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed pl-4 font-normal">
                    {m.memory}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteMemory.mutate(m.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete memory"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
