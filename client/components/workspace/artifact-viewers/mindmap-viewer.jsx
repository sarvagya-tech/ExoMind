"use client";

import * as React from "react";
import {
  Network,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Plus,
  Minus,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function MindMapNodeItem({ node, level = 0 }) {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const levelColors = [
    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm",
    "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  ];

  const nodeStyle = levelColors[level % levelColors.length];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-transform"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <div
          className={`flex flex-col rounded-xl border p-2.5 px-3 text-xs sm:text-sm font-medium transition-all shadow-2xs ${nodeStyle}`}
        >
          <span className="font-semibold">{node.label}</span>
          {node.description && (
            <span className="text-[11px] opacity-80 mt-0.5 font-normal">
              {node.description}
            </span>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 pl-4 border-l-2 border-border/80 space-y-2.5 mt-1 animate-in fade-in-50 duration-150">
          {node.children.map((childNode) => (
            <MindMapNodeItem
              key={childNode.id || childNode.label}
              node={childNode}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MindmapViewer({ artifact }) {
  const rootNode = artifact?.content?.mindmap || {
    label: artifact?.title || "Central Concept",
    children: [],
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 rounded-2xl border border-border bg-card/60 backdrop-blur-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Interactive Concept Hierarchy
          </span>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Expandable Nodes
        </Badge>
      </div>

      <div className="py-2 overflow-x-auto">
        <MindMapNodeItem node={rootNode} level={0} />
      </div>
    </div>
  );
}
