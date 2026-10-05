"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Brain,
  ChevronRight,
  FolderOpen,
  LogOut,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthUser, useSignOut } from "@/hooks/use-auth";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { MemoryDialog } from "@/components/memory/memory-dialog";
import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog";

export function Header({ currentWorkspace = null }) {
  const router = useRouter();
  const { data: authData } = useAuthUser();
  const { data: workspaces = [] } = useWorkspaces();
  const signOut = useSignOut();

  const [memoryOpen, setMemoryOpen] = React.useState(false);
  const [createWsOpen, setCreateWsOpen] = React.useState(false);

  const user = authData?.user;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md transition-all">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-5xl mx-auto w-full">
          {/* Left: Brand & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-foreground text-sm sm:text-base">
                  Exo<span className="text-primary font-bold">Mind</span>
                </span>
                <span className="hidden sm:inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                  AI
                </span>
              </div>
            </Link>

            {currentWorkspace && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pl-2 border-l border-border">
                <ChevronRight className="h-4 w-4 opacity-40" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-foreground font-medium hover:bg-muted/80"
                    >
                      <span className="text-base">{currentWorkspace.icon || "📓"}</span>
                      <span className="max-w-[140px] sm:max-w-[200px] truncate">
                        {currentWorkspace.title}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="left" className="w-56">
                    <DropdownMenuLabel>Switch Notebook</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {workspaces.map((ws) => (
                      <DropdownMenuItem
                        key={ws.id}
                        onClick={() => router.push(`/workspace/${ws.id}`)}
                        className="gap-2 cursor-pointer"
                      >
                        <span className="text-sm">{ws.icon || "📓"}</span>
                        <span className="truncate flex-1">{ws.title}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCreateWsOpen(true)}
                      className="gap-2 text-primary font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>New Notebook</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Right: Actions, Memory Bank, Theme, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Memory Manager Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMemoryOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium border-border bg-background hover:bg-muted hover:border-primary/50"
            >
              <Brain className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Memory Bank</span>
            </Button>

            {/* Mode Toggle */}
            <ModeToggle />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 p-0"
                >
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={user?.image} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-muted text-foreground font-medium text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="right" className="w-52">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 overflow-hidden">
                    <p className="text-xs font-semibold truncate text-foreground">
                      {user?.name || "Alex Vance"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.email || "alex.vance@example.com"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/about")}>
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                  <span>About ExoMind</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMemoryOpen(true)}>
                  <Brain className="h-3.5 w-3.5 mr-2 text-purple-500" />
                  <span>Personal Memories</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <FolderOpen className="h-3.5 w-3.5 mr-2" />
                  <span>All Notebooks</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut.mutate()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Memory Manager Modal */}
      <MemoryDialog open={memoryOpen} onOpenChange={setMemoryOpen} />

      {/* Create Workspace Modal */}
      <CreateWorkspaceDialog
        open={createWsOpen}
        onOpenChange={setCreateWsOpen}
      />
    </>
  );
}
