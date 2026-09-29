"use client";

import * as React from "react";
import {
  Send,
  Sparkles,
  Globe,
  Bot,
  Plus,
  MessageSquare,
  ChevronDown,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChatMessage } from "@/components/workspace/chat-message";
import { CitationsDrawer } from "@/components/workspace/citations-drawer";
import { AI_MODELS, PROMPT_STARTERS } from "@/lib/constants";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  useDeleteConversation,
  useChatStream,
} from "@/hooks/use-chat";

export function ChatPanel({
  workspaceId,
  selectedSourceIds,
  defaultModel = "gpt-4o-mini",
}) {
  const { data: conversations = [] } = useConversations(workspaceId);
  const [selectedConvId, setSelectedConvId] = React.useState(null);
  const [model, setModel] = React.useState(defaultModel);
  const [webSearch, setWebSearch] = React.useState(false);
  const [inputText, setInputText] = React.useState("");
  const [activeCitation, setActiveCitation] = React.useState(null);

  const messagesEndRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  const activeConvId = selectedConvId || (conversations[0]?.id ?? null);
  const { data: messages = [] } = useMessages(
    workspaceId,
    activeConvId
  );

  const createConversation = useCreateConversation(workspaceId);
  const deleteConversation = useDeleteConversation(workspaceId);

  const { sendMessage, isStreaming, streamedText, streamCitations } = useChatStream({
    workspaceId,
    conversationId: activeConvId,
    selectedSourceIds,
    model,
    webSearch,
  });

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedText]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isStreaming) return;
    setInputText("");
    sendMessage(text.trim(), messages);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    createConversation.mutate("New Chat", {
      onSuccess: (newConv) => {
        setSelectedConvId(newConv.id);
      },
    });
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const selectedModelObj = AI_MODELS.find((m) => m.id === model) || AI_MODELS[0];

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Minimal Top Controls */}
      <div className="flex items-center justify-between py-2 px-1">
        {/* Conversation Selector */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs font-semibold text-foreground hover:bg-muted/70"
              >
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[130px] sm:max-w-[180px] truncate">
                  {activeConv?.title || "Chat"}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="left" className="w-52">
              <DropdownMenuLabel>Chat Sessions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {conversations.map((conv) => (
                <DropdownMenuItem
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`flex items-center justify-between text-xs cursor-pointer ${
                    conv.id === activeConvId ? "bg-muted font-semibold" : ""
                  }`}
                >
                  <span className="truncate flex-1">{conv.title || "Untitled Chat"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this conversation?")) {
                        deleteConversation.mutate(conv.id);
                      }
                    }}
                    className="p-0.5 text-muted-foreground hover:text-destructive rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleNewChat}
                className="gap-2 text-primary font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Conversation</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleNewChat}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="New chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Model & Web Search Options */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWebSearch(!webSearch)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              webSearch
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
            title="Web search"
          >
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline text-[11px]">Web</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs font-medium bg-muted/60 hover:bg-muted"
              >
                <Bot className="h-3 w-3" />
                <span className="text-[11px]">{selectedModelObj.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" className="w-48">
              <DropdownMenuLabel>Intelligence Model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AI_MODELS.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="font-semibold text-foreground">{m.name}</span>
                  {model === m.id && (
                    <Check className="h-3 w-3 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Stream */}
      <ScrollArea className="flex-1 py-4 px-1 sm:px-2">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Ask anything about your sources
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Responses are grounded in verified citations.
              </p>
            </div>

            {/* Prompt Starters - Minimal & Clean */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pt-2">
              {PROMPT_STARTERS.slice(0, 4).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full bg-muted/50 hover:bg-muted px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer text-left"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onCitationClick={setActiveCitation}
              />
            ))}

            {isStreaming && (
              <ChatMessage
                message={{
                  id: "streaming",
                  role: "ASSISTANT",
                  content: streamedText || "Thinking...",
                  citations: streamCitations,
                }}
                onCitationClick={setActiveCitation}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Seamless Boxless Chat Input */}
      <div className="pt-2 pb-3 px-2 sm:px-4 border-t border-border/40 bg-background/80 backdrop-blur-xs">
        <div className="max-w-3xl mx-auto flex flex-col gap-1">
          <div className="flex items-end gap-2 bg-transparent">
            <Textarea
              ref={textareaRef}
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] max-h-[160px] flex-1 border-0 bg-transparent px-0 py-2 text-sm shadow-none focus-visible:ring-0 resize-none outline-none placeholder:text-muted-foreground/60"
              rows={1}
            />

            <Button
              size="sm"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isStreaming}
              className="h-9 w-9 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-20 transition-all shrink-0 active:scale-95 mb-0.5"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 px-0">
            <span className="font-mono text-[10px]">
              {selectedSourceIds.length} source{selectedSourceIds.length === 1 ? "" : "s"} active
            </span>
            <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>

      {/* Citations Drawer */}
      <CitationsDrawer
        citation={activeCitation}
        open={!!activeCitation}
        onOpenChange={(open) => !open && setActiveCitation(null)}
      />
    </div>
  );
}
