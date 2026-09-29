"use client";

import * as React from "react";
import { BookOpen, FileText, Sparkles, Brain } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useMemories } from "@/hooks/use-memories";

export function StatsBanner() {
  const { data: workspaces = [] } = useWorkspaces();
  const { data: memories = [] } = useMemories();

  const totalSources = workspaces.reduce(
    (acc, ws) => acc + (ws.sources?.length || ws._count?.sources || 0),
    0
  );

  const totalArtifacts = workspaces.reduce(
    (acc, ws) => acc + (ws.learningArtifacts?.length || ws._count?.learningArtifacts || 0),
    0
  );

  const stats = [
    {
      label: "Research Notebooks",
      value: workspaces.length,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Sources Indexed",
      value: totalSources,
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "AI Artifacts Generated",
      value: totalArtifacts,
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Mem0 Learned Insights",
      value: memories.length,
      icon: Brain,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/40 p-4 shadow-2xs backdrop-blur-xs transition-all hover:bg-card/70"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground truncate font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
