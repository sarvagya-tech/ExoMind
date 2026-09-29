"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Bot, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WORKSPACE_ICONS, AI_MODELS } from "@/lib/constants";
import { useCreateWorkspace } from "@/hooks/use-workspaces";

export function CreateWorkspaceDialog({ open, onOpenChange }) {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState("🧠");
  const [selectedModel, setSelectedModel] = React.useState("gpt-4o-mini");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createWorkspace.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        icon: selectedIcon,
        defaultmodel: selectedModel,
      },
      {
        onSuccess: (newWs) => {
          onOpenChange(false);
          setTitle("");
          setDescription("");
          setSelectedIcon("🧠");
          if (newWs?.id) {
            router.push(`/workspace/${newWs.id}`);
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create New Notebook</DialogTitle>
              <DialogDescription>
                Set up a dedicated source-grounded research workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Title & Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Notebook Name
            </label>
            <div className="flex gap-2">
              <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-border bg-muted text-xl">
                {selectedIcon}
              </div>
              <Input
                placeholder="e.g. AI Optimization & Benchmark Analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground">
              Choose Icon
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-muted/40 border border-border max-h-24 overflow-y-auto">
              {WORKSPACE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 ${
                    selectedIcon === icon
                      ? "bg-card shadow-xs ring-2 ring-primary scale-105"
                      : "hover:bg-card/60"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description (Optional)
            </label>
            <Textarea
              placeholder="Brief summary of research goals, scope, and documents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] text-xs sm:text-sm"
            />
          </div>

          {/* Default AI Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-blue-500" /> Default Intelligence Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AI_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {m.name}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {m.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWorkspace.isPending || !title.trim()}
              className="bg-primary text-primary-foreground font-medium"
            >
              {createWorkspace.isPending ? "Creating..." : "Create Notebook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
