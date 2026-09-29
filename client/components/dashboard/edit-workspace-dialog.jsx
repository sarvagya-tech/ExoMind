"use client";

import * as React from "react";
import { Bot, Check, Trash2, Sparkles } from "lucide-react";
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
import { useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/use-workspaces";

export function EditWorkspaceDialog({ workspace, open, onOpenChange }) {
  const updateWorkspace = useUpdateWorkspace(workspace?.id);
  const deleteWorkspace = useDeleteWorkspace();

  const [title, setTitle] = React.useState(workspace?.title || "");
  const [description, setDescription] = React.useState(workspace?.description || "");
  const [selectedIcon, setSelectedIcon] = React.useState(workspace?.icon || "📓");
  const [selectedModel, setSelectedModel] = React.useState(
    workspace?.defaultmodel || "gpt-4o-mini"
  );

  React.useEffect(() => {
    if (workspace) {
      setTitle(workspace.title || "");
      setDescription(workspace.description || "");
      setSelectedIcon(workspace.icon || "📓");
      setSelectedModel(workspace.defaultmodel || "gpt-4o-mini");
    }
  }, [workspace]);

  if (!workspace) return null;

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateWorkspace.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        icon: selectedIcon,
        defaultmodel: selectedModel,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${workspace.title}"?`)) {
      deleteWorkspace.mutate(workspace.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-2xl border border-border">
                {selectedIcon}
              </div>
              <div>
                <DialogTitle className="text-xl">Notebook Settings</DialogTitle>
                <DialogDescription>
                  Update workspace details, icon, and default model.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 my-2">
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notebook title..."
                className="flex-1"
                required
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope and research goals..."
              className="min-h-[60px] text-xs sm:text-sm"
            />
          </div>

          {/* Default Model */}
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

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-3 border-t border-border">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-1 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Notebook
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateWorkspace.isPending || !title.trim()}
                className="bg-primary text-primary-foreground font-medium"
              >
                {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
