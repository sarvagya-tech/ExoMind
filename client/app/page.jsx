"use client";

import * as React from "react";
import {
  Plus,
  Search,
  BookOpen,
  FolderPlus,
  Brain,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkspaceCard } from "@/components/dashboard/workspace-card";
import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaces } from "@/hooks/use-workspaces";

export default function DashboardPage() {
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const [createWsOpen, setCreateWsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");

  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch =
      ws.title.toLowerCase().includes(search.toLowerCase()) ||
      (ws.description || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "gpt-4o") return ws.defaultmodel === "gpt-4o";
    if (activeFilter === "gpt-4o-mini") return ws.defaultmodel === "gpt-4o-mini";
    if (activeFilter === "claude") return ws.defaultmodel?.includes("claude");
    return true;
  });

  return (
    <div className="min-h-screen flex bg-background font-mono">
      {/* Unified Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Minimal Clean Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Notebooks
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {workspaces.length} research workspace{workspaces.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8.5 h-9 text-xs bg-card"
              />
            </div>

            {/* New Notebook Button */}
            <Button
              onClick={() => setCreateWsOpen(true)}
              size="sm"
              className="gap-1.5 shrink-0 bg-primary text-primary-foreground font-medium h-9 px-3.5"
            >
              <Plus className="h-4 w-4" />
              <span>New Notebook</span>
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "gpt-4o", label: "GPT-4o" },
            { id: "gpt-4o-mini", label: "GPT-4o Mini" },
            { id: "claude", label: "Claude" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clean Workspace Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-border bg-card/40 animate-pulse p-5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Minimal Add Notebook Card */}
            <button
              type="button"
              onClick={() => setCreateWsOpen(true)}
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/20 p-6 text-center transition-all hover:border-primary/60 hover:bg-card/50 min-h-[150px] cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:scale-105 group-hover:text-primary transition-all mb-2 border border-border">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                New Notebook
              </p>
            </button>

            {/* Notebook Cards */}
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        )}

        {!isLoading && filteredWorkspaces.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border bg-card/20 p-6">
            <Search className="h-6 w-6 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              No notebooks match &ldquo;{search}&rdquo;
            </p>
          </div>
        )}
        </main>
      </div>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={createWsOpen}
        onOpenChange={setCreateWsOpen}
      />
    </div>
  );
}
