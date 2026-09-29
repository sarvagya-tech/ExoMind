"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Sparkles,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EditWorkspaceDialog } from "@/components/dashboard/edit-workspace-dialog";
import { formatRelativeTime } from "@/lib/utils";
import { useDeleteWorkspace } from "@/hooks/use-workspaces";

export function WorkspaceCard({ workspace }) {
  const router = useRouter();
  const deleteWorkspace = useDeleteWorkspace();
  const [editOpen, setEditOpen] = React.useState(false);

  const sourceCount =
    workspace.sources?.length || workspace._count?.sources || 0;
  const artifactCount =
    workspace.learningArtifacts?.length ||
    workspace._count?.learningArtifacts ||
    0;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${workspace.title}"?`)) {
      deleteWorkspace.mutate(workspace.id);
    }
  };

  return (
    <>
      <Card className="group relative flex flex-col justify-between overflow-hidden border border-border bg-card/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs min-h-[140px]">
        <Link href={`/workspace/${workspace.id}`} className="block flex-1 p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            {/* Icon & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-xl border border-border/70 transition-transform group-hover:scale-105">
                {workspace.icon || "📓"}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  <span>{workspace.title}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground font-mono">
                  <span>
                    {formatRelativeTime(
                      workspace.updatedAt || workspace.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-40 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="right" className="w-40">
                  <DropdownMenuItem
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    <span>Open</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    <span>Rename / Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Link>

        {/* Minimal Footer */}
        <CardFooter className="flex items-center justify-between border-t border-border/40 p-2.5 px-4 bg-muted/10 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-500" />
              <span>{sourceCount} source{sourceCount === 1 ? "" : "s"}</span>
            </span>
            {artifactCount > 0 && (
              <span className="flex items-center gap-1 pl-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span>{artifactCount}</span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-muted-foreground font-mono uppercase">
            {workspace.defaultmodel?.replace("gpt-", "") || "GPT-4o"}
          </span>
        </CardFooter>
      </Card>

      {/* Edit Workspace Dialog */}
      <EditWorkspaceDialog
        workspace={workspace}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
