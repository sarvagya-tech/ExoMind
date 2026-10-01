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

export function useChatStream({
  workspaceId,
  conversationId,
  selectedSourceIds,
  model = "gemini-3.5-flash",
  webSearch = false,
  onConversationCreated,
}) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamCitations, setStreamCitations] = useState([]);
  const [pendingUserMessage, setPendingUserMessage] = useState(null);

  const sendMessage = useCallback(
    async (content, existingMessages = []) => {
      if (!content.trim() || isStreaming) return;

      const newUserMessage = {
        id: `temp-${Date.now()}`,
        role: "USER",
        content,
        createdAt: new Date().toISOString(),
      };

      setPendingUserMessage(newUserMessage);
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
          onChunk: (text, citations) => {
            setStreamedText(text);
            if (Array.isArray(citations) && citations.length > 0) {
              setStreamCitations(citations);
            }
          },
          onDone: (finalText, citations, newConvId) => {
            const activeConvId = newConvId || conversationId;

            // Optimistically update messages in cache
            if (activeConvId && finalText) {
              queryClient.setQueryData(chatKeys.messages(workspaceId, activeConvId), (old = []) => [
                ...old.filter((m) => m.id !== newUserMessage.id),
                newUserMessage,
                {
                  id: `msg-${Date.now()}-assistant`,
                  conversationId: activeConvId,
                  role: "ASSISTANT",
                  content: finalText,
                  citations: Array.isArray(citations) ? citations : [],
                  createdAt: new Date().toISOString(),
                },
              ]);
            }

            setPendingUserMessage(null);
            setStreamedText("");
            setStreamCitations([]);
            setIsStreaming(false);

            if (newConvId && onConversationCreated) {
              onConversationCreated(newConvId);
            }

            queryClient.invalidateQueries({ queryKey: chatKeys.messages(workspaceId, activeConvId) });
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations(workspaceId) });
          },
          onError: (err) => {
            console.error("Stream error:", err);
            setPendingUserMessage(null);
            setIsStreaming(false);
          },
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        setPendingUserMessage(null);
        setIsStreaming(false);
      }
    },
    [workspaceId, conversationId, selectedSourceIds, model, webSearch, isStreaming, queryClient, onConversationCreated]
  );

  return {
    sendMessage,
    isStreaming,
    streamedText,
    streamCitations,
    pendingUserMessage,
  };
}
