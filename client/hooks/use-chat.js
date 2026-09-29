import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api-client";

export const chatKeys = {
  conversations: (workspaceId) => ["conversations", workspaceId],
  messages: (workspaceId, conversationId) => ["messages", workspaceId, conversationId],
};

export function useConversations(workspaceId) {
  return useQuery({
    queryKey: chatKeys.conversations(workspaceId),
    queryFn: () => chatApi.listConversations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useMessages(workspaceId, conversationId) {
  return useQuery({
    queryKey: chatKeys.messages(workspaceId, conversationId),
    queryFn: () => chatApi.getMessages(workspaceId, conversationId),
    enabled: !!workspaceId && !!conversationId,
  });
}

export function useCreateConversation(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title) => chatApi.createConversation(workspaceId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations(workspaceId) });
    },
  });
}

export function useDeleteConversation(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId) => chatApi.deleteConversation(workspaceId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations(workspaceId) });
    },
  });
}

export function useChatStream({ workspaceId, conversationId, selectedSourceIds, model = "gpt-4o-mini", webSearch = false }) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = ReactStateStream();
  const [streamedText, setStreamedText] = useState("");
  const [streamCitations, setStreamCitations] = useState([]);

  const sendMessage = useCallback(
    async (content, existingMessages = []) => {
      if (!content.trim() || isStreaming) return;

      const newUserMessage = {
        id: `temp-${Date.now()}`,
        role: "USER",
        content,
        createdAt: new Date().toISOString(),
      };

      const updatedMessages = [...existingMessages, newUserMessage];
      setStreamedText("");
      setStreamCitations([]);
      setIsStreaming(true);

      try {
        await chatApi.sendMessage({
          workspaceId,
          conversationId,
          messages: updatedMessages,
          model,
          webSearch,
          selectedSourceIds,
          onChunk: (text) => {
            setStreamedText(text);
          },
          onDone: (finalText, citations, newConvId) => {
            setStreamedText("");
            setStreamCitations([]);
            setIsStreaming(false);

            const activeConvId = newConvId || conversationId;
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(workspaceId, activeConvId) });
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations(workspaceId) });
          },
          onError: (err) => {
            console.error("Stream error:", err);
            setIsStreaming(false);
          },
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        setIsStreaming(false);
      }
    },
    [workspaceId, conversationId, selectedSourceIds, model, webSearch, isStreaming, queryClient]
  );

  return {
    sendMessage,
    isStreaming,
    streamedText,
    streamCitations,
  };
}

function ReactStateStream() {
  return useState(false);
}
