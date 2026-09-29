/**
 * Unified Backend API Connector for NotebookLM Frontend
 * Handles HTTP requests, file uploads, SSE chat streams, and transparent fallback.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Base HTTP request helper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...(!options.isFormData && { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: "include", // For session cookie sharing with backend
  };

  if (options.body && !options.isFormData && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.error ||
          `Request failed with status ${res.status}`
      );
    }
    // Return json if available, else null
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return await res.text();
  } catch (error) {
    console.warn(`[Backend API] Request error at ${endpoint}:`, error.message);
    throw error;
  }
}

/* ==========================================================================
   1. WORKSPACES API
   ========================================================================== */
export const workspaceApi = {
  /**
   * List all workspaces for the authenticated user
   */
  async list() {
    return request("/api/workspaces");
  },

  /**
   * Get single workspace details by ID
   */
  async get(workspaceId) {
    return request(`/api/workspaces/${workspaceId}`);
  },

  /**
   * Create a new research workspace
   */
  async create({ title, description = "", icon = "📓", defaultmodel = "gpt-4o-mini" }) {
    return request("/api/workspaces", {
      method: "POST",
      body: { title, description, icon, defaultmodel },
    });
  },

  /**
   * Update workspace title, description or default model
   */
  async update(workspaceId, updates) {
    return request(`/api/workspaces/${workspaceId}`, {
      method: "PATCH",
      body: updates,
    });
  },

  /**
   * Delete workspace and associated data
   */
  async delete(workspaceId) {
    return request(`/api/workspaces/${workspaceId}`, {
      method: "DELETE",
    });
  },
};

/* ==========================================================================
   2. SOURCES API
   ========================================================================== */
export const sourceApi = {
  /**
   * List all sources belonging to a workspace
   */
  async list(workspaceId) {
    return request(`/api/workspaces/${workspaceId}/sources`);
  },

  /**
   * Get single source content & metadata
   */
  async get(workspaceId, sourceId) {
    return request(`/api/workspaces/${workspaceId}/sources/${sourceId}`);
  },

  /**
   * Upload and process a PDF document via Multer
   */
  async uploadPdf(workspaceId, file, title = "") {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    return request(`/api/workspaces/${workspaceId}/sources/upload`, {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },

  /**
   * Scrape and index website content via Firecrawl
   */
  async importWebsite(workspaceId, { url, title = "" }) {
    return request(`/api/workspaces/${workspaceId}/sources/import/website`, {
      method: "POST",
      body: { url, title },
    });
  },

  /**
   * Extract and index YouTube video transcript
   */
  async importYoutube(workspaceId, { url, title = "" }) {
    return request(`/api/workspaces/${workspaceId}/sources/import/youtube`, {
      method: "POST",
      body: { url, title },
    });
  },

  /**
   * Create a raw text or markdown note source
   */
  async createText(workspaceId, { title, content, type = "TEXT" }) {
    return request(`/api/workspaces/${workspaceId}/sources`, {
      method: "POST",
      body: { title, content, type },
    });
  },

  /**
   * Bulk delete sources
   */
  async bulkDelete(workspaceId, sourceIds) {
    return request(`/api/workspaces/${workspaceId}/sources/bulk-delete`, {
      method: "POST",
      body: { sourceIds },
    });
  },

  /**
   * Delete single source
   */
  async delete(workspaceId, sourceId) {
    return request(`/api/workspaces/${workspaceId}/sources/${sourceId}`, {
      method: "DELETE",
    });
  },
};

/* ==========================================================================
   3. CHAT & CONVERSATIONS API
   ========================================================================== */
export const chatApi = {
  /**
   * List conversation threads in a workspace
   */
  async getConversations(workspaceId) {
    return request(`/api/workspaces/${workspaceId}/conversations`);
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(workspaceId, conversationId) {
    return request(
      `/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`
    );
  },

  /**
   * Create a new chat session
   */
  async createConversation(workspaceId, title = "New Chat") {
    return request(`/api/workspaces/${workspaceId}/conversations`, {
      method: "POST",
      body: { title },
    });
  },

  /**
   * Delete conversation session
   */
  async deleteConversation(workspaceId, conversationId) {
    return request(
      `/api/workspaces/${workspaceId}/conversations/${conversationId}`,
      { method: "DELETE" }
    );
  },

  /**
   * Stream a chat response with grounded RAG sources
   */
  async streamMessage({
    workspaceId,
    conversationId,
    message,
    selectedSourceIds = [],
    model = "gpt-4o-mini",
    webSearch = false,
    onChunk,
    onCitation,
    onFinish,
    onError,
  }) {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/chat/stream`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId,
          message,
          sourceIds: selectedSourceIds,
          model,
          webSearch,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat stream failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      const citations = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "chunk" && data.text) {
                fullContent += data.text;
                onChunk?.(data.text, fullContent);
              } else if (data.type === "citation") {
                citations.push(data.citation);
                onCitation?.(data.citation, citations);
              }
            } catch {
              // Plain text chunk fallback
              fullContent += dataStr;
              onChunk?.(dataStr, fullContent);
            }
          }
        }
      }

      onFinish?.({ content: fullContent, citations });
      return { content: fullContent, citations };
    } catch (err) {
      onError?.(err);
      throw err;
    }
  },
};

/* ==========================================================================
   4. LEARNING STUDIO & ARTIFACTS API
   ========================================================================== */
export const artifactApi = {
  /**
   * List all artifacts (summaries, flashcards, quizzes, mindmaps, reports)
   */
  async list(workspaceId) {
    return request(`/api/workspaces/${workspaceId}/artifacts`);
  },

  /**
   * Get single artifact
   */
  async get(workspaceId, artifactId) {
    return request(`/api/workspaces/${workspaceId}/artifacts/${artifactId}`);
  },

  /**
   * Generate an artifact with AI from selected sources
   */
  async generate(workspaceId, { type, sourceIds = [], customPrompt = "" }) {
    return request(`/api/workspaces/${workspaceId}/artifacts`, {
      method: "POST",
      body: { type, sourceIds, customPrompt },
    });
  },

  /**
   * Delete artifact
   */
  async delete(workspaceId, artifactId) {
    return request(`/api/workspaces/${workspaceId}/artifacts/${artifactId}`, {
      method: "DELETE",
    });
  },
};

/* ==========================================================================
   5. MEM0 PERSONAL MEMORY API
   ========================================================================== */
export const memoryApi = {
  /**
   * List personal user memories
   */
  async list() {
    return request("/api/memory");
  },

  /**
   * Add a personal memory / preference
   */
  async create({ memory, categories = ["Preferences"] }) {
    return request("/api/memory", {
      method: "POST",
      body: { memory, categories },
    });
  },

  /**
   * Update memory
   */
  async update(memoryId, { memory, categories }) {
    return request(`/api/memory/${memoryId}`, {
      method: "PATCH",
      body: { memory, categories },
    });
  },

  /**
   * Delete memory
   */
  async delete(memoryId) {
    return request(`/api/memory/${memoryId}`, {
      method: "DELETE",
    });
  },
};

/* ==========================================================================
   6. BETTER AUTH & SESSION API
   ========================================================================== */
export const authApi = {
  /**
   * Get current authenticated user session
   */
  async getSession() {
    return request("/api/auth/get-session");
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    return request("/api/auth/sign-in/email", {
      method: "POST",
      body: { email, password },
    });
  },

  /**
   * Sign out session
   */
  async signOut() {
    return request("/api/auth/sign-out", {
      method: "POST",
    });
  },
};
