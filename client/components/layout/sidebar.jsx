"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  FileText,
  Layers,
  Brain,
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  Network,
  ListChecks,
  Globe,
  Video,
  FileCode,
  LogOut,
  ChevronDown,
  Trash2,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useSources } from "@/hooks/use-sources";
import { useConversations, useCreateConversation } from "@/hooks/use-chat";
import { useAuthUser, useSignOut } from "@/hooks/use-auth";
import { MemoryDialog } from "@/components/memory/memory-dialog";
import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog";
import { AddSourceDialog } from "@/components/workspace/add-source-dialog";
import { GoogleAuthDialog } from "@/components/auth/google-auth-dialog";

export function Sidebar({
  currentWorkspace = null,
  activeSection = "chat", // "chat" | "sources" | "studio"
  onSectionChange = () => {},
  sourcesOpen = false,
  onToggleSources = () => {},
  studioOpen = false,
  onToggleStudio = () => {},
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Dialog states
  const [createWsOpen, setCreateWsOpen] = React.useState(false);
  const [addSourceOpen, setAddSourceOpen] = React.useState(false);
  const [memoryOpen, setMemoryOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);

  // Data queries
  const { data: workspaces = [] } = useWorkspaces();
  const workspaceId = currentWorkspace?.id;
  const { data: sources = [] } = useSources(workspaceId);
  const { data: conversations = [] } = useConversations(workspaceId);
  const createConversation = useCreateConversation(workspaceId);
  const { data: authData } = useAuthUser();
  const signOut = useSignOut();

  const user = authData?.user;
  const isInsideWorkspace = !!currentWorkspace;

  const getSourceIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
      case "WEBSITE":
        return <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      case "YOUTUBE":
        return <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      default:
        return <FileCode className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-card/70 backdrop-blur-md border-r border-border font-mono text-xs select-none">
      {/* Top Brand Header */}
      <div>
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="font-semibold tracking-tight text-foreground text-sm truncate">
                  Notebook<span className="text-primary font-bold">LM</span>
                </span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-semibold text-primary border border-primary/20">
                  Studio
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-7 w-7 text-muted-foreground hover:text-foreground"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(false)}
            className="md:hidden h-7 w-7 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Navigation Sections */}
        <ScrollArea className={`${collapsed ? "h-[calc(100vh-140px)]" : "h-[calc(100vh-140px)]"} px-2 py-3`}>
          <div className="space-y-4">
            {/* WORKSPACES SECTION */}
            <div className="space-y-1">
              {!collapsed ? (
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Workspaces</span>
                  <button
                    onClick={() => setCreateWsOpen(true)}
                    className="p-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    title="New workspace"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center py-1">
                  <span className="text-[9px] font-semibold text-muted-foreground">WS</span>
                </div>
              )}

              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === "/dashboard"
                    ? "bg-primary/15 text-primary font-semibold border border-primary/25 shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                } ${collapsed ? "justify-center px-2" : ""}`}
                title="All Notebooks"
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1">All Notebooks</span>
                )}
                {!collapsed && workspaces.length > 0 && (
                  <span className="text-[10px] opacity-70 font-mono">
                    {workspaces.length}
                  </span>
                )}
              </Link>

              {/* Workspaces List */}
              {workspaces.slice(0, 5).map((ws) => {
                const isActive = ws.id === workspaceId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => router.push(`/workspace/${ws.id}`)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-primary/15 text-primary font-semibold border border-primary/25 shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title={ws.title}
                  >
                    <span className="text-sm shrink-0">{ws.icon || "📓"}</span>
                    {!collapsed && (
                      <span className="truncate flex-1 text-xs">{ws.title}</span>
                    )}
                  </button>
                );
              })}

              {!collapsed && (
                <button
                  onClick={() => setCreateWsOpen(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-primary font-medium hover:bg-primary/10 transition-colors mt-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Notebook</span>
                </button>
              )}
            </div>

            {/* IF INSIDE A WORKSPACE: SHOW CHAT, SOURCES, STUDIO */}
            {isInsideWorkspace && (
              <>
                <div className="h-px bg-border my-2" />

                {/* ACTIVE NOTEBOOK NAVIGATION */}
                <div className="space-y-1">
                  {!collapsed && (
                    <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Notebook Sections
                    </div>
                  )}

                  {/* 💬 CHAT TAB */}
                  <button
                    onClick={() => onSectionChange("chat")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer ${
                      activeSection === "chat" && !sourcesOpen && !studioOpen
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title="Chat Canvas"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate flex-1">Chat Canvas</span>
                    )}
                  </button>

                  {/* 📁 SOURCES TAB / DRAWER */}
                  <button
                    onClick={onToggleSources}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer ${
                      sourcesOpen
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title="Sources"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate flex-1">Sources</span>
                    )}
                    {!collapsed && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/40 font-mono">
                        {sources.length}
                      </span>
                    )}
                  </button>

                  {/* 🪄 STUDIO TOOLS TAB / DRAWER */}
                  <button
                    onClick={onToggleStudio}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer ${
                      studioOpen
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title="Studio & Tools"
                  >
                    <Layers className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate flex-1">Studio & Tools</span>
                    )}
                  </button>
                </div>

                {/* QUICK SOURCES LIST (When Expanded) */}
                {!collapsed && sources.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Sources List</span>
                      <button
                        onClick={() => setAddSourceOpen(true)}
                        className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>

                    <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                      {sources.slice(0, 4).map((source) => (
                        <div
                          key={source.id}
                          onClick={onToggleSources}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer text-[11px]"
                        >
                          {getSourceIcon(source.type)}
                          <span className="truncate flex-1">{source.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Actions & User Profile */}
      <div className="p-3 pb-6 border-t border-border space-y-2 bg-card/40">
        {/* About NotebookLM Page Link */}
        <Link
          href="/about"
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left ${
            pathname === "/about" || pathname === "/"
              ? "bg-primary/15 text-primary font-semibold border border-primary/25 shadow-2xs"
              : ""
          } ${collapsed ? "justify-center px-2" : ""}`}
          title="About NotebookLM"
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          {!collapsed && (
            <span className="truncate flex-1 font-medium">About NotebookLM</span>
          )}
        </Link>

        {/* Memory Bank Button */}
        <button
          onClick={() => setMemoryOpen(true)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left cursor-pointer ${
            collapsed ? "justify-center px-2" : ""
          }`}
          title="Memory Bank"
        >
          <Brain className="h-4 w-4 text-emerald-500 shrink-0" />
          {!collapsed && (
            <span className="truncate flex-1 font-medium">Memory Bank</span>
          )}
        </button>

        {/* Theme & User Profile Bar */}
        <div className={`flex items-center justify-between pt-1 ${collapsed ? "flex-col gap-2" : "px-1"}`}>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity text-left cursor-pointer outline-none max-w-[170px]"
                >
                  <Avatar className="w-7 h-7 border border-border shrink-0">
                    <AvatarImage src={user?.image} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col overflow-hidden leading-tight min-w-0">
                      <span className="font-semibold text-foreground text-xs truncate">
                        {user?.name || "User"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-mono text-xs p-1.5">
                <div className="px-2 py-1.5 border-b border-border/60 mb-1">
                  <p className="font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={() => setMemoryOpen(true)}
                  className="cursor-pointer gap-2"
                >
                  <Brain className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Memory Bank</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut.mutate()}
                  className="cursor-pointer gap-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAuthOpen(true)}
              className="gap-1.5 text-xs font-semibold border-border h-8 px-2.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {!collapsed && <span>Sign In</span>}
            </Button>
          )}

          <div className="flex items-center gap-1">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateWorkspaceDialog
        open={createWsOpen}
        onOpenChange={setCreateWsOpen}
      />
      <AddSourceDialog
        workspaceId={workspaceId}
        open={addSourceOpen}
        onOpenChange={setAddSourceOpen}
      />
      <MemoryDialog open={memoryOpen} onOpenChange={setMemoryOpen} />
      <GoogleAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectUrl={pathname && pathname !== "/" ? pathname : "/dashboard"}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-200 shrink-0 h-screen sticky top-0 z-30 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger (Floating) */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setMobileOpen(true)}
          className="h-8 w-8 bg-card/90 backdrop-blur-md shadow-sm border-border"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
